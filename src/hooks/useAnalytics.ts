import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // Analytics Real via Supabase
    const trackPageView = async () => {
      try {
        await supabase.from('analytics').insert({
          event: 'PAGE_VIEW',
          path: location.pathname,
          timestamp: new Date().toISOString(),
          referrer: document.referrer,
          userAgent: navigator.userAgent
        });
      } catch (error) {
        console.error('Erro ao registrar analytics no Supabase:', error);
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
