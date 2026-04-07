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
    // Padding is on the outer div, so containerWidth = content area after padding
    const isSpread = containerWidth >= 600;
    const pageWidth = isSpread
      ? Math.floor((containerWidth - gap) / 2)
      : containerWidth;
    // Stride between spreads includes the trailing gap to the next spread's first column
    const spreadWidth = isSpread ? 2 * (pageWidth + gap) : (pageWidth + gap);

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

    // Page numbers
    const pageNumberPadding = 28;
    const leftPageNum = isSpread ? page * 2 + 1 : page + 1;
    const rightPageNum = isSpread ? page * 2 + 2 : 0;
    const totalLogicalPages = isSpread ? lastTotal.current * 2 : lastTotal.current;

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

        {/* Center divider for spread mode */}
        {isSpread && containerHeight > 0 && (
          <div
            className="absolute top-4 pointer-events-none"
            style={{
              left: '50%',
              bottom: pageNumberPadding + 4,
              width: '1px',
              background: 'hsl(var(--border) / 0.4)',
            }}
          />
        )}

        {/* Page numbers */}
        {containerHeight > 0 && (
          <div
            className="absolute left-0 right-0 flex pointer-events-none select-none"
            style={{ bottom: 4, paddingLeft: 0, paddingRight: 0 }}
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
