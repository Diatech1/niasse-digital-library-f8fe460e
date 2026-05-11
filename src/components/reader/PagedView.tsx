import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

export interface PagedViewHandle {
  getPageForSection: (sectionIndex: number) => number;
  /** Returns the section indices whose content overlaps the given display page. */
  getSectionsOnPage: (page: number) => number[];
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
    // Mobile: each "page" holds 2× viewport height of content. The reader
    // becomes vertically scrollable within a page; swipe still advances pages.
    const MOBILE_PAGE_MULTIPLIER = 2;
    const bookHeight = isMobile ? availHeight * MOBILE_PAGE_MULTIPLIER : bookWidth * A4_RATIO;

    // A4-style margins (mirror the asymmetric typographic margins of a real book page)
    const padTop = isMobile ? 56 : Math.round(bookHeight * 0.070);
    const padBottom = isMobile ? 24 : Math.round(bookHeight * 0.050);
    const padLeft = isMobile ? 24 : Math.round(bookWidth * 0.105);
    const padRight = isMobile ? 24 : Math.round(bookWidth * 0.105);

    const singleContentWidth = bookWidth - padLeft - padRight;
    const rawContentHeight = bookHeight - padTop - padBottom;

    // Snap content height down to a whole multiple of the body line-height so
    // that text lines never get vertically clipped at the bottom of a column
    // (which is what causes "cut sentences" — the last line is sliced in half
    // by `overflow: hidden` on the column box).
    // Body line-height = fontSize * 1.45 (matches `.pocket-paragraphs .formatted-content`).
    const baseFontPx = isMobile ? 17 : 17 * zoom;
    const lineStepPx = baseFontPx * 1.45;
    const contentHeight = rawContentHeight;

    // Folio band
    const folioFontPx = isMobile ? 10 : Math.max(9, Math.round(10 * Math.sqrt(zoom)));
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

      // ---- Fallback clip detection ----
      // Strategy: walk each candidate block, and only when it actually clips
      // (scrollWidth > clientWidth by more than ~0.5em), inspect its text
      // tokens via a Range to find the SPECIFIC word(s) that overflow.
      // We then wrap only those tokens in a <span data-clip-token> so the
      // CSS fallback (no hyphenation, overflow-wrap: anywhere) applies to
      // the smallest possible scope. The block itself is NOT tagged unless
      // we cannot localize the offender.
      const colW = singleContentWidth;
      const tolerance = Math.max(8, baseFontPx * 0.5);
      const candidates = innerRef.current.querySelectorAll<HTMLElement>(
        '.formatted-content p, .formatted-content blockquote, .formatted-content > .flex'
      );

      const unwrapPreviousFallbacks = (root: HTMLElement) => {
        root.querySelectorAll('span[data-clip-token="true"]').forEach((span) => {
          const parent = span.parentNode;
          if (!parent) return;
          while (span.firstChild) parent.insertBefore(span.firstChild, span);
          parent.removeChild(span);
        });
        // Merge adjacent text nodes so future Range walks stay clean.
        root.normalize();
      };

      candidates.forEach((el) => {
        // Always reset previous fallback markers so resize/zoom can recover.
        if (el.dataset.clipFallback === 'true') el.removeAttribute('data-clip-fallback');
        unwrapPreviousFallbacks(el);

        if (el.scrollWidth <= colW + tolerance) return;

        const sectionEl = el.closest<HTMLElement>('[data-section-index]');
        const sectionIdx = sectionEl?.dataset.sectionIndex ?? '?';

        // Walk text nodes; for each, use a Range to measure each whitespace-
        // separated token and find ones whose box exceeds the column width.
        const offenders: { node: Text; start: number; end: number; text: string }[] = [];
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let textNode = walker.nextNode() as Text | null;
        const range = document.createRange();
        while (textNode) {
          const text = textNode.nodeValue || '';
          // Match runs of non-whitespace (tokens). Whitespace can wrap freely.
          const tokenRe = /\S+/g;
          let m: RegExpExecArray | null;
          while ((m = tokenRe.exec(text)) !== null) {
            const start = m.index;
            const end = start + m[0].length;
            try {
              range.setStart(textNode, start);
              range.setEnd(textNode, end);
              const rects = range.getClientRects();
              let widest = 0;
              for (const r of rects) if (r.width > widest) widest = r.width;
              if (widest > colW + tolerance) {
                offenders.push({ node: textNode, start, end, text: m[0] });
              }
            } catch {
              /* ignore range errors on detached nodes */
            }
          }
          textNode = walker.nextNode() as Text | null;
        }

        if (offenders.length > 0) {
          // Wrap each offender token (work back-to-front per node so offsets stay valid).
          const byNode = new Map<Text, typeof offenders>();
          offenders.forEach((o) => {
            const arr = byNode.get(o.node) || [];
            arr.push(o);
            byNode.set(o.node, arr);
          });
          byNode.forEach((list, node) => {
            list.sort((a, b) => b.start - a.start);
            for (const o of list) {
              try {
                const r = document.createRange();
                r.setStart(node, o.start);
                r.setEnd(node, o.end);
                const span = document.createElement('span');
                span.dataset.clipToken = 'true';
                r.surroundContents(span);
              } catch {
                /* token spans element boundary — fall back to block tag */
                el.dataset.clipFallback = 'true';
              }
            }
          });
          const previews = offenders.slice(0, 3).map((o) => o.text).join(', ');
          // eslint-disable-next-line no-console
          console.warn(
            `[reader] inline clip fallback — section ${sectionIdx}, ` +
            `${offenders.length} token(s) > column=${colW.toFixed(1)}px ` +
            `(tol=${tolerance.toFixed(1)}px). Tokens: ${previews}${offenders.length > 3 ? '…' : ''}`
          );
        } else {
          // Could not localize a single token (e.g. inline-block, image, or
          // composite element overflow). Tag the whole block as before.
          el.dataset.clipFallback = 'true';
          const preview = (el.textContent || '').trim().slice(0, 80);
          // eslint-disable-next-line no-console
          console.warn(
            `[reader] block-level clip fallback — section ${sectionIdx}, ` +
            `no single token > column; tagging whole block ` +
            `(scrollWidth=${el.scrollWidth}px, column=${colW.toFixed(1)}px). ` +
            `Preview: "${preview}${preview.length === 80 ? '…' : ''}"`
          );
        }
      });
    }, [singleContentWidth, strideWidth, onTotalPagesChange, pagesPerTurn, baseFontPx]);

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
      getSectionsOnPage: (pageIdx: number) => {
        if (!innerRef.current || strideWidth === 0) return [];
        const pageStart = pageIdx * strideWidth;
        const pageEnd = pageStart + strideWidth;
        const els = Array.from(
          innerRef.current.querySelectorAll<HTMLElement>('[data-section-index]')
        );
        const result: number[] = [];
        for (const el of els) {
          const left = el.offsetLeft;
          const right = left + el.offsetWidth;
          // Section overlaps the page band [pageStart, pageEnd)
          if (right > pageStart && left < pageEnd) {
            const idx = Number(el.dataset.sectionIndex);
            if (!Number.isNaN(idx)) result.push(idx);
          }
        }
        return result;
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
        className={`reader-stage overflow-hidden relative flex justify-center ${allowDesktopScroll || isMobile ? 'items-start' : 'items-center'} ${className || ''}`}
        style={{
          height: '100%',
          overflowY: allowDesktopScroll || isMobile ? 'auto' : 'hidden',
          overflowX: allowDesktopScroll ? 'auto' : 'hidden',
          paddingTop: allowDesktopScroll ? stagePadY : 0,
          paddingBottom: allowDesktopScroll ? stagePadY : 0,
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
                height: Math.max(
                  lineStepPx,
                  Math.floor(contentHeight / lineStepPx) * lineStepPx
                ),
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
            className="fixed z-20 flex items-center gap-1 rounded-full border border-border/40 bg-background/85 px-1.5 py-1 shadow-md backdrop-blur"
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
              className="fixed left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/40 bg-background/85 text-foreground/80 shadow-md backdrop-blur transition-all hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onNextPage}
              disabled={!hasNext}
              aria-label="Next page"
              title="Next page"
              className="fixed right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/40 bg-background/85 text-foreground/80 shadow-md backdrop-blur transition-all hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-30"
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
