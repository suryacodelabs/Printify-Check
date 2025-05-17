
import { useEffect } from 'react';
import { useProStore } from '@/store/proStore';

export const useInitializePro = () => {
  const { setIsPro } = useProStore();

  useEffect(() => {
    // Check if Pro features should be enabled from environment
    const enableProFeatures = import.meta.env.VITE_ENABLE_PRO_FEATURES === 'true';
    
    if (enableProFeatures) {
      setIsPro(true);
    }
    
    // You could also check for a valid subscription from your backend here
    // For example:
    // async function checkSubscription() {
    //   const response = await fetch('/api/check-subscription');
    //   const { isPro } = await response.json();
    //   setIsPro(isPro);
    // }
    // checkSubscription();
  }, [setIsPro]);
};

export default useInitializePro;
