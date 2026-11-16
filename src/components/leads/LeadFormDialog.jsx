
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { leadChannels, leadStatuses, products, agentTypes } from "@/lib/data";
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { formatDate } from "@/lib/data";

const LeadFormDialog = ({ isOpen, onOpenChange, leadData, onLeadDataChange, onSubmit, formType }) => {
  const title = formType === "add" ? "Add New Lead" : "Edit Lead";
  const description = formType === "add" 
    ? "Enter the details of the new lead to add to your system."
    : "Update the lead information.";
  const submitButtonText = formType === "add" ? "Add Lead" : "Save Changes";

  const [lastContactedDate, setLastContactedDate] = useState(leadData?.lastContactedAt ? new Date(leadData.lastContactedAt) : null);

  useEffect(() => {
    if (leadData?.lastContactedAt) {
      setLastContactedDate(new Date(leadData.lastContactedAt));
    } else {
      setLastContactedDate(null);
    }
  }, [leadData?.lastContactedAt]);

  const handleDateSelect = (date) => {
    setLastContactedDate(date);
    onLeadDataChange({...leadData, lastContactedAt: date ? date.toISOString() : null});
  };


  if (!leadData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Full Name</label>
              <Input id="name" value={leadData.name} onChange={(e) => onLeadDataChange({...leadData, name: e.target.value})} placeholder="John Smith" />
            </div>
            <div className="space-y-2">
              <label htmlFor="company" className="text-sm font-medium">Company</label>
              <Input id="company" value={leadData.company} onChange={(e) => onLeadDataChange({...leadData, company: e.target.value})} placeholder="Acme Inc." />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" type="email" value={leadData.email} onChange={(e) => onLeadDataChange({...leadData, email: e.target.value})} placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Phone</label>
              <Input id="phone" value={leadData.phone} onChange={(e) => onLeadDataChange({...leadData, phone: e.target.value})} placeholder="+1 555-123-4567" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="channel" className="text-sm font-medium">Lead Source</label>
              <Select value={leadData.channel} onValueChange={(value) => onLeadDataChange({...leadData, channel: value})}>
                <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                <SelectContent>
                  {leadChannels.map((channel) => (<SelectItem key={channel.id} value={channel.id}>{channel.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <Select value={leadData.status} onValueChange={(value) => onLeadDataChange({...leadData, status: value})}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {leadStatuses.map((status) => (<SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="product" className="text-sm font-medium">Interested Product</label>
              <Select value={leadData.interestedProduct} onValueChange={(value) => onLeadDataChange({...leadData, interestedProduct: value})}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map((product) => (<SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="agent" className="text-sm font-medium">Assigned Agent</label>
              <Select value={leadData.assignedAgent} onValueChange={(value) => onLeadDataChange({...leadData, assignedAgent: value})}>
                <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                <SelectContent>
                  {agentTypes.map((agent) => (<SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="interest" className="text-sm font-medium">Interest</label>
              <Input id="interest" value={leadData.interest || ""} onChange={(e) => onLeadDataChange({...leadData, interest: e.target.value})} placeholder="e.g. AI Solutions" />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastContactedAt" className="text-sm font-medium">Last Contacted</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${!lastContactedDate && "text-muted-foreground"}`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {lastContactedDate ? formatDate(lastContactedDate.toISOString()) : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={lastContactedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">Notes</label>
            <Textarea id="notes" value={leadData.notes} onChange={(e) => onLeadDataChange({...leadData, notes: e.target.value})} placeholder="Additional information about this lead..." rows={3} />
          </div>

          {formType === 'edit' && leadData.interactionHistory && leadData.interactionHistory.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Interaction History</h4>
              <div className="max-h-32 overflow-y-auto rounded-md border p-2 space-y-1 bg-muted/50">
                {leadData.interactionHistory.map((interaction, index) => (
                  <div key={index} className="text-xs">
                    <span className="font-semibold">{formatDate(interaction.date)} - {interaction.type}:</span> {interaction.notes}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit}>{submitButtonText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadFormDialog;
