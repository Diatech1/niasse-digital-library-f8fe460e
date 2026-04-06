import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';

export interface PagedViewHandle {
  getPageForSection: (sectionIndex: number) => number;
}

interface PagedViewProps {
  children: React.ReactNode;
  page: number;
  onTotalPagesChange: (total: number) => void;
  className?: string;
}

const PagedView = forwardRef<PagedViewHandle, PagedViewProps>(
  ({ children, page, onTotalPagesChange, className }, ref) => {
    const outerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const gap = 48;
    const lastTotal = useRef(0);

    useEffect(() => {
      if (!outerRef.current) return;
      const ro = new ResizeObserver(entries => {
        const w = entries[0].contentRect.width;
        if (w > 0) setContainerWidth(w);
      });
      ro.observe(outerRef.current);
      return () => ro.disconnect();
    }, []);

    const measure = useCallback(() => {
      if (!innerRef.current || containerWidth === 0) return;
      const sw = innerRef.current.scrollWidth;
      const total = Math.max(1, Math.round((sw + gap) / (containerWidth + gap)));
      if (total !== lastTotal.current) {
        lastTotal.current = total;
        onTotalPagesChange(total);
      }
    }, [containerWidth, gap, onTotalPagesChange]);

    useEffect(() => {
      const raf1 = requestAnimationFrame(() => {
        requestAnimationFrame(measure);
      });
      return () => cancelAnimationFrame(raf1);
    }, [children, containerWidth, measure]);

    useImperativeHandle(ref, () => ({
      getPageForSection: (sectionIndex: number) => {
        if (!innerRef.current || containerWidth === 0) return 0;
        const el = innerRef.current.querySelector(`[data-section-index="${sectionIndex}"]`);
        if (!el) return 0;
        return Math.floor((el as HTMLElement).offsetLeft / (containerWidth + gap));
      },
    }), [containerWidth, gap]);

    return (
      <div ref={outerRef} className={`overflow-hidden ${className || ''}`} style={{ height: '100%' }}>
        <div
          ref={innerRef}
          style={{
            height: '100%',
            columnWidth: `${containerWidth}px`,
            columnGap: `${gap}px`,
            columnFill: 'auto',
            transform: `translateX(-${page * (containerWidth + gap)}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);

PagedView.displayName = 'PagedView';
export default PagedView;
