
import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { leadsApi } from "@/lib/api";
import { useLeadsPage, invalidateLeadData } from "@/lib/queries";

const initialNewLeadState = {
  name: "", company: "", email: "", phone: "", channel: "",
  status: "new", interest: "", interestedProduct: "",
  assignedAgent: "", notes: "", lastContactedAt: null, interactionHistory: []
};

const PAGE_SIZE = 25;

// camelCase sort keys (UI) → snake_case columns (API whitelist).
const SORT_COLUMNS = {
  createdAt: "created_at",
  lastContactedAt: "last_contacted_at",
  score: "score",
  name: "name",
  status: "status",
  channel: "channel",
};

/** Debounce a fast-changing value (search box) before it hits the server. */
function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/**
 * Lead management state — server-side pagination/sort/filter via TanStack
 * Query (Project Bible R8). The list no longer downloads every lead: the
 * backend returns one page at a time, so the table scales to thousands of
 * rows. All mutations invalidate the shared lead cache, which also refreshes
 * dashboards and analytics.
 */
export const useLeadManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(searchTerm);

  // Any change of filter/search/sort starts back at page 1.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, channelFilter, sortConfig]);

  const params = useMemo(() => ({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    channel: channelFilter || undefined,
    sort: SORT_COLUMNS[sortConfig.key] || "created_at",
    order: sortConfig.direction,
  }), [page, debouncedSearch, statusFilter, channelFilter, sortConfig]);

  const { data: pageData, isLoading, isFetching } = useLeadsPage(params);
  const leads = pageData?.items ?? [];
  const total = pageData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isEditLeadOpen, setIsEditLeadOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isAddInteractionOpen, setIsAddInteractionOpen] = useState(false);

  const [currentLeadData, setCurrentLeadData] = useState(null);
  const [selectedLeadForInteraction, setSelectedLeadForInteraction] = useState(null);
  const [newLead, setNewLead] = useState(initialNewLeadState);

  // Bulk selection (checkbox column). Kept as a Set of ids across pages.
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const { toast } = useToast();

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("");
    setChannelFilter("");
    setSortConfig({ key: "createdAt", direction: "desc" });
    setPage(1);
  }, []);

  // Create or update a lead via the API. Returns the saved lead (or null on error).
  const handleUpsertLead = useCallback(async (leadDataToSave, isNew) => {
    try {
      let saved;
      if (isNew) {
        saved = await leadsApi.create(leadDataToSave);
        toast({ title: "Lead Added", description: "New lead has been successfully added." });
      } else {
        saved = await leadsApi.update(leadDataToSave.id, leadDataToSave);
        toast({ title: "Lead Updated", description: "Lead information has been updated successfully." });
      }
      invalidateLeadData();
      return saved;
    } catch (e) {
      toast({ title: "Error saving lead", description: e.message, variant: "destructive" });
      return null;
    }
  }, [toast]);

  const handleAddLeadSubmit = useCallback(async () => {
    const saved = await handleUpsertLead(newLead, true);
    if (saved) {
      setNewLead(initialNewLeadState);
      setIsAddLeadOpen(false);
    }
  }, [newLead, handleUpsertLead]);

  const handleEditLeadSubmit = useCallback(async () => {
    if (!currentLeadData) return;
    const saved = await handleUpsertLead(currentLeadData, false);
    if (!saved) return;
    if (isViewDetailsOpen) {
      setCurrentLeadData(saved);
    } else {
      setCurrentLeadData(null);
    }
    setIsEditLeadOpen(false);
  }, [currentLeadData, handleUpsertLead, isViewDetailsOpen]);

  const openAddLeadDialog = useCallback(() => {
    setNewLead(initialNewLeadState);
    setIsAddLeadOpen(true);
  }, []);

  const openEditDialog = useCallback((lead) => {
    setCurrentLeadData({ ...lead });
    setIsEditLeadOpen(true);
    setIsViewDetailsOpen(false);
  }, []);

  const openViewDetailsDialog = useCallback((lead) => {
    setCurrentLeadData({ ...lead });
    setIsViewDetailsOpen(true);
  }, []);

  const handleDeleteLead = useCallback(async (id) => {
    try {
      await leadsApi.remove(id);
      invalidateLeadData();
      setSelectedIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast({ title: "Lead Deleted", description: "Lead has been removed from the system.", variant: "destructive" });
    } catch (e) {
      toast({ title: "Error deleting lead", description: e.message, variant: "destructive" });
    }
  }, [toast]);

  // ── Bulk selection & delete ──
  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectPage = useCallback((pageIds) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = pageIds.every((id) => next.has(id));
      pageIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleBulkDelete = useCallback(async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    try {
      const res = await leadsApi.bulkDelete(ids);
      invalidateLeadData();
      clearSelection();
      toast({ title: "Leads deleted", description: `${res.deleted} lead(s) removed.`, variant: "destructive" });
    } catch (e) {
      toast({ title: "Bulk delete failed", description: e.message, variant: "destructive" });
    }
  }, [selectedIds, clearSelection, toast]);

  // Bulk import leads (from a parsed CSV). Reports created/skipped via toast.
  const handleImportLeads = useCallback(async (leadsArray) => {
    if (!leadsArray || leadsArray.length === 0) {
      toast({ title: "Nothing to import", description: "No valid lead rows were found in the file.", variant: "destructive" });
      return null;
    }
    try {
      const res = await leadsApi.import(leadsArray);
      invalidateLeadData();
      const extra = res.errors?.length ? `, ${res.errors.length} error(s)` : "";
      toast({
        title: "Import complete",
        description: `${res.created} added, ${res.skipped} skipped as duplicates${extra}.`,
      });
      return res;
    } catch (e) {
      toast({ title: "Import failed", description: e.message, variant: "destructive" });
      return null;
    }
  }, [toast]);

  const openAddInteractionDialog = useCallback((leadId) => {
    const lead = leads.find(l => l.id === leadId);
    setSelectedLeadForInteraction(lead);
    setIsAddInteractionOpen(true);
  }, [leads]);

  const handleAddInteractionSubmit = useCallback(async (interaction) => {
    if (!selectedLeadForInteraction) return;
    try {
      const updated = await leadsApi.addInteraction(selectedLeadForInteraction.id, interaction);
      invalidateLeadData();
      toast({ title: "Interaction Logged", description: `New interaction for ${selectedLeadForInteraction.name} added.` });
      if (isViewDetailsOpen && currentLeadData && currentLeadData.id === selectedLeadForInteraction.id) {
        setCurrentLeadData(updated);
      }
    } catch (e) {
      toast({ title: "Error logging interaction", description: e.message, variant: "destructive" });
    }
    setIsAddInteractionOpen(false);
    setSelectedLeadForInteraction(null);
  }, [selectedLeadForInteraction, currentLeadData, isViewDetailsOpen, toast]);

  return {
    leads, filteredLeads: leads, isLoading, isFetching,
    total, page, setPage, totalPages, pageSize: PAGE_SIZE,
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter, channelFilter, setChannelFilter,
    sortConfig, handleSort, resetFilters,
    isAddLeadOpen, setIsAddLeadOpen, openAddLeadDialog,
    isEditLeadOpen, setIsEditLeadOpen, openEditDialog,
    isViewDetailsOpen, setIsViewDetailsOpen, openViewDetailsDialog,
    isAddInteractionOpen, setIsAddInteractionOpen, openAddInteractionDialog,
    currentLeadData, setCurrentLeadData,
    selectedLeadForInteraction,
    newLead, setNewLead,
    handleAddLeadSubmit, handleEditLeadSubmit, handleDeleteLead, handleAddInteractionSubmit,
    handleImportLeads,
    selectedIds, toggleSelect, toggleSelectPage, clearSelection, handleBulkDelete,
    initialNewLeadState
  };
};
