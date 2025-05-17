
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { validationService } from '@/services/validationService';
import { useToast } from '@/hooks/use-toast';
import { FixParams } from '@/types/validation';

export const useFixProcess = (userId: string) => {
  const [fixJobId, setFixJobId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Mutation for applying fixes
  const applyFixesMutation = useMutation({
    mutationFn: async ({ 
      file, 
      fixes, 
      options 
    }: { 
      file: File, 
      fixes: string[], 
      options?: FixParams['options'] 
    }) => {
      return validationService.applyFixes(file, userId, fixes, options);
    },
    onSuccess: (data) => {
      setFixJobId(data.fixJobId);
      toast({
        title: "Fix Process Started",
        description: `PDF fix process initiated for ${data.fileName}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fix Process Failed",
        description: error.message || "Failed to start fix process",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for applying font embedding
  const applyFontEmbeddingMutation = useMutation({
    mutationFn: async (file: File) => {
      return validationService.applyFontEmbedding(file, userId);
    },
    onSuccess: (data) => {
      setFixJobId(data.fixJobId);
      toast({
        title: "Font Embedding Started",
        description: "Process to embed fonts has started",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Font Embedding Failed",
        description: error.message || "Failed to start font embedding",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for converting RGB to CMYK
  const convertRgbToCmykMutation = useMutation({
    mutationFn: async ({ file, preserveBlack = true }: { file: File, preserveBlack?: boolean }) => {
      return validationService.convertRgbToCmyk(file, userId, preserveBlack);
    },
    onSuccess: (data) => {
      setFixJobId(data.fixJobId);
      toast({
        title: "Color Conversion Started",
        description: "Process to convert RGB to CMYK has started",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Color Conversion Failed",
        description: error.message || "Failed to convert RGB to CMYK",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for applying ICC profile
  const applyIccProfileMutation = useMutation({
    mutationFn: async ({ file, profileName = 'FOGRA39' }: { file: File, profileName?: string }) => {
      return validationService.applyIccProfile(file, userId, profileName);
    },
    onSuccess: (data) => {
      setFixJobId(data.fixJobId);
      toast({
        title: "ICC Profile Application Started",
        description: "Process to apply ICC profile has started",
      });
    },
    onError: (error: any) => {
      toast({
        title: "ICC Profile Application Failed",
        description: error.message || "Failed to apply ICC profile",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for flattening transparency
  const flattenTransparencyMutation = useMutation({
    mutationFn: async ({ file, quality = 'high' }: { file: File, quality?: 'high' | 'medium' | 'low' }) => {
      return validationService.flattenTransparency(file, userId, quality);
    },
    onSuccess: (data) => {
      setFixJobId(data.fixJobId);
      toast({
        title: "Transparency Flattening Started",
        description: "Process to flatten transparency has started",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Transparency Flattening Failed",
        description: error.message || "Failed to flatten transparency",
        variant: "destructive",
      });
    }
  });

  // Mutation for converting to PDF/A
  const convertToPdfAMutation = useMutation({
    mutationFn: async ({ file, conformanceLevel = '2b' }: { file: File, conformanceLevel?: '1b' | '1a' | '2b' | '2a' | '3b' | '3a' }) => {
      return validationService.convertToPdfA(file, userId, conformanceLevel);
    },
    onSuccess: (data) => {
      setFixJobId(data.fixJobId);
      toast({
        title: "PDF/A Conversion Started",
        description: "Process to convert to PDF/A has started",
      });
    },
    onError: (error: any) => {
      toast({
        title: "PDF/A Conversion Failed",
        description: error.message || "Failed to convert to PDF/A",
        variant: "destructive",
      });
    }
  });

  // Mutation for converting to PDF/X
  const convertToPdfXMutation = useMutation({
    mutationFn: async ({ file, standard = '4' }: { file: File, standard?: '1a' | '3' | '4' }) => {
      return validationService.convertToPdfX(file, userId, standard);
    },
    onSuccess: (data) => {
      setFixJobId(data.fixJobId);
      toast({
        title: "PDF/X Conversion Started",
        description: "Process to convert to PDF/X has started",
      });
    },
    onError: (error: any) => {
      toast({
        title: "PDF/X Conversion Failed",
        description: error.message || "Failed to convert to PDF/X",
        variant: "destructive",
      });
    }
  });

  // Mutation for adding bleed
  const addBleedMutation = useMutation({
    mutationFn: async ({ file, bleedMargin = 3 }: { file: File, bleedMargin?: number }) => {
      return validationService.addBleed(file, userId, bleedMargin);
    },
    onSuccess: (data) => {
      setFixJobId(data.fixJobId);
      toast({
        title: "Adding Bleed Started",
        description: "Process to add bleed has started",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Adding Bleed Failed",
        description: error.message || "Failed to add bleed",
        variant: "destructive",
      });
    }
  });

  // Mutation for removing JavaScript
  const removeJavaScriptMutation = useMutation({
    mutationFn: async (file: File) => {
      return validationService.removeJavaScript(file, userId);
    },
    onSuccess: (data) => {
      setFixJobId(data.fixJobId);
      toast({
        title: "JavaScript Removal Started",
        description: "Process to remove JavaScript has started",
      });
    },
    onError: (error: any) => {
      toast({
        title: "JavaScript Removal Failed",
        description: error.message || "Failed to remove JavaScript",
        variant: "destructive",
      });
    }
  });

  // Mutation for fixing overprint
  const fixOverprintMutation = useMutation({
    mutationFn: async (file: File) => {
      return validationService.fixOverprint(file, userId);
    },
    onSuccess: (data) => {
      setFixJobId(data.fixJobId);
      toast({
        title: "Overprint Fix Started",
        description: "Process to fix overprint settings has started",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Overprint Fix Failed",
        description: error.message || "Failed to fix overprint settings",
        variant: "destructive",
      });
    }
  });

  // Mutation for optimizing images
  const optimizeImagesMutation = useMutation({
    mutationFn: async ({ file, targetDpi = 300 }: { file: File, targetDpi?: number }) => {
      return validationService.optimizeImages(file, userId, targetDpi);
    },
    onSuccess: (data) => {
      setFixJobId(data.fixJobId);
      toast({
        title: "Image Optimization Started",
        description: "Process to optimize images has started",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Image Optimization Failed",
        description: error.message || "Failed to optimize images",
        variant: "destructive",
      });
    }
  });

  // Mutation for fixing XREF table
  const fixXrefTableMutation = useMutation({
    mutationFn: async (file: File) => {
      return validationService.fixXrefTable(file, userId);
    },
    onSuccess: (data) => {
      setFixJobId(data.fixJobId);
      toast({
        title: "XREF Table Fix Started",
        description: "Process to fix XREF table has started",
      });
    },
    onError: (error: any) => {
      toast({
        title: "XREF Table Fix Failed",
        description: error.message || "Failed to fix XREF table",
        variant: "destructive",
      });
    }
  });
  
  // Query for fix status
  const fixStatusQuery = useQuery({
    queryKey: ['fixStatus', fixJobId],
    queryFn: async () => {
      if (!fixJobId) return null;
      return validationService.getFixStatus(fixJobId);
    },
    enabled: !!fixJobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2000; // Default polling interval
      
      if (data.status === 'completed' && data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
        return false; // Stop polling
      }

      if (data.status === 'error') {
        toast({
          title: "Fix Process Error",
          description: data.errorMessage || "An error occurred during the fix process",
          variant: "destructive",
        });
        return false; // Stop polling
      }
      
      return 2000; // Poll every 2 seconds
    }
  });
  
  // Reset all fix state
  const resetFixProcess = () => {
    setFixJobId(null);
    setDownloadUrl(null);
  };
  
  return {
    applyFixes: applyFixesMutation.mutate,
    isApplyingFixes: applyFixesMutation.isPending,
    
    applyFontEmbedding: applyFontEmbeddingMutation.mutate,
    isEmbeddingFonts: applyFontEmbeddingMutation.isPending,
    
    convertRgbToCmyk: convertRgbToCmykMutation.mutate,
    isConvertingRgbToCmyk: convertRgbToCmykMutation.isPending,
    
    applyIccProfile: applyIccProfileMutation.mutate,
    isApplyingIccProfile: applyIccProfileMutation.isPending,
    
    flattenTransparency: flattenTransparencyMutation.mutate,
    isFlatteningTransparency: flattenTransparencyMutation.isPending,

    convertToPdfA: convertToPdfAMutation.mutate,
    isConvertingToPdfA: convertToPdfAMutation.isPending,

    convertToPdfX: convertToPdfXMutation.mutate,
    isConvertingToPdfX: convertToPdfXMutation.isPending,

    addBleed: addBleedMutation.mutate,
    isAddingBleed: addBleedMutation.isPending,

    removeJavaScript: removeJavaScriptMutation.mutate,
    isRemovingJavaScript: removeJavaScriptMutation.isPending,

    fixOverprint: fixOverprintMutation.mutate,
    isFixingOverprint: fixOverprintMutation.isPending,

    optimizeImages: optimizeImagesMutation.mutate,
    isOptimizingImages: optimizeImagesMutation.isPending,

    fixXrefTable: fixXrefTableMutation.mutate,
    isFixingXrefTable: fixXrefTableMutation.isPending,
    
    fixStatus: fixStatusQuery.data,
    isCheckingFixStatus: fixStatusQuery.isLoading || fixStatusQuery.isFetching,
    downloadUrl,
    
    resetFixProcess,
  };
};
