
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Mail, Phone, Briefcase, Users, Tag, Calendar, MessageSquare, Edit } from "lucide-react";
import { formatDate, getChannelById, getStatusById, getProductById, getAgentById } from "@/lib/data";

const LeadDetailsDialog = ({ isOpen, onOpenChange, lead, onEdit }) => {
  if (!lead) return null;

  const channel = getChannelById(lead.channel);
  const status = getStatusById(lead.status);
  const product = getProductById(lead.interestedProduct);
  const agent = getAgentById(lead.assignedAgent);

  const detailItem = (Icon, label, value) => (
    <div className="flex items-start space-x-2">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || "N/A"}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            {lead.name}
            <Button variant="ghost" size="icon" onClick={() => onEdit(lead)} className="ml-auto mr-8">
              <Edit className="h-5 w-5" />
            </Button>
          </DialogTitle>
          <DialogDescription>{lead.company}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {detailItem(Mail, "Email", lead.email)}
            {detailItem(Phone, "Phone", lead.phone)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {detailItem(Briefcase, "Source", channel?.name)}
            <div className="flex items-start space-x-2">
              <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={status?.color?.includes("blue") ? "info" : status?.color?.includes("yellow") ? "warning" : (status?.color?.includes("green") || status?.color?.includes("emerald")) ? "success" : status?.color?.includes("purple") ? "secondary" : status?.color?.includes("orange") ? "warning" : status?.color?.includes("red") ? "destructive" : "default"}>
                  {status?.name}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             {detailItem(Users, "Interested Product", product?.name)}
             {detailItem(Users, "Assigned Agent", agent?.name)}
          </div>

          {lead.interest && (
            <div className="grid grid-cols-2 gap-4">
              {detailItem(Tag, "Interest", lead.interest)}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {detailItem(Calendar, "Created At", formatDate(lead.createdAt))}
            {detailItem(Calendar, "Last Contacted", lead.lastContactedAt ? formatDate(lead.lastContactedAt) : "N/A")}
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Lead Score</p>
            <p className={`text-xl font-bold ${lead.score >= 70 ? 'text-emerald-600 dark:text-emerald-400' : lead.score >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {lead.score} / 100
            </p>
          </div>
          
          {lead.notes && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="text-sm bg-muted/50 p-2 rounded-md">{lead.notes}</p>
            </div>
          )}

          {lead.interactionHistory && lead.interactionHistory.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Interaction History</h4>
              <div className="max-h-40 overflow-y-auto space-y-2 rounded-md border p-3 bg-muted/30">
                {lead.interactionHistory.map((interaction, index) => (
                  <div key={index} className="text-xs p-2 rounded bg-background shadow-sm">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-semibold text-primary">{interaction.type}</span>
                      <span className="text-muted-foreground">{formatDate(interaction.date)}</span>
                    </div>
                    <p>{interaction.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full">Close</Button>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailsDialog;
