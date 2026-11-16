
import React from "react";
import { motion } from "framer-motion";
import { Plus, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import CampaignStats from "@/components/campaigns/CampaignStats";
import CampaignCard from "@/components/campaigns/CampaignCard";
import CampaignFormDialog from "@/components/campaigns/CampaignFormDialog";
import EmptyState from "@/components/ui/EmptyState";
import { useCampaignManagement } from "@/hooks/useCampaignManagement";
import { useAuth } from "@/context/AuthContext";

const Campaigns = () => {
  const { can } = useAuth();
  const {
    campaigns,
    isAddCampaignOpen, setIsAddCampaignOpen, openAddCampaignDialog,
    isEditCampaignOpen, setIsEditCampaignOpen, openEditDialog,
    currentCampaignData, setCurrentCampaignData,
    newCampaign, setNewCampaign,
    handleAddCampaignSubmit, handleEditCampaignSubmit, handleDeleteCampaign,
  } = useCampaignManagement();

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 }}};
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 }}};

  return (
    <div className="container py-6">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <PageHeader
          icon={<Megaphone />} accent="acc-violet" eyebrow="Marketing"
          title="Campaigns"
          description="Create and manage marketing campaigns."
          actions={can("manageCampaigns") && (
            <Button onClick={openAddCampaignDialog} className="animated-gradient text-white">
              <Plus className="mr-2 h-4 w-4" />New Campaign
            </Button>
          )}
        />

        <CampaignStats campaigns={campaigns} itemVariants={itemVariants} />

        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold tracking-tight">All Campaigns ({campaigns.length})</h2>
        </motion.div>
        {isAddCampaignOpen && (
          <CampaignFormDialog isOpen={isAddCampaignOpen} onOpenChange={setIsAddCampaignOpen} campaignData={newCampaign} onCampaignDataChange={setNewCampaign} onSubmit={handleAddCampaignSubmit} formType="add" />
        )}
        {isEditCampaignOpen && currentCampaignData && (
          <CampaignFormDialog isOpen={isEditCampaignOpen} onOpenChange={setIsEditCampaignOpen} campaignData={currentCampaignData} onCampaignDataChange={setCurrentCampaignData} onSubmit={handleEditCampaignSubmit} formType="edit" />
        )}

        <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.length > 0 ? campaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} onEdit={openEditDialog} onDelete={handleDeleteCampaign} />
          )) : (
            <div className="col-span-full">
              <EmptyState
                icon={<Megaphone />}
                accent="acc-violet"
                title="No campaigns yet"
                body="Campaigns track budget, leads generated, and ROI per channel — create your first one to start measuring."
                actions={can("manageCampaigns") && (
                  <Button onClick={openAddCampaignDialog} className="animated-gradient text-white">
                    <Plus className="mr-2 h-4 w-4" />Create your first campaign
                  </Button>
                )}
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Campaigns;
