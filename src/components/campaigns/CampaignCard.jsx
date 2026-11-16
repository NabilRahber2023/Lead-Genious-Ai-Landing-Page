
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Mail, Users, MessageSquare, Target, Calendar as CalendarIcon,
  Edit, Trash2, MoreHorizontal, BarChart2
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib/data";
import { useAuth } from "@/context/AuthContext";

const CampaignCard = ({ campaign, onEdit, onDelete }) => {
  const { can } = useAuth();
  const canManage = can("manageCampaigns");
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 }},
    hover: { y: -5, transition: { type: "spring", stiffness: 300, damping: 10 }}
  };

  const getCampaignTypeIcon = (type) => {
    switch (type) {
      case "email": return <Mail className="h-5 w-5" />;
      case "social": return <Users className="h-5 w-5" />;
      case "referral": return <Users className="h-5 w-5" />;
      case "event": return <CalendarIcon className="h-5 w-5" />;
      case "advertising": return <Target className="h-5 w-5" />;
      default: return <MessageSquare className="h-5 w-5" />;
    }
  };

  const getCampaignStatusBadge = (status) => {
    switch (status) {
      case "active": return <Badge variant="success">Active</Badge>;
      case "planned": return <Badge variant="info">Planned</Badge>;
      case "completed": return <Badge variant="secondary">Completed</Badge>;
      case "paused": return <Badge variant="warning">Paused</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <motion.div variants={cardVariants} whileHover="hover" className="agent-card">
      <Card className="glass-card h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="acc-tile acc-violet grid h-9 w-9 shrink-0 place-items-center rounded-xl">{getCampaignTypeIcon(campaign.type)}</span>
              <CardTitle className="text-lg truncate">{campaign.name}</CardTitle>
            </div>
            {getCampaignStatusBadge(campaign.status)}
          </div>
          <CardDescription>{formatDate(campaign.startDate)} to {formatDate(campaign.endDate)}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><p className="text-xs text-muted-foreground">Budget</p><p className="text-sm font-medium">{formatCurrency(campaign.budget)}</p></div>
              <div className="space-y-1"><p className="text-xs text-muted-foreground">Type</p><p className="text-sm font-medium capitalize">{campaign.type}</p></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm"><span>Performance</span><span className="font-medium">{campaign.roi}% ROI</span></div>
              <Progress value={Math.min(campaign.roi, 100)} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="acc-violet acc-soft flex flex-col items-center rounded-xl p-2.5">
                <Users className="h-4 w-4 mb-1" /><span className="text-sm font-semibold text-foreground">{campaign.leadsGenerated}</span><span className="text-xs text-muted-foreground">Leads</span>
              </div>
              <div className="acc-violet acc-soft flex flex-col items-center rounded-xl p-2.5">
                <Target className="h-4 w-4 mb-1" /><span className="text-sm font-semibold text-foreground">{campaign.conversionRate}%</span><span className="text-xs text-muted-foreground">Conversion</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          {canManage ? (
            <Button variant="outline" size="sm" onClick={() => onEdit(campaign)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
          ) : <span />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuSeparator />
              <DropdownMenuItem><BarChart2 className="mr-2 h-4 w-4" /><span>View Analytics</span></DropdownMenuItem>
              <DropdownMenuItem><Users className="mr-2 h-4 w-4" /><span>View Leads</span></DropdownMenuItem>
              {canManage && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onDelete(campaign.id)} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /><span>Delete</span></DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default CampaignCard;
