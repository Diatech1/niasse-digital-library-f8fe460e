import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export interface PagedViewHandle {
  getPageForSection: (sectionIndex: number) => number;
}

interface PagedViewProps {
  children: React.ReactNode;
  page: number;
  onTotalPagesChange: (total: number) => void;
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

    // On mobile: fit to viewport when fitToPage, else allow longer scrollable page
    // On desktop: 4:7 aspect ratio book (single page if fitToPage, double-height otherwise)
    const bookWidth = isMobile ? availWidth : Math.min(availWidth, availHeight * (4 / 7));
    const bookHeight = isMobile
      ? (fitToPage ? availHeight : availHeight * 4)
      : (fitToPage ? bookWidth * (7 / 4) : bookWidth * (7 / 4) * 2);

    const padTop = isMobile ? 16 : bookHeight * 0.08;
    const padBottom = isMobile ? 16 : bookHeight * 0.08;
    const padLeft = isMobile ? 20 : bookWidth * 0.10;
    const padRight = isMobile ? 20 : bookWidth * 0.08;

    const contentWidth = bookWidth - padLeft - padRight;
    const contentHeight = bookHeight - padTop - padBottom;
    const folioHeight = 20;

    const gap = 48;
    const strideWidth = contentWidth + gap;

    const measure = useCallback(() => {
      if (!innerRef.current || contentWidth <= 0) return;
      const sw = innerRef.current.scrollWidth;
      const total = Math.max(1, Math.ceil(sw / strideWidth));
      if (total !== lastTotal.current) {
        lastTotal.current = total;
        onTotalPagesChange(total);
      }
    }, [contentWidth, strideWidth, onTotalPagesChange]);

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
        return Math.floor((el as HTMLElement).offsetLeft / strideWidth);
      },
    }), [strideWidth]);

    const translateX = page * strideWidth;

    // Reset scroll to top when page changes on mobile
    useEffect(() => {
      if (isMobile && outerRef.current) {
        outerRef.current.scrollTop = 0;
      }
    }, [page, isMobile]);

    return (
      <div ref={outerRef} className={`overflow-hidden relative flex items-center justify-center ${className || ''}`} style={{ height: '100%', overflowY: isMobile && !fitToPage ? 'auto' : 'hidden' }} onScroll={onScroll}>
        {bookWidth > 0 && (
          <div
            className="relative flex-shrink-0"
            style={{
              width: bookWidth,
              height: bookHeight,
              boxShadow: isMobile ? 'none' : '0 2px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(128,128,128,0.08)',
              borderRadius: isMobile ? 0 : 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: padTop,
                left: padLeft,
                width: contentWidth,
                height: contentHeight - folioHeight,
                overflow: 'hidden',
              }}
            >
              <div
                ref={innerRef}
                className="pocket-paragraphs"
                style={{
                  height: '100%',
                  columnWidth: `${contentWidth}px`,
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

            <div
              className="absolute left-0 right-0 flex justify-center pointer-events-none select-none"
              style={{ bottom: isMobile ? 4 : padBottom * 0.3 }}
            >
              <span
                className="text-muted-foreground/40 font-serif italic tracking-widest"
                style={{ fontSize: 9, fontVariant: 'small-caps' }}
              >
                — {page + 1} —
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

PagedView.displayName = 'PagedView';
export default PagedView;
