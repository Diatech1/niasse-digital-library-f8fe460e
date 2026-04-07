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
    const [containerHeight, setContainerHeight] = useState(0);
    const gap = 48;
    const lastTotal = useRef(0);
    const measureRaf = useRef(0);

    const pageWidth = containerWidth;
    const strideWidth = pageWidth + gap;

    useEffect(() => {
      if (!outerRef.current) return;
      const ro = new ResizeObserver(entries => {
        const rect = entries[0].contentRect;
        if (rect.width > 0) setContainerWidth(rect.width);
        if (rect.height > 0) setContainerHeight(rect.height);
      });
      ro.observe(outerRef.current);
      return () => ro.disconnect();
    }, []);

    const measure = useCallback(() => {
      if (!innerRef.current || containerWidth === 0 || containerHeight === 0) return;
      const sw = innerRef.current.scrollWidth;
      const total = Math.max(1, Math.ceil(sw / strideWidth));
      if (total !== lastTotal.current) {
        lastTotal.current = total;
        onTotalPagesChange(total);
      }
    }, [containerWidth, containerHeight, strideWidth, onTotalPagesChange]);

    useEffect(() => {
      cancelAnimationFrame(measureRaf.current);
      measureRaf.current = requestAnimationFrame(() => {
        requestAnimationFrame(measure);
      });
      return () => cancelAnimationFrame(measureRaf.current);
    }, [children, containerWidth, containerHeight, measure]);

    useImperativeHandle(ref, () => ({
      getPageForSection: (sectionIndex: number) => {
        if (!innerRef.current || strideWidth === 0) return 0;
        const el = innerRef.current.querySelector(`[data-section-index="${sectionIndex}"]`);
        if (!el) return 0;
        return Math.floor((el as HTMLElement).offsetLeft / strideWidth);
      },
    }), [strideWidth]);

    const translateX = page * strideWidth;
    const pageNumberPadding = 28;

    return (
      <div ref={outerRef} className={`overflow-hidden relative ${className || ''}`} style={{ height: '100%', paddingLeft: 40, paddingRight: 40 }}>
        <div
          ref={innerRef}
          style={{
            height: containerHeight > 0 ? `${containerHeight - pageNumberPadding}px` : '100%',
            columnWidth: `${pageWidth}px`,
            columnGap: `${gap}px`,
            columnFill: 'auto',
            transform: `translateX(-${translateX}px)`,
            transition: 'transform 0.3s ease-out',
            willChange: 'transform',
          }}
        >
          {children}
        </div>

        {/* Page number */}
        {containerHeight > 0 && (
          <div
            className="absolute left-0 right-0 flex justify-center pointer-events-none select-none"
            style={{ bottom: 4 }}
          >
            <span className="text-muted-foreground/40 font-serif italic text-xs">
              {page + 1}
            </span>
          </div>
        )}
      </div>
    );
  }
);

PagedView.displayName = 'PagedView';
export default PagedView;
