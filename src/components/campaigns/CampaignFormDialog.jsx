
import React from "react";
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

const CampaignFormDialog = ({ isOpen, onOpenChange, campaignData, onCampaignDataChange, onSubmit, formType }) => {
  const title = formType === "add" ? "Create New Campaign" : "Edit Campaign";
  const description = formType === "add" 
    ? "Set up a new marketing campaign to generate leads." 
    : "Update campaign information and performance metrics.";
  const submitButtonText = formType === "add" ? "Create Campaign" : "Save Changes";

  if (!campaignData) return null;

  const handleInputChange = (e) => {
    const { id, value, type } = e.target;
    onCampaignDataChange({ ...campaignData, [id]: type === 'number' ? parseFloat(value) || 0 : value });
  };

  const handleSelectChange = (id, value) => {
    onCampaignDataChange({ ...campaignData, [id]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Campaign Name</label>
            <Input id="name" value={campaignData.name} onChange={handleInputChange} placeholder="Summer Sale Promotion" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">Campaign Type</label>
              <Select value={campaignData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem><SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem><SelectItem value="event">Event</SelectItem>
                  <SelectItem value="advertising">Advertising</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <Select value={campaignData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem><SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem><SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm font-medium">Start Date</label>
              <Input id="startDate" type="date" value={campaignData.startDate} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <label htmlFor="endDate" className="text-sm font-medium">End Date</label>
              <Input id="endDate" type="date" value={campaignData.endDate} onChange={handleInputChange} />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="budget" className="text-sm font-medium">Budget</label>
            <Input id="budget" type="number" value={campaignData.budget} onChange={handleInputChange} placeholder="5000" />
          </div>
          {formType === "edit" && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="leadsGenerated" className="text-sm font-medium">Leads</label>
                <Input id="leadsGenerated" type="number" value={campaignData.leadsGenerated} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="conversionRate" className="text-sm font-medium">Conversion (%)</label>
                <Input id="conversionRate" type="number" step="0.1" value={campaignData.conversionRate} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="roi" className="text-sm font-medium">ROI (%)</label>
                <Input id="roi" type="number" step="0.1" value={campaignData.roi} onChange={handleInputChange} />
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

export default CampaignFormDialog;
