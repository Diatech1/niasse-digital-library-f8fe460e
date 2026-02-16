import { ChevronLeft, ChevronRight, List, Search, Type } from "lucide-react";

interface ReaderBottomBarProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onOpenToc: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

const ReaderBottomBar = ({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onOpenToc,
  hasPrev,
  hasNext,
}: ReaderBottomBarProps) => {
  const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border/20 bg-inherit z-40">
      <div className="flex items-center justify-between px-6 py-2 text-xs text-muted-foreground">
        <span>
          Page {currentPage} of {totalPages}
        </span>
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
