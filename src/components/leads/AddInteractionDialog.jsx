
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // Re-added Input for Date

const AddInteractionDialog = ({ isOpen, onOpenChange, leadName, onSubmit }) => {
  const [interactionType, setInteractionType] = useState("Email Sent");
  const [notes, setNotes] = useState("");
  const [notesError, setNotesError] = useState("");
  const [interactionDate, setInteractionDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = () => {
    if (!notes.trim()) {
      setNotesError("Please enter notes for the interaction.");
      return;
    }
    onSubmit({
      date: new Date(interactionDate).toISOString(),
      type: interactionType,
      notes: notes,
    });
    setNotes("");
    setNotesError("");
    setInteractionType("Email Sent");
    setInteractionDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Interaction for {leadName}</DialogTitle>
          <DialogDescription>Log a new interaction with this lead.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label htmlFor="interactionDate" className="text-sm font-medium">Interaction Date</label>
            <Input 
              type="date" 
              id="interactionDate" 
              value={interactionDate}
              onChange={(e) => setInteractionDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="interactionType" className="text-sm font-medium">Interaction Type</label>
            <Select value={interactionType} onValueChange={setInteractionType}>
              <SelectTrigger id="interactionType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Email Sent">Email Sent</SelectItem>
                <SelectItem value="Email Received">Email Received</SelectItem>
                <SelectItem value="Call Made">Call Made</SelectItem>
                <SelectItem value="Call Received">Call Received</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
                <SelectItem value="Note Added">Note Added</SelectItem>
                <SelectItem value="Demo Given">Demo Given</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="interactionNotes" className="text-sm font-medium">Notes</label>
            <Textarea
              id="interactionNotes"
              value={notes}
              onChange={(e) => { setNotes(e.target.value); if (notesError) setNotesError(""); }}
              placeholder="Describe the interaction..."
              rows={4}
              aria-invalid={!!notesError}
              aria-describedby={notesError ? "interactionNotes-error" : undefined}
            />
            {notesError && (
              <p id="interactionNotes-error" className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                {notesError}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Interaction</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddInteractionDialog;
