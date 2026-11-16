
import React from "react";
import { Search, Filter, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { leadChannels, leadStatuses } from "@/lib/data";
import { useAuth } from "@/context/AuthContext";

const LeadFilters = ({
  searchTerm, onSearchTermChange,
  statusFilter, onStatusFilterChange,
  channelFilter, onChannelFilterChange,
  onAddLeadOpen, onResetFilters
}) => {
  const { can } = useAuth();
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search leads by name, company, email..." className="pl-8 w-full sm:w-[350px]" value={searchTerm} onChange={(e) => onSearchTermChange(e.target.value)} />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="outline"><Filter className="mr-2 h-4 w-4" />Filter</Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[250px]">
            <DropdownMenuLabel>Filter Leads</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-2 space-y-2">
              <div>
                <p className="text-xs font-medium mb-1">Status</p>
                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                  <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    {leadStatuses.map((status) => (<SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">Channel</p>
                <Select value={channelFilter} onValueChange={onChannelFilterChange}>
                  <SelectTrigger><SelectValue placeholder="All Channels" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Channels</SelectItem>
                    {leadChannels.map((channel) => (<SelectItem key={channel.id} value={channel.id}>{channel.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onResetFilters} className="cursor-pointer">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset Filters
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {can("createLeads") && (
        <Button className="w-full sm:w-auto animated-gradient text-white" onClick={() => onAddLeadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Lead
        </Button>
      )}
    </div>
  );
};

export default LeadFilters;
