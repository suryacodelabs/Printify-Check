
import { useToast as useToastShad } from "@/components/ui/use-toast";
import { toast as toastFunction } from "@/components/ui/use-toast";

// Export the hooks correctly
export const useToast = useToastShad;
export const toast = toastFunction;
