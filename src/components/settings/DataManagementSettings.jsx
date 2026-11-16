
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { dataApi, downloadFile } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DataManagementSettings = ({ itemVariants }) => {
  const { toast } = useToast();
  const { can } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Data management is owner-only.
  if (!can("editSettings")) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadFile("/leads/export.csv", `leads-${new Date().toISOString().slice(0, 10)}.csv`);
      toast({ title: "Export ready", description: "Your leads CSV has been downloaded." });
    } catch (e) {
      toast({ title: "Export failed", description: e.message, variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetWorkspace = async () => {
    setIsResetting(true);
    try {
      const res = await dataApi.reset();
      toast({
        title: "Workspace data cleared",
        description: `Removed ${res.deleted_leads} leads and ${res.deleted_campaigns} campaigns. Refreshing…`,
      });
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      toast({ title: "Reset failed", description: e.message, variant: "destructive" });
      setIsResetting(false);
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export or reset your workspace data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Export Data</h4>
            <p className="text-xs text-muted-foreground mb-2">Download all of your leads as a CSV file. The format can be re-imported as-is.</p>
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Export Leads (CSV)
            </Button>
          </div>
          <div>
            <h4 className="text-sm font-medium">Reset Workspace Data</h4>
            <p className="text-xs text-muted-foreground mb-2">Permanently delete all leads, campaigns, and AI run logs for this workspace (your account, team, settings, and the 9 agents are kept). Useful for clearing seeded demo data and starting fresh.</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isResetting}>
                  {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reset Workspace Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all leads & campaigns?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes every lead, interaction, campaign, and
                    AI run log in this workspace. This cannot be undone. Your account,
                    team members, settings, and AI agents are not affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetWorkspace}>Yes, reset data</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DataManagementSettings;
