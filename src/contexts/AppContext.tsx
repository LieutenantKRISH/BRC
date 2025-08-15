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
  phone?: string;
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
    try {
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

      if (projErr) {
        console.error("Error fetching projects:", projErr);
      } else if (proj) {
        setProjects(proj as Project[]);
      }

      if (tskErr) {
        console.error("Error fetching tasks:", tskErr);
      } else if (tsk) {
        setTasks(tsk as Task[]);
      }

      if (meetErr) {
        console.error("Error fetching meetings:", meetErr);
      } else if (meet) {
        setMeetings(meet as Meeting[]);
      }

      if (cliErr) {
        console.error("Error fetching clients:", cliErr);
      } else if (cli) {
        // Map contact_info from Supabase to email/phone
        const mappedClients: Client[] = (cli as any[]).map(c => ({
          id: c.id,
          name: c.name,
          email: c.contact_info?.email || "",
          phone: c.contact_info?.phone || "",
          projects: c.projects || [],
        }));
        setClients(mappedClients);
      }
    } catch (error) {
      console.error("Error in fetchAll:", error);
    }
  };

  // ===== Add & Update Functions =====
  const addProject = async (project: Omit<Project, "id">) => {
    try {
      console.log("Adding project:", project);
      
      // Transform the data to match Supabase schema
      const projectData = {
        name: project.name,
        description: project.description,
        start_date: project.startDate, // Map to snake_case if needed
        deadline: project.deadline,
        progress: project.progress,
        status: project.status,
        assigned_members: project.assignedMembers, // Map to snake_case if needed
        client: project.client,
        tasks: project.tasks,
        revenue: project.revenue,
        created_at: new Date().toISOString()
    
      };

      const { data, error } = await supabase
        .from("projects")
        .insert([projectData])
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Project added successfully:", data);
      await fetchAll();
    } catch (error) {
      console.error("Error adding project:", error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      console.log("Updating project:", id, updates);
      
      // Transform updates to match Supabase schema
      const updateData = {
        ...updates,
        // updated_at: new Date().toISOString(),
        // Map camelCase to snake_case if needed
        ...(updates.startDate && { start_date: updates.startDate }),
        ...(updates.assignedMembers && { assigned_members: updates.assignedMembers }),
      };

      const { error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", id);

      if (error) {
        console.error("Error updating project:", error);
        throw error;
      }

      await fetchAll();
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  };

  const addMeeting = async (meeting: Omit<Meeting, "id">) => {
    try {
      console.log("Adding meeting:", meeting);
      
      const { error } = await supabase
        .from("meetings")
        .insert([{
          ...meeting,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        console.error("Error adding meeting:", error);
        throw error;
      }

      await fetchAll();
    } catch (error) {
      console.error("Error adding meeting:", error);
      throw error;
    }
  };

  const addClient = async (client: Omit<Client, "id">) => {
    try {
      console.log("Adding client:", client);
      
      const { error } = await supabase
        .from("clients")
        .insert([{
          name: client.name,
          contact_info: {
            email: client.email || "",
            phone: client.phone || "",
          },
          projects: client.projects || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        console.error("Error adding client:", error);
        throw error;
      }

      await fetchAll();
    } catch (error) {
      console.error("Error adding client:", error);
      throw error;
    }
  };

  // ===== Initial Fetch + Live Updates =====
  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel("public-changes")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        console.log("Database change detected, refetching...");
        fetchAll();
      })
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
