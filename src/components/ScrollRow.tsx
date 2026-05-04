import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScrollRowProps {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

/**
 * Horizontally scrollable row with arrow buttons (works in both LTR and RTL).
 * The native scrollbar is hidden; users navigate via the arrow buttons or by
 * touch/wheel.
 */
const ScrollRow = ({ children, className = "", ariaLabel }: ScrollRowProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateState = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // scrollLeft is negative in RTL on most browsers; normalise via abs.
    const sl = Math.abs(el.scrollLeft);
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(sl > 4);
    setCanNext(sl < max - 4);
  }, []);

  useEffect(() => {
    updateState();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", updateState, { passive: true });
    const ro = new ResizeObserver(updateState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateState);
      ro.disconnect();
    };
  }, [updateState]);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const isRtl = getComputedStyle(el).direction === "rtl";
    const amount = el.clientWidth * 0.8 * dir * (isRtl ? -1 : 1);
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative group">
      <div
        ref={ref}
        aria-label={ariaLabel}
        className={`flex gap-4 px-5 overflow-x-auto scrollbar-hide scroll-smooth ${className}`}
      >
        {children}
      </div>

      {canPrev && (
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Previous"
          className="flex absolute start-1 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-background/90 border border-border/60 shadow-md backdrop-blur-sm text-foreground hover:bg-accent transition-colors z-10"
        >
          <ChevronLeft className="h-5 w-5 rtl:hidden" />
          <ChevronRight className="h-5 w-5 hidden rtl:block" />
        </button>
      )}
      {canNext && (
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Next"
          className="flex absolute end-1 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-background/90 border border-border/60 shadow-md backdrop-blur-sm text-foreground hover:bg-accent transition-colors z-10"
        >
          <ChevronRight className="h-5 w-5 rtl:hidden" />
          <ChevronLeft className="h-5 w-5 hidden rtl:block" />
        </button>
      )}
    </div>
  );
};

export default ScrollRow;
