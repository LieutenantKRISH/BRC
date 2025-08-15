import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { X, Plus } from "lucide-react";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    deadline: "",
    client: "",
    assignedMembers: [] as string[],
    revenue: 0,
  });
  const [newMember, setNewMember] = useState("");
  const [isCustomClient, setIsCustomClient] = useState(false);
  const { clients, addProject } = useApp();
  const { toast } = useToast();

  const defaultTasks = [
    "Requirement Gathering",
    "Design",
    "Development",
    "Testing",
    "Deployment",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !formData.startDate ||
      !formData.deadline ||
      !formData.client
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const projectData = {
      ...formData,
      progress: 0,
      status: "In Progress" as const,
      tasks: defaultTasks.map((taskName, index) => ({
        id: (index + 1).toString(),
        name: taskName,
        completed: false,
        assignedMembers: [],
        notes: "",
      })),
    };

    try {
      await addProject(projectData);
      toast({
        title: "Success",
        description: "Project created successfully!",
      });

      setFormData({
        name: "",
        description: "",
        startDate: "",
        deadline: "",
        client: "",
        assignedMembers: [],
        revenue: 0,
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addMember = () => {
    if (newMember.trim() && !formData.assignedMembers.includes(newMember.trim())) {
      setFormData((prev) => ({
        ...prev,
        assignedMembers: [...prev.assignedMembers, newMember.trim()],
      }));
      setNewMember("");
    }
  };

  const removeMember = (member: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedMembers: prev.assignedMembers.filter((m) => m !== member),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addMember();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter project name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              {clients.length > 0 ? (
                <div className="space-y-2">
                  <Select
                    value={isCustomClient ? "custom" : formData.client}
                    onValueChange={(value) => {
                      if (value === "custom") {
                        setIsCustomClient(true);
                        setFormData((prev) => ({ ...prev, client: "" }));
                      } else {
                        setIsCustomClient(false);
                        setFormData((prev) => ({ ...prev, client: value }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select existing client or add new" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.name}>
                          {client.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">+ Add New Client</SelectItem>
                    </SelectContent>
                  </Select>
                  {isCustomClient && (
                    <Input
                      value={formData.client}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, client: e.target.value }))
                      }
                      placeholder="Enter new client name"
                      required
                    />
                  )}
                </div>
              ) : (
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => setFormData((prev) => ({ ...prev, client: e.target.value }))}
                  placeholder="Enter client name"
                  required
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Enter project description"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, deadline: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="revenue">Estimated Revenue</Label>
            <Input
              id="revenue"
              type="number"
              value={formData.revenue}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, revenue: Number(e.target.value) }))
              }
              placeholder="Enter estimated revenue"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label>Assigned Team Members</Label>
            <div className="flex space-x-2">
              <Input
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type member name and press Enter"
                className="flex-1"
              />
              <Button type="button" onClick={addMember} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.assignedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.assignedMembers.map((member) => (
                  <Badge key={member} variant="secondary" className="flex items-center space-x-1">
                    <span>{member}</span>
                    <button
                      type="button"
                      onClick={() => removeMember(member)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Default Task Stages</Label>
            <div className="flex flex-wrap gap-2">
              {defaultTasks.map((task) => (
                <Badge key={task} variant="outline">
                  {task}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              These stages will be automatically added to your project
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="btn-brc">
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectModal;
