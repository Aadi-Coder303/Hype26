'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

function getVisitorId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('sv_visitor_id');
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('sv_visitor_id', id);
  }
  return id;
}

export function getVisitorIdSync() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('sv_visitor_id') || '';
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const visitorId = getVisitorId();

    const sendHeartbeat = () => {
      fetch('/api/analytics/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, page: pathname }),
      }).catch(() => {});
    };

    // Send immediately on page load/navigation
    sendHeartbeat();

    // Then every 30 seconds
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(sendHeartbeat, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pathname]);

  return null; // Invisible component
}
