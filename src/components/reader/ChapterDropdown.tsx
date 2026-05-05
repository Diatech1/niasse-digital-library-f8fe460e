import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ChapterItem {
  chapter: string;
  sections: { id: string; heading: string }[];
}

interface ChapterDropdownProps {
  tocItems: ChapterItem[];
  currentSectionId: string;
  onSelectSection: (id: string) => void;
  themeClasses: { bg: string; text: string };
}

const ChapterDropdown = ({ tocItems, currentSectionId, onSelectSection, themeClasses }: ChapterDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentChapter = tocItems.find((ch) =>
    ch.sections.some((s) => s.id === currentSectionId)
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (tocItems.length === 0) return null;

  return (
    <div className="relative flex-1 min-w-0" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted/30 text-sm truncate max-w-full"
      >
        <span className="truncate">{currentChapter?.chapter || "Select chapter"}</span>
        <ChevronDown className="w-4 h-4 flex-shrink-0" />
      </button>
      {open && (
        <div
          className={`absolute top-full left-0 mt-1 w-72 max-h-80 overflow-y-auto rounded-lg border border-border/30 shadow-lg z-50 ${themeClasses.bg} ${themeClasses.text}`}
        >
          {tocItems.map((ch) => {
            const isSingletonSameTitle =
              ch.sections.length === 1 && ch.sections[0].heading === ch.chapter;

            if (isSingletonSameTitle) {
              const s = ch.sections[0];
              return (
                <button
                  key={ch.chapter}
                  onClick={() => {
                    onSelectSection(s.id);
                    setOpen(false);
                  }}
                  className={`block w-full text-left text-xs font-bold uppercase tracking-wider px-3 py-2 hover:bg-primary/10 transition-colors ${
                    s.id === currentSectionId ? "bg-primary/15 text-primary" : "text-primary"
                  }`}
                >
                  {ch.chapter}
                </button>
              );
            }

            return (
              <div key={ch.chapter}>
                <p className="text-xs font-bold text-primary uppercase tracking-wider px-3 pt-3 pb-1">
                  {ch.chapter}
                </p>
                {ch.sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectSection(s.id);
                      setOpen(false);
                    }}
                    className={`block w-full text-left text-sm py-1.5 px-4 hover:bg-primary/10 transition-colors ${
                      s.id === currentSectionId ? "bg-primary/15 font-semibold" : ""
                    }`}
                  >
                    {s.heading}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChapterDropdown;
