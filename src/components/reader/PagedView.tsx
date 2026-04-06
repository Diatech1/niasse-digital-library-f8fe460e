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

    // Two-page spread when container is wide enough
    const isSpread = containerWidth >= 700;
    const pageWidth = isSpread
      ? Math.floor((containerWidth - gap) / 2)
      : containerWidth;
    // Full width of one "spread" (what one page-turn advances)
    const spreadWidth = isSpread
      ? pageWidth * 2 + gap
      : containerWidth;

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
      const total = Math.max(1, Math.ceil(sw / spreadWidth));
      if (total !== lastTotal.current) {
        lastTotal.current = total;
        onTotalPagesChange(total);
      }
    }, [containerWidth, containerHeight, spreadWidth, onTotalPagesChange]);

    // Debounced measurement
    useEffect(() => {
      cancelAnimationFrame(measureRaf.current);
      measureRaf.current = requestAnimationFrame(() => {
        requestAnimationFrame(measure);
      });
      return () => cancelAnimationFrame(measureRaf.current);
    }, [children, containerWidth, containerHeight, measure]);

    useImperativeHandle(ref, () => ({
      getPageForSection: (sectionIndex: number) => {
        if (!innerRef.current || spreadWidth === 0) return 0;
        const el = innerRef.current.querySelector(`[data-section-index="${sectionIndex}"]`);
        if (!el) return 0;
        return Math.floor((el as HTMLElement).offsetLeft / spreadWidth);
      },
    }), [spreadWidth]);

    const translateX = page * spreadWidth;

    // Page numbers: in spread mode show left + right, in single mode show centered
    const pageNumberPadding = 28; // space reserved at bottom for page number
    const leftPageNum = isSpread ? page * 2 + 1 : page + 1;
    const rightPageNum = isSpread ? page * 2 + 2 : 0;
    const totalLogicalPages = isSpread ? lastTotal.current * 2 : lastTotal.current;

    return (
      <div ref={outerRef} className={`overflow-hidden relative ${className || ''}`} style={{ height: '100%' }}>
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
        {/* In-page page numbers */}
        {containerHeight > 0 && (
          <div
            className="absolute left-0 right-0 flex pointer-events-none select-none"
            style={{ bottom: 4 }}
          >
            {isSpread ? (
              <>
                <span
                  className="text-muted-foreground/40 font-serif italic text-xs"
                  style={{ width: pageWidth, textAlign: 'center' }}
                >
                  {leftPageNum <= totalLogicalPages ? leftPageNum : ''}
                </span>
                <span style={{ width: gap }} />
                <span
                  className="text-muted-foreground/40 font-serif italic text-xs"
                  style={{ width: pageWidth, textAlign: 'center' }}
                >
                  {rightPageNum <= totalLogicalPages ? rightPageNum : ''}
                </span>
              </>
            ) : (
              <span
                className="text-muted-foreground/40 font-serif italic text-xs w-full text-center"
              >
                {leftPageNum}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

PagedView.displayName = 'PagedView';
export default PagedView;
