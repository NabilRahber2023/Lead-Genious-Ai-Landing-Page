
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDashboardQuery } from "@/lib/queries";

/**
 * Dashboard analytics — now served through TanStack Query (cache + dedupe +
 * retry) while keeping the original { data, isLoading } surface so every
 * dashboard keeps working unchanged.
 */
export const useDashboard = () => {
  const { data, isLoading, error } = useDashboardQuery();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({ title: "Failed to load dashboard", description: error.message, variant: "destructive" });
    }
  }, [error, toast]);

  return { data, isLoading };
};
