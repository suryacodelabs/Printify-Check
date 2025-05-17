
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { validationService } from '@/services/validationService';
import { ValidationJobResponse, ValidationStatusResponse, ValidationParams } from '@/types/validation';
import { useToast } from '@/hooks/use-toast';

export const useValidationProcess = (userId: string) => {
  const [validationProcessId, setValidationProcessId] = useState<string | null>(null);
  const [validationResultId, setValidationResultId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Query for system capabilities
  const capabilitiesQuery = useQuery({
    queryKey: ['systemCapabilities'],
    queryFn: async () => {
      return validationService.getSystemCapabilities();
    },
    staleTime: 1000 * 60 * 5, // Cache capabilities for 5 minutes
  });
  
  // Mutation for initiating PDF validation
  const validatePDFMutation = useMutation({
    mutationFn: async ({ file, params }: { file: File, params: ValidationParams }) => {
      return validationService.validatePDF(file, userId, params);
    },
    onSuccess: (data: ValidationJobResponse) => {
      setValidationProcessId(data.processId);
      toast({
        title: "Validation Started",
        description: `Validation process initiated for ${data.fileName}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Validation Failed",
        description: error.message || "Failed to start validation process",
        variant: "destructive",
      });
    }
  });
  
  // Query for validation status
  const validationStatusQuery = useQuery({
    queryKey: ['validationStatus', validationProcessId],
    queryFn: async () => {
      if (!validationProcessId) return null;
      return validationService.getValidationStatus(validationProcessId);
    },
    enabled: !!validationProcessId,
    refetchInterval: (query) => {
      // Stop polling when validation is complete or encountered an error
      const data = query.state?.data as ValidationStatusResponse | null;
      if (!data) return 2000; // Default polling interval if no data
      
      if (data.status === 'completed' || data.status === 'error') {
        if (data.resultId) {
          setValidationResultId(data.resultId);
        }
        return false; // Stop polling
      }
      
      // Continue polling every 2 seconds
      return 2000;
    }
  });
  
  // Query for validation results
  const validationResultsQuery = useQuery({
    queryKey: ['validationResults', validationResultId],
    queryFn: async () => {
      if (!validationResultId) return null;
      return validationService.getValidationResults(validationResultId);
    },
    enabled: !!validationResultId,
    staleTime: 1000 * 60 * 30, // Cache results for 30 minutes
    retry: 3, // Retry 3 times if results fetch fails
  });
  
  return {
    validatePDF: validatePDFMutation.mutate,
    isValidating: validatePDFMutation.isPending,
    validationStatus: validationStatusQuery.data,
    isCheckingStatus: validationStatusQuery.isLoading || validationStatusQuery.isFetching,
    validationResults: validationResultsQuery.data,
    isLoadingResults: validationResultsQuery.isLoading,
    validationProcessId,
    validationResultId,
    capabilities: capabilitiesQuery.data,
    isLoadingCapabilities: capabilitiesQuery.isLoading,
    capabilitiesError: capabilitiesQuery.error,
    validationError: validationStatusQuery.error || validationResultsQuery.error,
    resetValidationProcess: () => {
      setValidationProcessId(null);
      setValidationResultId(null);
    }
  };
};
