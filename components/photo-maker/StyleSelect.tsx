'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { STYLES } from '@/lib/config/styles';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useState, useEffect } from 'react';

interface StyleSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function StyleSelect({ value, onChange }: StyleSelectProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth
    );
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      checkScrollButtons();
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">Style</Label>
      <div className="relative">
        {showLeftArrow && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-2 px-1 pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {STYLES.map((style) => (
            <Card
              key={style.value}
              className={cn(
                "flex-shrink-0 w-[200px] p-2 cursor-pointer hover:bg-accent transition-colors",
                value === style.value && "border-primary bg-accent"
              )}
              onClick={() => onChange(style.value)}
            >
              <div className="aspect-video relative rounded overflow-hidden mb-2">
                <img
                  src={style.preview}
                  alt={style.label}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium">{style.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {showRightArrow && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}