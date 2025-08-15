import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useApp } from '@/contexts/AppContext';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Upload,
  Building2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, updateProject, user } = useApp();
  const { toast } = useToast();
  
  const project = projects.find(p => p.id === id);
  const [taskNotes, setTaskNotes] = useState<{ [key: string]: string }>({});
  const [tasks, setTasks] = useState<any[]>([]);

  // Fetch tasks from Supabase
  useEffect(() => {
    if (!id) return;
    supabase
      .from('tasks')
      .select('*')
      .eq('project_id', id)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching tasks:', error);
        } else {
          setTasks(data || []);
        }
      });
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Project Not Found</h1>
          <Button onClick={() => navigate(-1)} className="btn-brc">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isManagement = user?.isManagement;

  const getStatusColor = (status: typeof project.status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepIcon = (completed: boolean, index: number, tasks: any[]) => {
    if (completed) {
      return <CheckCircle2 className="w-6 h-6 text-green-600" />;
    } else if (index === 0 || tasks[index - 1]?.completed) {
      return <Clock className="w-6 h-6 text-blue-600" />;
    } else {
      return <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-gray-100" />;
    }
  };

  const handleTaskComplete = (taskId: string, completed: boolean) => {
    if (isManagement) {
      toast({
        title: "Review Mode",
        description: "Task completion is disabled in management view",
        variant: "destructive",
      });
      return;
    }

    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed } : task
    );
    
    const completedCount = updatedTasks.filter(task => task.completed).length;
    const progress = Math.round((completedCount / updatedTasks.length) * 100);
    
    let status = project.status;
    if (progress === 100) {
      status = 'Completed';
    } else if (progress > 0) {
      status = 'In Progress';
    }

    updateProject(project.id, { 
      tasks: updatedTasks, 
      progress,
      status
    });
    setTasks(updatedTasks);

    toast({
      title: "Task Updated",
      description: `Task marked as ${completed ? 'completed' : 'incomplete'}`,
    });
  };

  const handleNoteChange = (taskId: string, notes: string) => {
    if (isManagement) {
      toast({
        title: "Review Mode",
        description: "Note editing is disabled in management view",
        variant: "destructive",
      });
      return;
    }

    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, notes } : task
    );
    
    updateProject(project.id, { tasks: updatedTasks });
    setTasks(updatedTasks);
    setTaskNotes(prev => ({ ...prev, [taskId]: notes }));
  };

  const handleFileUpload = () => {
    if (isManagement) {
      toast({
        title: "Review Mode",
        description: "File upload is disabled in management view",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "File Upload",
      description: "File upload functionality would be implemented here",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
                  <p className="text-sm text-muted-foreground">Project Details</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              {isManagement && (
                <Badge variant="secondary" className="px-3 py-1">
                  Review Mode
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Project Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{project.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(project.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Deadline</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(project.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-lg font-bold text-primary">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Client</span>
                <span className="text-sm font-medium">{project.client}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Revenue</span>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(project.revenue)}
                  </span>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Team Members</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.assignedMembers.map((member) => (
                    <Badge key={member} variant="outline">
                      <Users className="w-3 h-3 mr-1" />
                      {member}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step Tracker */}
        <Card>
          <CardHeader>
            <CardTitle>Project Phases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {tasks.map((task, index) => (
                <div key={task.id} className="border rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getStepIcon(task.completed, index, tasks)}
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">{task.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={(checked) => 
                              handleTaskComplete(task.id, checked as boolean)
                            }
                            disabled={isManagement}
                          />
                          <span className="text-sm text-muted-foreground">
                            Mark as complete
                          </span>
                        </div>
                      </div>
                      
                      {task.assignedMembers?.length > 0 && (
                        <div>
                          <span className="text-sm text-muted-foreground">Assigned to:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {task.assignedMembers.map((member: string) => (
                              <Badge key={member} variant="secondary" className="text-xs">
                                {member}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            Upload Files
                          </label>
                          <Button
                            onClick={handleFileUpload}
                            variant="outline"
                            className="w-full"
                            disabled={isManagement}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Attachments
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            Notes/Comments
                          </label>
                          <Textarea
                            value={taskNotes[task.id] || task.notes}
                            onChange={(e) => handleNoteChange(task.id, e.target.value)}
                            placeholder="Add notes or comments..."
                            rows={3}
                            disabled={isManagement}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetail;
