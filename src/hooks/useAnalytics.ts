import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // Analytics Real via Firestore
    const trackPageView = async () => {
      try {
        await addDoc(collection(db, 'analytics'), {
          event: 'PAGE_VIEW',
          path: location.pathname,
          timestamp: new Date().toISOString(),
          referrer: document.referrer,
          userAgent: navigator.userAgent
        });
      } catch (error) {
        console.error('Erro ao registrar analytics:', error);
      }
    };

    trackPageView();

    // Legado para BI externo
    const tracker = (window as any).CarroNoPrecoAnalytics;
    if (tracker) {
      tracker.track('PAGE_VIEW', {
        path: location.pathname,
        timestamp: new Date().toISOString(),
        referrer: document.referrer
      });
    }
  }, [location]);
}
