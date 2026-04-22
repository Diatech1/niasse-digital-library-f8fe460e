import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";

interface ReaderBottomBarProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onJumpToPage: (page: number) => void;
  hasPrev: boolean;
  hasNext: boolean;
}

const ReaderBottomBar = ({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onJumpToPage,
  hasPrev,
  hasNext,
}: ReaderBottomBarProps) => {
  const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    setInputVal(String(currentPage));
    setEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const commitJump = () => {
    const n = parseInt(inputVal, 10);
    if (!isNaN(n) && n >= 1 && n <= totalPages) {
      onJumpToPage(n);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitJump();
    if (e.key === "Escape") setEditing(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/20 bg-background/95 backdrop-blur-sm">
      <div className="mx-5 mt-2 h-0.5 rounded-full bg-muted/30">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="grid grid-cols-[48px_minmax(0,1fr)_48px] items-center px-3 py-2 pb-safe">
        {hasPrev ? (
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={onPrevPage}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="h-10 w-10" aria-hidden="true" />
        )}

        {editing ? (
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <input
              ref={inputRef}
              type="number"
              min={1}
              max={totalPages}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={commitJump}
              className="w-14 rounded border border-primary/40 bg-transparent px-1 py-0.5 text-center text-xs focus:border-primary focus:outline-none"
              style={{ appearance: "textfield" }}
            />
            <span>/ {totalPages}</span>
          </div>
        ) : (
          <button
            onClick={startEditing}
            className="justify-self-center rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            title="Jump to page"
            aria-label="Jump to page"
          >
            {currentPage} <span className="text-muted-foreground/70">/ {totalPages}</span>
          </button>
        )}

        {hasNext ? (
          <button
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={onNextPage}
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : (
          <div className="ml-auto h-10 w-10" aria-hidden="true" />
        )}
      </div>
    </div>
  );
};

export default ReaderBottomBar;
