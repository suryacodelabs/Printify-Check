
import { useProStore } from "@/store/proStore";
import { useToast } from "@/hooks/use-toast";

export const useProAccess = () => {
  const { isPro } = useProStore();
  const { toast } = useToast();

  const checkProAccess = (feature: string): boolean => {
    if (isPro) return true;

    toast({
      title: "Pro Feature",
      description: `${feature} is only available with a Pro subscription.`,
      variant: "destructive",
    });

    return false;
  };

  return {
    isPro,
    checkProAccess
  };
};
