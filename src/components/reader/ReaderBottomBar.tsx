import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { useState, useRef } from "react";

interface ReaderBottomBarProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onOpenToc: () => void;
  onJumpToPage: (page: number) => void;
  hasPrev: boolean;
  hasNext: boolean;
}

const ReaderBottomBar = ({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onOpenToc,
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
    <div className="fixed bottom-0 left-0 right-0 border-t border-border/20 bg-inherit z-40">
      <div className="flex items-center justify-between px-6 py-2 text-xs text-muted-foreground">
        {editing ? (
          <div className="flex items-center gap-1">
            <span>Page</span>
            <input
              ref={inputRef}
              type="number"
              min={1}
              max={totalPages}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={commitJump}
              className="w-14 text-center rounded border border-primary/40 bg-transparent px-1 py-0.5 text-xs focus:outline-none focus:border-primary"
              style={{ appearance: "textfield" }}
            />
            <span>of {totalPages}</span>
          </div>
        ) : (
          <button
            onClick={startEditing}
            className="hover:text-primary transition-colors underline-offset-2 hover:underline"
            title="Tap to jump to a page"
          >
            Page {currentPage} of {totalPages}
          </button>
        )}
        <span>{progress}%</span>
      </div>
      <div className="h-1 bg-muted/30 mx-6 mb-2 rounded-full">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-around py-2 pb-safe">
        <button
          className="p-2 disabled:opacity-30"
          onClick={onPrevPage}
          disabled={!hasPrev}
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <button className="p-2" onClick={onOpenToc}>
          <List className="w-5 h-5 text-muted-foreground" />
        </button>
        <button
          className="p-2 disabled:opacity-30"
          onClick={onNextPage}
          disabled={!hasNext}
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default ReaderBottomBar;
