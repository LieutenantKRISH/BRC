import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import ProjectCard from '@/components/ProjectCard';
import StatsCard from '@/components/StatsCard';
import AddProjectModal from '@/components/AddProjectModal';
import AddMeetingModal from '@/components/AddMeetingModal';
import AddClientModal from '@/components/AddClientModal';
import { 
  Building2, 
  Plus, 
  Calendar, 
  Users, 
  DollarSign, 
  FolderOpen,
  TrendingUp,
  Clock,
  LogOut
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // ✅ Get everything from the useApp hook (no direct AppContext import)
  const { user, projects, tasks, meetings, logout } = useApp();

  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);

  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const totalRevenue = projects.reduce((sum, project) => sum + project.revenue, 0);
  const upcomingMeetings = meetings
    .filter(meeting => new Date(meeting.date) >= new Date())
    .slice(0, 3);

  const totalTasks = projects.reduce((sum, project) => sum + project.tasks.length, 0);
  const completedTasks = projects.reduce(
    (sum, project) => sum + project.tasks.filter(task => task.completed).length, 
    0
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">BRC Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={() => setShowAddProject(true)} className="btn-brc">
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
              <Button 
                onClick={() => setShowAddMeeting(true)} 
                variant="outline" 
                className="btn-brc-outline"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
              <Button 
                onClick={() => setShowAddClient(true)} 
                variant="outline" 
                className="btn-brc-outline"
              >
                <Users className="w-4 h-4 mr-2" />
                Add Client
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Projects"
            value={totalProjects}
            icon={FolderOpen}
            description={`${completedProjects} completed`}
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={DollarSign}
            description="Across all projects"
          />
          <StatsCard
            title="Task Progress"
            value={`${completedTasks}/${totalTasks}`}
            icon={TrendingUp}
            description="Tasks completed"
          />
          <StatsCard
            title="Active Projects"
            value={projects.filter(p => p.status === 'In Progress').length}
            icon={Clock}
            description="Currently in progress"
          />
        </div>

        {/* Upcoming Meetings */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Upcoming Meetings</h2>
          {upcomingMeetings.length > 0 ? (
            <ul>
              {upcomingMeetings.map(m => (
                <li key={m.id} className="text-muted-foreground">
                  {m.title} — {m.date} at {m.time}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No upcoming meetings</p>
          )}
        </div>

        {/* Projects List */}
        <div>
          <h2 className="text-xl font-bold mb-4">Projects</h2>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No projects available</p>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddProjectModal isOpen={showAddProject} onClose={() => setShowAddProject(false)} />
      <AddMeetingModal isOpen={showAddMeeting} onClose={() => setShowAddMeeting(false)} />
      <AddClientModal isOpen={showAddClient} onClose={() => setShowAddClient(false)} />
    </div>
  );
};

export default Dashboard;
