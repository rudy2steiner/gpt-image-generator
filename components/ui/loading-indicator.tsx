'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingIndicatorProps {
  label?: string;
  className?: string;
}

export function LoadingIndicator({
  label = 'Loading',
  className 
}: LoadingIndicatorProps) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Start counting elapsed time
    startTimeRef.current = Date.now();

    // Update elapsed time every second
    intervalRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );
      setElapsed(elapsedSeconds);
    }, 1000);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className={cn("flex items-center justify-center gap-2 text-sm", className)}>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>
        {label} ({elapsed}s)
      </span>
    </div>
  );
}