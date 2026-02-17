import React from "react";

interface FormattedContentProps {
  content: string;
  fontSize: number;
}

/**
 * Renders book content with formatting matching the original PDF:
 * - Drop cap on first paragraph
 * - Italic for transliterated Arabic terms (parenthesized)
 * - Footnote numbers as superscript
 * - Poetry/verse blocks with indentation
 * - Proper paragraph spacing with justified text
 */
const FormattedContent = ({ content, fontSize }: FormattedContentProps) => {
  const paragraphs = content.split("\n\n").filter((p) => p.trim().length > 0);

  return (
    <div className="formatted-content space-y-4">
      {paragraphs.map((para, idx) => {
        const trimmed = para.trim();

        // Detect page number markers {{PAGE:N}}
        const pageMatch = trimmed.match(/^\{\{PAGE:(\d+)\}\}$/);
        if (pageMatch) {
          return (
            <div key={idx} className="flex justify-end -my-1">
              <span
                className="text-muted-foreground/40 select-none font-serif italic"
                style={{ fontSize: fontSize * 0.65 }}
              >
                p. {pageMatch[1]}
              </span>
            </div>
          );
        }

        // Detect footnote blocks (lines starting with numbers followed by period)
        if (/^\d+\.\s/.test(trimmed) && trimmed.length < 500) {
          const footnotes = trimmed.split(/\n/).filter((l) => l.trim());
          return (
            <div key={idx} className="border-t border-border/30 pt-3 mt-6">
              {footnotes.map((fn, fi) => (
                <p key={fi} className="text-muted-foreground mb-1.5" style={{ fontSize: fontSize * 0.8 }}>
                  {formatInlineText(fn)}
                </p>
              ))}
            </div>
          );
        }

        // Detect poetry/verse lines (short lines with consistent pattern, NOT regular prose)
        const lines = trimmed.split("\n");
        const avgLineLen = lines.reduce((s, l) => s + l.trim().length, 0) / lines.length;
        const isPoetry = lines.length >= 3 && avgLineLen < 80 && lines.every((l) => l.trim().length < 100 && l.trim().length > 5)
          && !trimmed.includes(". "); // Poetry rarely has full sentences with periods
        if (isPoetry) {
          return (
            <blockquote key={idx} className="border-l-2 border-primary/40 pl-4 my-6 space-y-1">
              {lines.map((line, li) => (
                <p key={li} className="text-foreground/90 italic" style={{ fontSize: fontSize * 0.95 }}>
                  {line.trim()}
                </p>
              ))}
            </blockquote>
          );
        }

        // First paragraph gets a drop cap
        if (idx === 0 && trimmed.length > 100) {
          const firstChar = trimmed[0];
          const rest = trimmed.slice(1);
          return (
            <p key={idx} className="text-justify leading-relaxed" style={{ fontSize }}>
              <span
                className="float-left font-serif font-bold text-primary"
                style={{ fontSize: fontSize * 3.2, lineHeight: 0.8, marginRight: '0.08em', paddingTop: '0.05em' }}
              >
                {firstChar}
              </span>
              {formatInlineText(rest)}
            </p>
          );
        }

        // Regular paragraphs
        return (
          <p key={idx} className="text-justify leading-relaxed indent-6" style={{ fontSize }}>
            {formatInlineText(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Format inline text:
 * - Superscript footnote references (digits after punctuation)
 * - Italic for transliterated terms in parentheses like (ma'rifa), (tarbiya)
 * - Italic for book/work titles detected by patterns
 */
function formatInlineText(text: string): React.ReactNode {
  // Split on patterns we want to style
  const parts: React.ReactNode[] = [];
  
  // Pattern for parenthesized Arabic terms and footnote superscripts
  const regex = /(\([a-zA-Zāīūḥṣṭḍẓʿʾ''-]+(?:\s+[a-zA-Zāīūḥṣṭḍẓʿʾ''-]+)*\))|(\b\d{1,2}(?=\s|$|[.,;:])(?!\d))/g;
  
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // Parenthesized Arabic term - render in italic
      parts.push(
        <em key={match.index} className="text-foreground/80 not-italic" style={{ fontStyle: 'italic' }}>
          {match[1]}
        </em>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
}

export default FormattedContent;
