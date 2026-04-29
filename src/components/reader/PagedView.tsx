import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export interface PagedViewHandle {
  getPageForSection: (sectionIndex: number) => number;
}

interface PagedViewProps {
  children: React.ReactNode;
  page: number;
  onTotalPagesChange: (total: number, pagesPerTurn?: number) => void;
  className?: string;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  fitToPage?: boolean;
}

const PagedView = forwardRef<PagedViewHandle, PagedViewProps>(
  ({ children, page, onTotalPagesChange, className, onScroll, fitToPage = false }, ref) => {
    const outerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const [availWidth, setAvailWidth] = useState(0);
    const [availHeight, setAvailHeight] = useState(0);
    const lastTotal = useRef(0);
    const measureRaf = useRef(0);
    const isMobile = useIsMobile();

    useEffect(() => {
      if (!outerRef.current) return;
      const ro = new ResizeObserver(entries => {
        const rect = entries[0].contentRect;
        if (rect.width > 0) setAvailWidth(rect.width);
        if (rect.height > 0) setAvailHeight(rect.height);
      });
      ro.observe(outerRef.current);
      return () => ro.disconnect();
    }, []);

    // Desktop: single page sized to fill height; on wide screens, render a 2-page spread
    // Mobile: full-width single page
    const singlePageWidth = isMobile ? availWidth : Math.min(availWidth * 0.9, availHeight * (4 / 7) * 1.8, 900);
    const wantsSpread = false;
    const pagesPerTurn = wantsSpread ? 2 : 1;

    const bookWidth = isMobile
      ? availWidth
      : wantsSpread
        ? Math.min(availWidth - 32, singlePageWidth * 2 + 32)
        : singlePageWidth;
    const singleHeight = isMobile
      ? (fitToPage ? availHeight : availHeight * 4)
      : Math.min(availHeight - 16, (bookWidth / pagesPerTurn) * (7 / 4));
    const bookHeight = singleHeight;

    const padTop = isMobile ? 56 : bookHeight * 0.10;
    const padBottom = isMobile ? 24 : bookHeight * 0.08;
    const padLeft = isMobile ? 24 : (bookWidth / pagesPerTurn) * 0.10;
    const padRight = isMobile ? 24 : (bookWidth / pagesPerTurn) * 0.08;

    // Single-page content width (one column). When in spread mode the inner area
    // shows two columns of this width side-by-side.
    const singleContentWidth = (bookWidth / pagesPerTurn) - padLeft - padRight;
    const contentHeight = bookHeight - padTop - padBottom;
    const folioHeight = 20;

    const gap = 48;
    const strideWidth = singleContentWidth + gap;

    const measure = useCallback(() => {
      if (!innerRef.current || singleContentWidth <= 0) return;
      const sw = innerRef.current.scrollWidth;
      const total = Math.max(1, Math.ceil(sw / strideWidth));
      if (total !== lastTotal.current) {
        lastTotal.current = total;
        onTotalPagesChange(total, pagesPerTurn);
      }
    }, [singleContentWidth, strideWidth, onTotalPagesChange, pagesPerTurn]);

    useEffect(() => {
      // Re-emit when pagesPerTurn changes (responsive resize crosses spread threshold)
      onTotalPagesChange(lastTotal.current || 1, pagesPerTurn);
    }, [pagesPerTurn, onTotalPagesChange]);

    useEffect(() => {
      cancelAnimationFrame(measureRaf.current);
      measureRaf.current = requestAnimationFrame(() => {
        requestAnimationFrame(measure);
      });
      return () => cancelAnimationFrame(measureRaf.current);
    }, [children, availWidth, availHeight, measure]);

    useImperativeHandle(ref, () => ({
      getPageForSection: (sectionIndex: number) => {
        if (!innerRef.current || strideWidth === 0) return 0;
        const el = innerRef.current.querySelector(`[data-section-index="${sectionIndex}"]`);
        if (!el) return 0;
        const colIndex = Math.floor((el as HTMLElement).offsetLeft / strideWidth);
        // Snap to the start of a spread when in 2-up mode
        return wantsSpread ? colIndex - (colIndex % 2) : colIndex;
      },
    }), [strideWidth, wantsSpread]);

    // Translate by the page index. In spread mode `page` from parent is the
    // left page of the spread; we move two columns at a time.
    const translateX = page * strideWidth;

    // Reset scroll to top when page changes on mobile
    useEffect(() => {
      if (isMobile && outerRef.current) {
        outerRef.current.scrollTop = 0;
      }
    }, [page, isMobile]);

    const innerWidth = wantsSpread ? singleContentWidth * 2 + gap : singleContentWidth;

    return (
      <div
        ref={outerRef}
        className={`overflow-hidden relative flex justify-center ${isMobile && !fitToPage ? 'items-start' : 'items-center'} ${className || ''}`}
        style={{
          height: '100%',
          overflowY: isMobile && !fitToPage ? 'auto' : 'hidden',
          paddingTop: isMobile && !fitToPage ? 8 : 0,
          paddingBottom: isMobile && !fitToPage ? 16 : 0,
        }}
        onScroll={onScroll}
      >
        {bookWidth > 0 && (
          <div
            className="relative flex-shrink-0"
            style={{
              width: bookWidth,
              height: bookHeight,
              boxShadow: isMobile ? 'none' : '0 4px 32px rgba(0,0,0,0.18), 0 0 0 1px rgba(128,128,128,0.08)',
              borderRadius: isMobile ? 0 : 4,
              overflow: 'hidden',
            }}
          >
            {/* Center spine for spread mode */}
            {wantsSpread && (
              <div
                aria-hidden
                className="absolute top-0 bottom-0 pointer-events-none"
                style={{
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 1,
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.10) 12%, rgba(0,0,0,0.10) 88%, transparent 100%)',
                }}
              />
            )}

            <div
              style={{
                position: 'absolute',
                top: padTop,
                left: padLeft,
                width: innerWidth,
                height: contentHeight - folioHeight,
                overflow: 'hidden',
              }}
            >
              <div
                ref={innerRef}
                className="pocket-paragraphs"
                style={{
                  height: '100%',
                  columnWidth: `${singleContentWidth}px`,
                  columnGap: `${gap}px`,
                  columnFill: 'auto',
                  transform: `translateX(-${translateX}px)`,
                  transition: 'transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1.0)',
                  willChange: 'transform',
                }}
              >
                {children}
              </div>
            </div>

            {/* Folios */}
            {wantsSpread ? (
              <>
                <div
                  className="absolute flex justify-center pointer-events-none select-none"
                  style={{ bottom: padBottom * 0.3, left: 0, width: bookWidth / 2 }}
                >
                  <span className="text-muted-foreground/60 font-serif italic tracking-widest text-sm" style={{ fontVariant: 'small-caps' }}>
                    — {page + 1} —
                  </span>
                </div>
                <div
                  className="absolute flex justify-center pointer-events-none select-none"
                  style={{ bottom: padBottom * 0.3, left: bookWidth / 2, width: bookWidth / 2 }}
                >
                  <span className="text-muted-foreground/60 font-serif italic tracking-widest text-sm" style={{ fontVariant: 'small-caps' }}>
                    — {page + 2} —
                  </span>
                </div>
              </>
            ) : (
              <div
                className="absolute left-0 right-0 flex justify-center pointer-events-none select-none"
                style={{ bottom: isMobile ? 6 : padBottom * 0.3 }}
              >
                <span
                  className="text-muted-foreground/60 font-serif italic tracking-widest text-[11px] sm:text-xs md:text-sm lg:text-base"
                  style={{ fontVariant: 'small-caps' }}
                >
                  — {page + 1} —
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

PagedView.displayName = 'PagedView';
export default PagedView;
