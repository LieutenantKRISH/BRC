import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";

// ===== Interfaces =====
export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  deadline: string;
  progress: number;
  status: "In Progress" | "Completed" | "On Hold";
  assignedMembers: string[];
  client: string;
  tasks: {
    id: string;
    name: string;
    completed: boolean;
    assignedMembers: string[];
    notes: string;
  }[];
  revenue: number;
}

export interface Task {
  id: string;
  name: string;
  completed: boolean;
  assignedMembers: string[];
  notes: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: string[];
  client: string;
  description: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string; // ✅ Added phone
  projects: string[];
}

interface User {
  email: string;
  isManagement: boolean;
}

interface AppContextType {
  user: User | null;
  projects: Project[];
  tasks: Task[];
  meetings: Meeting[];
  clients: Client[];
  login: (email: string) => void;
  logout: () => void;
  addProject: (project: Omit<Project, "id">) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  addMeeting: (meeting: Omit<Meeting, "id">) => Promise<void>;
  addClient: (client: Omit<Client, "id">) => Promise<void>;
  fetchAll: () => Promise<void>;
}

// ===== Context =====
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // ===== Auth =====
  const login = (email: string) => {
    const isManagement = email.toLowerCase() === "guest1.management@brc.com";
    setUser({ email, isManagement });
  };

  const logout = () => {
    setUser(null);
  };

  // ===== Combined Fetch =====
  const fetchAll = async () => {
    const [
      { data: proj, error: projErr },
      { data: tsk, error: tskErr },
      { data: meet, error: meetErr },
      { data: cli, error: cliErr },
    ] = await Promise.all([
      supabase.from("projects").select("*"),
      supabase.from("tasks").select("*"),
      supabase.from("meetings").select("*"),
      supabase.from("clients").select("*"),
    ]);

    if (!projErr && proj) setProjects(proj as Project[]);
    if (!tskErr && tsk) setTasks(tsk as Task[]);
    if (!meetErr && meet) setMeetings(meet as Meeting[]);
    if (!cliErr && cli) {
      // ✅ Map contact_info from Supabase to email/phone
      const mappedClients: Client[] = (cli as any[]).map(c => ({
        id: c.id,
        name: c.name,
        email: c.contact_info?.email || "",
        phone: c.contact_info?.phone || "",
        projects: c.projects || [],
      }));
      setClients(mappedClients);
    }
  };

  // ===== Add & Update Functions =====
  const addProject = async (project: Omit<Project, "id">) => {
    const { error } = await supabase.from("projects").insert([project]);
    if (!error) await fetchAll();
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const { error } = await supabase.from("projects").update(updates).eq("id", id);
    if (!error) await fetchAll();
  };

  const addMeeting = async (meeting: Omit<Meeting, "id">) => {
    const { error } = await supabase.from("meetings").insert([meeting]);
    if (!error) await fetchAll();
  };

  const addClient = async (client: Omit<Client, "id">) => {
    const { error } = await supabase.from("clients").insert([
      {
        name: client.name,
        contact_info: {
          email: client.email || "",
          phone: client.phone || "",
        },
        projects: client.projects || [],
      }
    ]);
    if (!error) await fetchAll();
  };

  // ===== Initial Fetch + Live Updates =====
  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel("public-changes")
      .on("postgres_changes", { event: "*", schema: "public" }, fetchAll)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        projects,
        tasks,
        meetings,
        clients,
        login,
        logout,
        addProject,
        updateProject,
        addMeeting,
        addClient,
        fetchAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// ===== Hook =====
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
