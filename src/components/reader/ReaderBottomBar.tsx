import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface ReaderBottomBarProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onOpenToc: () => void;
  onGoToPage: (page: number) => void;
  hasPrev: boolean;
  hasNext: boolean;
}

const ReaderBottomBar = ({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onOpenToc,
  onGoToPage,
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
      {totalPages > 1 && (
        <div className="px-6 mb-2">
          <Slider
            min={1}
            max={totalPages}
            step={1}
            value={[currentPage]}
            onValueChange={([val]) => onGoToPage(val)}
            className="w-full"
          />
        </div>
      )}
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
