
import React from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import GeneralSettings from "@/components/settings/GeneralSettings";
import DataManagementSettings from "@/components/settings/DataManagementSettings";

const Settings = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 }}
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 }}
  };

  return (
    <div className="container py-6">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <PageHeader icon={<SettingsIcon />} accent="acc-slate" eyebrow="Preferences"
          title="Settings"
          description="Configure your application preferences and manage your data." />

        <GeneralSettings itemVariants={itemVariants} />
        <DataManagementSettings itemVariants={itemVariants} />
      </motion.div>
    </div>
  );
};

export default Settings;
