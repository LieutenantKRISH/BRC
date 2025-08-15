import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import ProjectCard from '@/components/ProjectCard';
import StatsCard from '@/components/StatsCard';
import { 
  Building2, 
  Calendar, 
  Users, 
  DollarSign, 
  FolderOpen,
  LogOut,
  BarChart3,
  Eye
} from 'lucide-react';

const ManagementDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, projects, meetings, clients, logout } = useApp();

  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const totalRevenue = projects.reduce((sum, project) => sum + project.revenue, 0);
  const totalTasks = projects.reduce((sum, project) => sum + project.tasks.length, 0);
  const completedTasks = projects.reduce((sum, project) => 
    sum + project.tasks.filter(task => task.completed).length, 0
  );

  const allMembers = [...new Set(projects.flatMap(p => p.assignedMembers))];
  const upcomingMeetings = meetings.filter(meeting => 
    new Date(meeting.date) >= new Date()
  );
  const pastMeetings = meetings.filter(meeting => 
    new Date(meeting.date) < new Date()
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
                <h1 className="text-2xl font-bold text-foreground">BRC Management Dashboard</h1>
                <p className="text-sm text-muted-foreground">Overview and Review Panel</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="px-3 py-1">
                <Eye className="w-4 h-4 mr-1" />
                Review Mode
              </Badge>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
              >
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
            title="Team Members"
            value={allMembers.length}
            icon={Users}
            description="Active team members"
          />
          <StatsCard
            title="Total Meetings"
            value={meetings.length}
            icon={Calendar}
            description={`${upcomingMeetings.length} upcoming`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Overview */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">All Projects Overview</h2>
              <Badge variant="outline">{totalProjects} Total Projects</Badge>
            </div>
            
            <div className="grid gap-6">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => navigate(`/project/${project.id}`)}
                  />
                ))
              ) : (
                <Card className="border-dashed border-2 border-border">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FolderOpen className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Projects</h3>
                    <p className="text-muted-foreground text-center">
                      No projects have been created yet
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Management Sidebar */}
          <div className="space-y-6">
            {/* Analytics Summary */}
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Task Completion</span>
                    <Badge variant="secondary">
                      {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Project Success</span>
                    <Badge variant="secondary">
                      {totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg. Revenue</span>
                    <Badge variant="secondary">
                      {formatCurrency(totalProjects > 0 ? totalRevenue / totalProjects : 0)}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Clients</span>
                    <Badge variant="secondary">
                      {clients.length}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-medium text-foreground mb-2">Workload Distribution</h4>
                  <div className="space-y-2">
                    {allMembers.slice(0, 5).map((member) => {
                      const memberProjects = projects.filter(p => p.assignedMembers.includes(member));
                      return (
                        <div key={member} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{member}</span>
                          <Badge variant="outline">{memberProjects.length} projects</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meeting Review */}
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Meeting Review</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingMeetings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Upcoming Meetings</h4>
                      <div className="space-y-2">
                        {upcomingMeetings.slice(0, 3).map((meeting) => (
                          <div key={meeting.id} className="border-l-4 border-blue-500 pl-3">
                            <h5 className="text-sm font-medium text-card-foreground">{meeting.title}</h5>
                            <p className="text-xs text-muted-foreground">
                              {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {pastMeetings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Recent Meetings</h4>
                      <div className="space-y-2">
                        {pastMeetings.slice(0, 3).map((meeting) => (
                          <div key={meeting.id} className="border-l-4 border-gray-300 pl-3">
                            <h5 className="text-sm font-medium text-card-foreground">{meeting.title}</h5>
                            <p className="text-xs text-muted-foreground">
                              {new Date(meeting.date).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {meetings.length === 0 && (
                    <div className="text-center py-6">
                      <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No meetings scheduled</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Client Overview */}
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Client Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clients.length > 0 ? (
                  <div className="space-y-3">
                    {clients.map((client) => (
                      <div key={client.id} className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-medium text-card-foreground">{client.name}</h4>
                          {client.email && (
                            <p className="text-xs text-muted-foreground">{client.email}</p>
                          )}
                        </div>
                        <Badge variant="outline">
                          {client.projects.length} projects
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No clients added yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementDashboard;
