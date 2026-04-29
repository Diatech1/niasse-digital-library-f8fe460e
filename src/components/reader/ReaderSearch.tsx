import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Section {
  id: string;
  part?: string;
  chapter?: string;
  heading: string;
  content: string;
}

interface SearchResult {
  sectionIdx: number;
  heading: string;
  chapter?: string;
  snippet: string;
  matchCount: number;
}

interface ReaderSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: Section[];
  onNavigate: (sectionIdx: number) => void;
  themeClasses: { bg: string; text: string };
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-primary/30 text-inherit rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function extractSnippet(content: string, query: string, radius = 60): string {
  const lower = content.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return content.slice(0, 120) + "…";
  const start = Math.max(0, idx - radius);
  const end = Math.min(content.length, idx + query.length + radius);
  let snippet = content.slice(start, end);
  if (start > 0) snippet = "…" + snippet;
  if (end < content.length) snippet += "…";
  return snippet;
}

const ReaderSearch = ({ open, onOpenChange, sections, onNavigate, themeClasses }: ReaderSearchProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [open]);

  const results: SearchResult[] = useMemo(() => {
    const q = query.trim();
    if (q.length < 2) return [];
    const qLower = q.toLowerCase();

    return sections
      .map((section, idx) => {
        const contentLower = section.content.toLowerCase();
        const headingLower = section.heading.toLowerCase();
        const inContent = contentLower.includes(qLower);
        const inHeading = headingLower.includes(qLower);

        if (!inContent && !inHeading) return null;

        // Count matches
        let matchCount = 0;
        let searchIdx = 0;
        while ((searchIdx = contentLower.indexOf(qLower, searchIdx)) !== -1) {
          matchCount++;
          searchIdx += qLower.length;
        }
        if (inHeading) matchCount++;

        const snippet = inContent
          ? extractSnippet(section.content, q)
          : section.content.slice(0, 120) + "…";

        return {
          sectionIdx: idx,
          heading: section.heading,
          chapter: section.chapter,
          snippet,
          matchCount,
        };
      })
      .filter(Boolean) as SearchResult[];
  }, [query, sections]);

  const handleSelect = useCallback(
    (idx: number) => {
      onNavigate(idx);
      onOpenChange(false);
    },
    [onNavigate, onOpenChange]
  );

  const totalMatches = results.reduce((sum, r) => sum + r.matchCount, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className={`${themeClasses.bg} ${themeClasses.text} p-0 h-[85vh] lg:h-[80vh] lg:max-w-3xl lg:mx-auto lg:rounded-b-2xl`}>
        <SheetHeader className="px-4 pt-4 pb-0">
          <SheetTitle className={`${themeClasses.text} sr-only`}>Search</SheetTitle>
        </SheetHeader>

        {/* Search input */}
        <div className="px-4 pt-2 pb-3 border-b border-border/20">
          <div className="flex items-center gap-2 bg-muted/20 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search in book…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery("")} className="p-0.5">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          {query.length >= 2 && (
            <p className="text-xs text-muted-foreground mt-2 px-1">
              {totalMatches} match{totalMatches !== 1 ? "es" : ""} in {results.length} section
              {results.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Results */}
        <ScrollArea className="h-[calc(85vh-120px)]">
          <div className="px-4 py-3 space-y-2">
            {query.length < 2 && (
              <p className="text-sm text-muted-foreground text-center py-12">
                Type at least 2 characters to search
              </p>
            )}

            {query.length >= 2 && results.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-12">
                No results found for "{query}"
              </p>
            )}

            {results.map((r) => (
              <button
                key={r.sectionIdx}
                onClick={() => handleSelect(r.sectionIdx)}
                className="block w-full text-left rounded-lg p-3 hover:bg-primary/10 transition-colors border border-border/10"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold truncate pr-2">
                    {highlightMatch(r.heading, query)}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {r.matchCount} match{r.matchCount !== 1 ? "es" : ""}
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
                {r.chapter && (
                  <p className="text-xs text-primary/70 mb-1">{r.chapter}</p>
                )}
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {highlightMatch(r.snippet, query)}
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ReaderSearch;
