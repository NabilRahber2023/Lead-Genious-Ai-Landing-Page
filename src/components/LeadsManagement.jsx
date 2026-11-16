
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, LayoutGrid, Table2, Trash2, Upload, Users, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import LeadFormDialog from "@/components/leads/LeadFormDialog";
import LeadsTable from "@/components/leads/LeadsTable";
import LeadsKanban from "@/components/leads/LeadsKanban";
import LeadFilters from "@/components/leads/LeadFilters";
import LeadDetailsDialog from "@/components/leads/LeadDetailsDialog";
import AddInteractionDialog from "@/components/leads/AddInteractionDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLeadManagement } from "@/hooks/useLeadManagement";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { csvToLeads } from "@/lib/csv";
import { downloadFile } from "@/lib/api";
import { cn } from "@/lib/utils";

const LeadsManagement = () => {
  const { can } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [view, setView] = useState("table"); // "table" | "board"
  const {
    filteredLeads, searchTerm, setSearchTerm,
    statusFilter, setStatusFilter, channelFilter, setChannelFilter,
    sortConfig, handleSort, resetFilters,
    total, page, setPage, totalPages, pageSize,
    selectedIds, toggleSelect, toggleSelectPage, clearSelection, handleBulkDelete,
    isAddLeadOpen, setIsAddLeadOpen, openAddLeadDialog,
    isEditLeadOpen, setIsEditLeadOpen, openEditDialog,
    isViewDetailsOpen, setIsViewDetailsOpen, openViewDetailsDialog,
    isAddInteractionOpen, setIsAddInteractionOpen, openAddInteractionDialog,
    currentLeadData, setCurrentLeadData,
    selectedLeadForInteraction,
    newLead, setNewLead,
    handleAddLeadSubmit, handleEditLeadSubmit, handleDeleteLead, handleAddInteractionSubmit,
    handleImportLeads,
  } = useLeadManagement();

  // Deep-link support: /app/leads?status=<id> pre-applies the status filter
  // (used by the dashboards' funnel drill-through).
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const status = searchParams.get("status");
    if (status) setStatusFilter(status);
  }, [searchParams, setStatusFilter]);

  const onCsvSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    try {
      const text = await file.text();
      const { leads, skipped } = csvToLeads(text);
      if (leads.length === 0) {
        toast({ title: "No leads found", description: "Make sure your CSV has a header row with a 'name' column.", variant: "destructive" });
        return;
      }
      if (skipped > 0) {
        toast({ title: `Parsed ${leads.length} leads`, description: `${skipped} row(s) without a name were skipped.` });
      }
      await handleImportLeads(leads);
    } catch (err) {
      toast({ title: "Couldn't read file", description: err.message, variant: "destructive" });
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 }}};
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.3 }}};

  return (
    <div className="container py-6">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <PageHeader
          icon={<Users />} accent="acc-sky" eyebrow="Pipeline"
          title="Leads Management"
          description="Manage and track all your leads in one place."
          actions={
            <>
              <Button variant="outline" disabled={exporting} onClick={async () => {
                setExporting(true);
                try {
                  await downloadFile("/leads/export.csv", `leads-${new Date().toISOString().slice(0, 10)}.csv`);
                } catch (err) {
                  toast({ title: "Export failed", description: err.message, variant: "destructive" });
                } finally {
                  setExporting(false);
                }
              }}>
                <Download className="mr-2 h-4 w-4" />Export CSV
              </Button>
              {can("createLeads") && (
                <>
                  <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onCsvSelected} />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />Import CSV
                  </Button>
                </>
              )}
            </>
          }
        />

        <motion.div variants={itemVariants}>
          <LeadFilters
            searchTerm={searchTerm} onSearchTermChange={setSearchTerm}
            statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
            channelFilter={channelFilter} onChannelFilterChange={setChannelFilter}
            onAddLeadOpen={openAddLeadDialog}
            onResetFilters={resetFilters}
          />
        </motion.div>
        {isAddLeadOpen && (
          <LeadFormDialog isOpen={isAddLeadOpen} onOpenChange={setIsAddLeadOpen} leadData={newLead} onLeadDataChange={setNewLead} onSubmit={handleAddLeadSubmit} formType="add" />
        )}
        {isEditLeadOpen && currentLeadData && (
           <LeadFormDialog isOpen={isEditLeadOpen} onOpenChange={setIsEditLeadOpen} leadData={currentLeadData} onLeadDataChange={setCurrentLeadData} onSubmit={handleEditLeadSubmit} formType="edit" />
        )}

        {currentLeadData && isViewDetailsOpen && (
          <LeadDetailsDialog isOpen={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen} lead={currentLeadData} onEdit={openEditDialog} />
        )}

        {selectedLeadForInteraction && (
          <AddInteractionDialog isOpen={isAddInteractionOpen} onOpenChange={setIsAddInteractionOpen} leadName={selectedLeadForInteraction.name} onSubmit={handleAddInteractionSubmit} />
        )}
        
        {/* Bulk-action bar — appears when rows are selected. */}
        {can("deleteLeads") && selectedIds.size > 0 && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5" role="toolbar" aria-label="Bulk actions">
            <p className="text-sm font-medium">{selectedIds.size} lead(s) selected</p>
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />Delete selected
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {selectedIds.size} lead(s)?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently removes the selected leads and their interaction history. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete}>Yes, delete them</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                <X className="mr-1.5 h-4 w-4" />Clear
              </Button>
            </div>
          </div>
        )}

        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
              <CardTitle>All Leads ({total})</CardTitle>
              {/* Table ↔ Board view toggle */}
              <div className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-1" role="tablist" aria-label="Leads view">
                {[
                  { id: "table", label: "Table", icon: <Table2 className="h-4 w-4" /> },
                  { id: "board", label: "Board", icon: <LayoutGrid className="h-4 w-4" /> },
                ].map((v) => (
                  <button
                    key={v.id}
                    role="tab"
                    aria-selected={view === v.id}
                    onClick={() => setView(v.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      view === v.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {v.icon}{v.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {view === "board" ? (
                <LeadsKanban onViewDetails={openViewDetailsDialog} />
              ) : (
                <>
                  <LeadsTable
                    leads={filteredLeads}
                    onSort={handleSort}
                    sortConfig={sortConfig}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteLead}
                    onViewDetails={openViewDetailsDialog}
                    onAddInteraction={openAddInteractionDialog}
                    selectable={can("deleteLeads")}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onToggleAll={toggleSelectPage}
                  />
                  {/* Server-side pagination footer */}
                  {totalPages > 1 && (
                    <nav className="mt-4 flex items-center justify-between gap-3" aria-label="Leads pagination">
                      <p className="text-xs text-muted-foreground tabular-nums">
                        Page {page} of {totalPages} · {total} leads · {pageSize} per page
                      </p>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                          <ChevronLeft className="mr-1 h-4 w-4" />Previous
                        </Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                          Next<ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </nav>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LeadsManagement;
