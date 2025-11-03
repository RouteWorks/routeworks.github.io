import React, { useState, useEffect, useRef } from 'react';
import './PageStats.css';

const PageStats: React.FC = () => {
  const [totalViews, setTotalViews] = useState<number>(0);
  const hasIncremented = useRef(false);

  useEffect(() => {
    // Prevent double counting in React strict mode
    if (hasIncremented.current) {
      return;
    }

    // Use a timestamp check to prevent rapid double increments
    const lastIncrement = sessionStorage.getItem('routerarena_last_increment');
    const now = Date.now();

    // Only increment if it's been more than 1 second since last increment
    if (lastIncrement && (now - parseInt(lastIncrement)) < 1000) {
      // Load existing value without incrementing
      const existing = localStorage.getItem('routerarena_total_views');
      if (existing) {
        setTotalViews(parseInt(existing));
      }
      return;
    }

    hasIncremented.current = true;
    sessionStorage.setItem('routerarena_last_increment', now.toString());

    // Get existing total views
    const existing = localStorage.getItem('routerarena_total_views');
    let views = 1;

    if (existing) {
      views = parseInt(existing) + 1;
    }

    // Save updated views
    localStorage.setItem('routerarena_total_views', views.toString());
    setTotalViews(views);
  }, []);

  return (
    <div className="page-stats">
      <span className="stat-text">
        <span className="stat-number">{totalViews.toLocaleString()}</span>
        <span className="stat-label"> page views</span>
      </span>
    </div>
  );
};

export default PageStats;
