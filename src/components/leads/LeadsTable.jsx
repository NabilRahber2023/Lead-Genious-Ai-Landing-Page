
import React from "react";
import { MoreHorizontal, Edit, Trash2, Mail, Phone, ArrowUpDown, ArrowUp, ArrowDown, Eye, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, getChannelById, getStatusById } from "@/lib/data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";

// Sortable columns with human-readable labels (the old auto-split of camelCase
// produced awkward headers like "Last Contacted At").
const SORTABLE_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "status", label: "Status" },
  { key: "channel", label: "Channel" },
  { key: "score", label: "Score" },
  { key: "lastContactedAt", label: "Last Contacted" },
  { key: "createdAt", label: "Created" },
];

const LeadsTable = ({
  leads, onSort, sortConfig, onEdit, onDelete, onViewDetails, onAddInteraction,
  selectable = false, selectedIds, onToggleSelect, onToggleAll,
}) => {
  const { can } = useAuth();
  const pageIds = leads.map((l) => l.id);
  const allOnPageSelected = selectable && pageIds.length > 0 && pageIds.every((id) => selectedIds?.has(id));
  const getStatusBadgeVariant = (status) => {
    const statusObj = getStatusById(status);
    if (statusObj) {
      if (statusObj.color.includes("blue")) return "info";
      if (statusObj.color.includes("yellow")) return "warning";
      if (statusObj.color.includes("green") || statusObj.color.includes("emerald")) return "success";
      if (statusObj.color.includes("purple")) return "secondary";
      if (statusObj.color.includes("orange")) return "warning";
      if (statusObj.color.includes("red")) return "destructive";
    }
    return "default";
  };

  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b bg-muted/50">
                {selectable && (
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer accent-[hsl(var(--primary))]"
                      checked={allOnPageSelected}
                      onChange={() => onToggleAll?.(pageIds)}
                      aria-label={allOnPageSelected ? "Deselect all leads on this page" : "Select all leads on this page"}
                    />
                  </th>
                )}
                {SORTABLE_COLUMNS.map(({ key, label }) => {
                  const isSorted = sortConfig?.key === key;
                  const direction = isSorted ? sortConfig.direction : null;
                  return (
                    <th
                      key={key}
                      aria-sort={isSorted ? (direction === "asc" ? "ascending" : "descending") : "none"}
                      className="px-4 py-3 text-left text-sm font-medium text-muted-foreground whitespace-nowrap"
                    >
                      <button
                        type="button"
                        onClick={() => onSort(key)}
                        className="flex items-center gap-2 rounded-sm hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-colors"
                      >
                        <span>{label}</span>
                        {isSorted
                          ? (direction === "asc" ? <ArrowUp className="h-4 w-4" aria-hidden="true" /> : <ArrowDown className="h-4 w-4" aria-hidden="true" />)
                          : <ArrowUpDown className="h-4 w-4 opacity-50" aria-hidden="true" />}
                        <span className="sr-only">
                          {isSorted ? `, sorted ${direction === "asc" ? "ascending" : "descending"}` : ", not sorted"}
                        </span>
                      </button>
                    </th>
                  );
                })}
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead.id} className={`border-b hover:bg-muted/50 transition-colors ${selectable && selectedIds?.has(lead.id) ? "bg-primary/5" : ""}`}>
                    {selectable && (
                      <td className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 cursor-pointer accent-[hsl(var(--primary))]"
                          checked={selectedIds?.has(lead.id) || false}
                          onChange={() => onToggleSelect?.(lead.id)}
                          aria-label={`Select ${lead.name}`}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{lead.name}</span>
                        <span className="text-xs text-muted-foreground">{lead.company}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusBadgeVariant(lead.status)}>
                        {getStatusById(lead.status)?.name || lead.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                       <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            {getChannelById(lead.channel)?.icon}
                            <span className="ml-2 truncate max-w-[100px]">{getChannelById(lead.channel)?.name || lead.channel}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getChannelById(lead.channel)?.name || lead.channel}</p>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="px-4 py-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <div className="flex items-center">
                            <span className={`font-medium text-lg ${lead.score >= 70 ? 'text-emerald-600 dark:text-emerald-400' : lead.score >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              {lead.score}
                            </span>
                          </div>
                        </TooltipTrigger>
                         <TooltipContent>
                          <p>Lead Score: {lead.score}/100</p>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                     <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm">{lead.lastContactedAt ? formatDate(lead.lastContactedAt) : 'N/A'}</span></td>
                    <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm">{formatDate(lead.createdAt)}</span></td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onViewDetails(lead)}><Eye className="mr-2 h-4 w-4" /><span>View Details</span></DropdownMenuItem>
                          {can("editLeads") && (
                            <DropdownMenuItem onClick={() => onEdit(lead)}><Edit className="mr-2 h-4 w-4" /><span>Edit</span></DropdownMenuItem>
                          )}
                          {can("logInteraction") && (
                            <DropdownMenuItem onClick={() => onAddInteraction(lead.id)}><MessageCircle className="mr-2 h-4 w-4" /><span>Log Interaction</span></DropdownMenuItem>
                          )}
                          {(lead.email || lead.phone) && <DropdownMenuSeparator />}
                          {lead.email && (
                            <DropdownMenuItem asChild>
                              <a href={`mailto:${lead.email}`}><Mail className="mr-2 h-4 w-4" /><span>Send Email</span></a>
                            </DropdownMenuItem>
                          )}
                          {lead.phone && (
                            <DropdownMenuItem asChild>
                              <a href={`tel:${lead.phone.replace(/[^+\d]/g, "")}`}><Phone className="mr-2 h-4 w-4" /><span>Call</span></a>
                            </DropdownMenuItem>
                          )}
                          {can("deleteLeads") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => onDelete(lead.id)} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /><span>Delete</span></DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={selectable ? 8 : 7} className="px-4 py-8 text-center text-muted-foreground">No leads found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default LeadsTable;
