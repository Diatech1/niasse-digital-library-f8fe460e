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

    // Desktop: open-book two-page spread (each page ~ A5 portrait, ratio 1:1.414).
    // Mobile: full-width single page (existing behavior).
    const PAGE_RATIO = 1.45; // height / width per page — slightly taller than A4 for elegance
    const horizontalMargin = 96; // breathing room on left/right of the book
    const verticalMargin = 40;
    const maxStageHeight = Math.max(0, availHeight - verticalMargin * 2);
    const maxStageWidth = Math.max(0, availWidth - horizontalMargin * 2);

    // Decide spread vs single page on desktop based on available width.
    const wantsSpread = !isMobile && availWidth >= 980;
    const pagesPerTurn = wantsSpread ? 2 : 1;

    let bookWidth: number;
    let bookHeight: number;
    if (isMobile) {
      bookWidth = availWidth;
      bookHeight = fitToPage ? availHeight : availHeight * 4;
    } else if (wantsSpread) {
      // book spread = 2 pages side by side
      const widthFromHeight = (maxStageHeight / PAGE_RATIO) * 2;
      bookWidth = Math.min(maxStageWidth, widthFromHeight, 1280);
      bookHeight = (bookWidth / 2) * PAGE_RATIO;
    } else {
      const widthFromHeight = maxStageHeight / PAGE_RATIO;
      bookWidth = Math.min(maxStageWidth, widthFromHeight, 720);
      bookHeight = bookWidth * PAGE_RATIO;
    }

    // Per-page padding (asymmetric: outer margin larger than inner gutter, like real books)
    const singlePageWidth = bookWidth / pagesPerTurn;
    const padTop = isMobile ? 56 : Math.round(bookHeight * 0.085);
    const padBottom = isMobile ? 24 : Math.round(bookHeight * 0.085);
    const padOuter = isMobile ? 24 : Math.round(singlePageWidth * 0.11);
    const padInner = isMobile ? 24 : Math.round(singlePageWidth * 0.085);
    // For single-page (or mobile), use symmetric padding
    const padLeft = wantsSpread ? padOuter : (isMobile ? 24 : padOuter);
    const padRight = wantsSpread ? padOuter : (isMobile ? 24 : padOuter);

    const singleContentWidth = singlePageWidth - padLeft - padRight;
    const contentHeight = bookHeight - padTop - padBottom;

    // Reserved band for folio
    const folioFontPx = isMobile ? 11 : 12;
    const folioLineHeight = Math.ceil(folioFontPx * 1.4);
    const folioBandHeight = Math.max(folioLineHeight + 6, 20);
    const folioHeight = folioBandHeight;

    // Column gap = inner gutter (both gutters around the spine)
    const gap = wantsSpread ? padInner * 2 : (isMobile ? 48 : 48);
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
        return wantsSpread ? colIndex - (colIndex % 2) : colIndex;
      },
    }), [strideWidth, wantsSpread]);

    const translateX = page * strideWidth;

    useEffect(() => {
      if (isMobile && outerRef.current) {
        outerRef.current.scrollTop = 0;
      }
    }, [page, isMobile]);

    const innerWidth = wantsSpread ? singleContentWidth * 2 + gap : singleContentWidth;

    return (
      <div
        ref={outerRef}
        className={`reader-stage overflow-hidden relative flex justify-center ${isMobile && !fitToPage ? 'items-start' : 'items-center'} ${className || ''}`}
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
            className="reader-book relative flex-shrink-0"
            style={{
              width: bookWidth,
              height: bookHeight,
              borderRadius: isMobile ? 0 : 6,
            }}
          >
            {/* Center spine for spread mode */}
            {wantsSpread && (
              <>
                {/* Soft inner shadow on both inner edges to suggest the gutter */}
                <div
                  aria-hidden
                  className="absolute top-0 bottom-0 pointer-events-none z-10"
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 40,
                    background:
                      'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.10) 35%, rgba(0,0,0,0.18) 50%, rgba(0,0,0,0.10) 65%, transparent 100%)',
                  }}
                />
                {/* Crisp spine line */}
                <div
                  aria-hidden
                  className="absolute top-0 bottom-0 pointer-events-none z-10"
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 1,
                    background:
                      'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.18) 12%, rgba(0,0,0,0.18) 88%, transparent 100%)',
                  }}
                />
              </>
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
                  transition: 'transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
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
                  className="absolute flex items-center justify-center pointer-events-none select-none"
                  style={{
                    bottom: Math.max(0, (padBottom - folioBandHeight) / 2),
                    left: 0,
                    width: bookWidth / 2,
                    height: folioBandHeight,
                    lineHeight: `${folioLineHeight}px`,
                  }}
                >
                  <span
                    className="text-muted-foreground/60 font-serif italic tracking-widest"
                    style={{ fontVariant: 'small-caps', fontSize: `${folioFontPx}px` }}
                  >
                    — {page + 1} —
                  </span>
                </div>
                <div
                  className="absolute flex items-center justify-center pointer-events-none select-none"
                  style={{
                    bottom: Math.max(0, (padBottom - folioBandHeight) / 2),
                    left: bookWidth / 2,
                    width: bookWidth / 2,
                    height: folioBandHeight,
                    lineHeight: `${folioLineHeight}px`,
                  }}
                >
                  <span
                    className="text-muted-foreground/60 font-serif italic tracking-widest"
                    style={{ fontVariant: 'small-caps', fontSize: `${folioFontPx}px` }}
                  >
                    — {page + 2} —
                  </span>
                </div>
              </>
            ) : (
              <div
                className="absolute left-0 right-0 flex items-center justify-center pointer-events-none select-none"
                style={{
                  bottom: Math.max(0, (padBottom - folioBandHeight) / 2),
                  height: folioBandHeight,
                  lineHeight: `${folioLineHeight}px`,
                }}
              >
                <span
                  className="text-muted-foreground/60 font-serif italic tracking-widest"
                  style={{ fontVariant: 'small-caps', fontSize: `${folioFontPx}px` }}
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
