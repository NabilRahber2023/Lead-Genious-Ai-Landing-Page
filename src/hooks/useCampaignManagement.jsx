
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { campaignsApi } from "@/lib/api";
import { useCampaignsQuery, queryClient, QK } from "@/lib/queries";

const initialNewCampaignState = {
  name: "", type: "email", status: "planned",
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
  budget: "", leadsGenerated: 0, conversionRate: 0, roi: 0
};

// Coerce the numeric form fields to numbers before sending to the API.
const normalize = (c) => ({
  ...c,
  budget: parseFloat(c.budget) || 0,
  leadsGenerated: parseInt(c.leadsGenerated, 10) || 0,
  conversionRate: parseFloat(c.conversionRate) || 0,
  roi: parseFloat(c.roi) || 0,
});

export const useCampaignManagement = () => {
  // Campaign list comes from the shared query cache (deduped with dashboards).
  const { data: campaigns = [] } = useCampaignsQuery();
  const [isAddCampaignOpen, setIsAddCampaignOpen] = useState(false);
  const [isEditCampaignOpen, setIsEditCampaignOpen] = useState(false);
  const [currentCampaignData, setCurrentCampaignData] = useState(null);
  const [newCampaign, setNewCampaign] = useState(initialNewCampaignState);
  const { toast } = useToast();

  const refresh = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: QK.campaigns });
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
  }, []);

  const handleAddCampaignSubmit = useCallback(async () => {
    try {
      await campaignsApi.create(normalize(newCampaign));
      await refresh();
      setNewCampaign(initialNewCampaignState);
      setIsAddCampaignOpen(false);
      toast({ title: "Campaign Created", description: "New campaign successfully created." });
    } catch (e) {
      toast({ title: "Error creating campaign", description: e.message, variant: "destructive" });
    }
  }, [newCampaign, refresh, toast]);

  const handleEditCampaignSubmit = useCallback(async () => {
    if (!currentCampaignData) return;
    try {
      await campaignsApi.update(currentCampaignData.id, normalize(currentCampaignData));
      await refresh();
      setIsEditCampaignOpen(false);
      setCurrentCampaignData(null);
      toast({ title: "Campaign Updated", description: "Campaign information updated." });
    } catch (e) {
      toast({ title: "Error updating campaign", description: e.message, variant: "destructive" });
    }
  }, [currentCampaignData, refresh, toast]);

  const openAddCampaignDialog = useCallback(() => {
    setNewCampaign(initialNewCampaignState);
    setIsAddCampaignOpen(true);
  }, []);

  const openEditDialog = useCallback((campaign) => {
    setCurrentCampaignData({ ...campaign });
    setIsEditCampaignOpen(true);
  }, []);

  const handleDeleteCampaign = useCallback(async (id) => {
    try {
      await campaignsApi.remove(id);
      await refresh();
      toast({ title: "Campaign Deleted", description: "Campaign removed.", variant: "destructive" });
    } catch (e) {
      toast({ title: "Error deleting campaign", description: e.message, variant: "destructive" });
    }
  }, [refresh, toast]);

  return {
    campaigns,
    isAddCampaignOpen, setIsAddCampaignOpen, openAddCampaignDialog,
    isEditCampaignOpen, setIsEditCampaignOpen, openEditDialog,
    currentCampaignData, setCurrentCampaignData,
    newCampaign, setNewCampaign,
    handleAddCampaignSubmit, handleEditCampaignSubmit, handleDeleteCampaign,
    initialNewCampaignState
  };
};
