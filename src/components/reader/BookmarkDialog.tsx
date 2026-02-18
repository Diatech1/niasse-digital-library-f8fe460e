import { useState } from "react";
import { Bookmark, X } from "lucide-react";

interface BookmarkDialogProps {
  open: boolean;
  pageNumber: number;
  heading: string;
  existingNote?: string;
  onSave: (note: string) => void;
  onRemove: () => void;
  onClose: () => void;
  themeClasses: { bg: string; text: string };
}

const BookmarkDialog = ({
  open,
  pageNumber,
  heading,
  existingNote = "",
  onSave,
  onRemove,
  onClose,
  themeClasses,
}: BookmarkDialogProps) => {
  const [note, setNote] = useState(existingNote);

  if (!open) return null;

  const handleSave = () => {
    onSave(note.trim());
    onClose();
  };

  const handleRemove = () => {
    onRemove();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm rounded-2xl border border-border/30 shadow-2xl p-5 space-y-4 ${themeClasses.bg} ${themeClasses.text}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Page {pageNumber}</p>
              <p className="text-sm font-semibold leading-snug line-clamp-2">{heading}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 -mt-1 -mr-1 rounded-full hover:bg-muted/40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Note input */}
        <textarea
          autoFocus
          placeholder="Add a note… (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className={`w-full text-sm rounded-lg border border-border/40 bg-transparent px-3 py-2 resize-none focus:outline-none focus:border-primary placeholder:text-muted-foreground/60`}
        />

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleRemove}
            className="flex-1 py-2 rounded-xl text-sm border border-border/40 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            Remove
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-xl text-sm bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Save bookmark
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookmarkDialog;
