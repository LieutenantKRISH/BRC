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
import { supabase } from "@/lib/supabaseClient";
import { X, Plus } from "lucide-react";

interface AddMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddMeetingModal: React.FC<AddMeetingModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    client: "",
    description: "",
    attendees: [] as string[],
  });
  const [newAttendee, setNewAttendee] = useState("");
  const [isCustomClient, setIsCustomClient] = useState(false);
  const { fetchAll, clients } = useApp();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.date || !formData.time || !formData.client) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Save to Supabase
    const { error } = await supabase.from("meetings").insert([
      {
        title: formData.title,
        date: formData.date,
        time: formData.time,
        client: formData.client,
        description: formData.description,
        attendees: JSON.stringify(formData.attendees),
      },
    ]);

    if (error) {
      console.error(error.message);
      toast({
        title: "Error",
        description: "Failed to schedule meeting.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Meeting scheduled successfully!",
    });

    await fetchAll();

    // Reset form
    setFormData({
      title: "",
      date: "",
      time: "",
      client: "",
      description: "",
      attendees: [],
    });
    onClose();
  };

  const addAttendee = () => {
    if (newAttendee.trim() && !formData.attendees.includes(newAttendee.trim())) {
      setFormData((prev) => ({
        ...prev,
        attendees: [...prev.attendees, newAttendee.trim()],
      }));
      setNewAttendee("");
    }
  };

  const removeAttendee = (attendee: string) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees.filter((a) => a !== attendee),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAttendee();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Schedule Meeting</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meeting Title */}
          <div className="space-y-2">
            <Label htmlFor="meetingTitle">Meeting Title *</Label>
            <Input
              id="meetingTitle"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter meeting title"
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meetingDate">Date *</Label>
              <Input
                id="meetingDate"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meetingTime">Time *</Label>
              <Input
                id="meetingTime"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Client */}
          <div className="space-y-2">
            <Label htmlFor="meetingClient">Client *</Label>
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, client: e.target.value }))}
                    placeholder="Enter new client name"
                    required
                  />
                )}
              </div>
            ) : (
              <Input
                id="meetingClient"
                value={formData.client}
                onChange={(e) => setFormData((prev) => ({ ...prev, client: e.target.value }))}
                placeholder="Enter client name"
                required
              />
            )}
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <Label>Attendees</Label>
            <div className="flex space-x-2">
              <Input
                value={newAttendee}
                onChange={(e) => setNewAttendee(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type attendee name and press Enter"
                className="flex-1"
              />
              <Button type="button" onClick={addAttendee} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.attendees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.attendees.map((attendee) => (
                  <Badge key={attendee} variant="secondary" className="flex items-center space-x-1">
                    <span>{attendee}</span>
                    <button
                      type="button"
                      onClick={() => removeAttendee(attendee)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="meetingDescription">Description/Agenda</Label>
            <Textarea
              id="meetingDescription"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Enter meeting agenda or description"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="btn-brc">
              Schedule Meeting
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMeetingModal;
