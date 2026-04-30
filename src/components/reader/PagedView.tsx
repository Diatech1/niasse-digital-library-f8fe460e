import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

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
  onPrevPage?: () => void;
  onNextPage?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

// True A4 ratio (height / width)
const A4_RATIO = 297 / 210; // ≈ 1.4142

const ZOOM_KEY = 'faydabook-reader-zoom';
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 0.1;

const PagedView = forwardRef<PagedViewHandle, PagedViewProps>(
  ({ children, page, onTotalPagesChange, className, onScroll, fitToPage = false, onPrevPage, onNextPage, hasPrev, hasNext }, ref) => {
    const outerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const [availWidth, setAvailWidth] = useState(0);
    const [availHeight, setAvailHeight] = useState(0);
    const lastTotal = useRef(0);
    const measureRaf = useRef(0);
    const isMobile = useIsMobile();

    // Zoom (desktop only). 1.0 = "fit to viewport".
    const [zoom, setZoom] = useState<number>(() => {
      const saved = parseFloat(localStorage.getItem(ZOOM_KEY) || '');
      return isNaN(saved) ? 1 : Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, saved));
    });
    useEffect(() => {
      localStorage.setItem(ZOOM_KEY, String(zoom));
    }, [zoom]);

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

    // Single A4 page. Mobile keeps existing full-width behavior.
    const stagePadX = isMobile ? 0 : 40;
    const stagePadY = isMobile ? 0 : 32;
    const fitWidthBy = Math.max(0, availWidth - stagePadX * 2);
    const fitHeightBy = Math.max(0, availHeight - stagePadY * 2);
    // Fit a single A4 portrait to the viewport at zoom = 1
    const fitWidthFromHeight = fitHeightBy / A4_RATIO;
    const baseWidth = isMobile ? availWidth : Math.min(fitWidthBy, fitWidthFromHeight);

    const pagesPerTurn = 1;
    const wantsSpread = false;

    const bookWidth = isMobile ? availWidth : baseWidth * zoom;
    const bookHeight = isMobile
      ? (fitToPage ? availHeight : availHeight * 4)
      : bookWidth * A4_RATIO;

    // A4-style margins (mirror the asymmetric typographic margins of a real book page)
    const padTop = isMobile ? 56 : Math.round(bookHeight * 0.085);
    const padBottom = isMobile ? 24 : Math.round(bookHeight * 0.095);
    const padLeft = isMobile ? 24 : Math.round(bookWidth * 0.105);
    const padRight = isMobile ? 24 : Math.round(bookWidth * 0.105);

    const singleContentWidth = bookWidth - padLeft - padRight;
    const contentHeight = bookHeight - padTop - padBottom;

    // Folio band
    const folioFontPx = isMobile ? 11 : Math.max(11, Math.round(12 * Math.sqrt(zoom)));
    const folioLineHeight = Math.ceil(folioFontPx * 1.4);
    const folioBandHeight = Math.max(folioLineHeight + 6, 20);

    const gap = isMobile ? 48 : 0; // single page → gap unused for layout but used for column stride
    const strideWidth = singleContentWidth + (isMobile ? gap : 48);

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
    }, [children, availWidth, availHeight, zoom, measure]);

    useImperativeHandle(ref, () => ({
      getPageForSection: (sectionIndex: number) => {
        if (!innerRef.current || strideWidth === 0) return 0;
        const el = innerRef.current.querySelector(`[data-section-index="${sectionIndex}"]`);
        if (!el) return 0;
        return Math.floor((el as HTMLElement).offsetLeft / strideWidth);
      },
    }), [strideWidth]);

    const translateX = page * strideWidth;

    // Reset scroll on page change (mobile vertical, desktop both axes when zoomed)
    useEffect(() => {
      if (!outerRef.current) return;
      outerRef.current.scrollTop = 0;
      if (!isMobile) outerRef.current.scrollLeft = 0;
    }, [page, isMobile]);

    // Allow scrolling on desktop only when the page is bigger than the viewport (i.e. zoomed in)
    const allowDesktopScroll = !isMobile && (bookWidth > fitWidthBy + 1 || bookHeight > fitHeightBy + 1);

    const handleZoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
    const handleZoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));
    const handleZoomReset = () => setZoom(1);

    return (
      <div
        ref={outerRef}
        className={`reader-stage overflow-hidden relative flex justify-center ${(isMobile && !fitToPage) || allowDesktopScroll ? 'items-start' : 'items-center'} ${className || ''}`}
        style={{
          height: '100%',
          overflowY: (isMobile && !fitToPage) || allowDesktopScroll ? 'auto' : 'hidden',
          overflowX: allowDesktopScroll ? 'auto' : 'hidden',
          paddingTop: isMobile && !fitToPage ? 8 : (allowDesktopScroll ? stagePadY : 0),
          paddingBottom: isMobile && !fitToPage ? 16 : (allowDesktopScroll ? stagePadY : 0),
        }}
        onScroll={onScroll}
      >
        {bookWidth > 0 && (
          <div
            className="reader-book relative flex-shrink-0"
            style={{
              width: bookWidth,
              height: bookHeight,
              borderRadius: isMobile ? 0 : 2,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: padTop,
                left: padLeft,
                width: singleContentWidth,
                height: contentHeight - folioBandHeight,
                overflow: 'hidden',
              }}
            >
              <div
                ref={innerRef}
                className="pocket-paragraphs"
                style={{
                  height: '100%',
                  fontSize: isMobile ? undefined : `${zoom}em`,
                  columnWidth: `${singleContentWidth}px`,
                  columnGap: `${isMobile ? gap : 48}px`,
                  columnFill: 'auto',
                  transform: `translateX(-${translateX}px)`,
                  transition: 'transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                  willChange: 'transform',
                }}
              >
                {children}
              </div>
            </div>

            {/* Folio */}
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
          </div>
        )}

        {/* Desktop zoom controls — floating, sticky to the stage */}
        {!isMobile && availWidth > 0 && (
          <div
            className="absolute z-20 flex items-center gap-1 rounded-full border border-border/40 bg-background/85 px-1.5 py-1 shadow-md backdrop-blur"
            style={{ bottom: 16, right: 16 }}
          >
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= ZOOM_MIN + 0.001}
              className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-accent disabled:opacity-40"
              aria-label="Zoom out"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomReset}
              className="min-w-[3.25rem] rounded-full px-2 py-0.5 text-xs font-medium tabular-nums text-foreground/80 transition-colors hover:bg-accent"
              aria-label="Reset zoom"
              title="Fit page"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= ZOOM_MAX - 0.001}
              className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-accent disabled:opacity-40"
              aria-label="Zoom in"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <div className="mx-0.5 h-4 w-px bg-border/60" aria-hidden />
            <button
              type="button"
              onClick={handleZoomReset}
              className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-accent"
              aria-label="Fit to page"
              title="Fit to page"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Side navigation arrows (desktop) */}
        {!isMobile && availWidth > 0 && (
          <>
            <button
              type="button"
              onClick={onPrevPage}
              disabled={!hasPrev}
              aria-label="Previous page"
              title="Previous page"
              className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/40 bg-background/85 text-foreground/80 shadow-md backdrop-blur transition-all hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onNextPage}
              disabled={!hasNext}
              aria-label="Next page"
              title="Next page"
              className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/40 bg-background/85 text-foreground/80 shadow-md backdrop-blur transition-all hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    );
  }
);

PagedView.displayName = 'PagedView';
export default PagedView;
