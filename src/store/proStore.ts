
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProFeatures {
  ocr: boolean;
  redaction: boolean;
  advancedFixes: boolean;
  batchProcessing: boolean;
  complianceChecks: boolean;
}

interface ProState {
  isPro: boolean;
  features: ProFeatures;
  setIsPro: (isPro: boolean) => void;
  getFeatureAccess: (featureName: keyof ProFeatures) => boolean;
}

export const useProStore = create<ProState>()(
  persist(
    (set, get) => ({
      isPro: false,
      features: {
        ocr: false,
        redaction: false,
        advancedFixes: false,
        batchProcessing: false,
        complianceChecks: false,
      },
      setIsPro: (isPro: boolean) => {
        set({ 
          isPro,
          features: {
            ocr: isPro,
            redaction: isPro,
            advancedFixes: isPro,
            batchProcessing: isPro,
            complianceChecks: isPro,
          }
        });
      },
      getFeatureAccess: (featureName: keyof ProFeatures) => {
        return get().isPro && get().features[featureName];
      },
    }),
    {
      name: 'pro-storage',
    }
  )
);
