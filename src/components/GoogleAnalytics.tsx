import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = 'G-CFZYZLHP5X';

const GoogleAnalytics: React.FC = () => {
  const location = useLocation();

  // Load GA script once
  useEffect(() => {
    // Only inject if not already present
    if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      script.onload = () => {
        // Initialize GA after script loads
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
          window.dataLayer.push(args);
        }
        window.gtag = gtag;

        window.gtag('js', new Date());
        window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });

        // Fire initial page_view
        window.gtag('event', 'page_view', {
          page_path: window.location.pathname + window.location.search,
        });
      };
      document.head.appendChild(script);
    }
  }, []);

  // Track route changes
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
};

export default GoogleAnalytics;
