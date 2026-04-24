import React from "react";

interface FormattedContentProps {
  content: string;
  fontSize: number;
  textColor?: string;
  dir?: "ltr" | "rtl";
}

/**
 * Renders book content with formatting matching the original PDF.
 */
const FormattedContent = ({ content, fontSize, textColor, dir = "ltr" }: FormattedContentProps) => {
  const paragraphs = content.split("\n\n").filter((p) => p.trim().length > 0);
  const isRtl = dir === "rtl";
  const proseAlign = isRtl ? "text-right" : "text-justify";

  return (
    <div className="formatted-content" dir={dir}>
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

        // Detect numbered list items (e.g. "1. Text..." or "1 & 2. Text...")
        const numberedItemMatch = trimmed.match(/^(\d+(?:\s*[&]\s*\d+)?)\.\s+([\s\S]+)$/);
        if (numberedItemMatch) {
          const num = numberedItemMatch[1];
          const text = numberedItemMatch[2];
          return (
            <div key={idx} className="flex gap-3 items-start py-1">
              <span
                className="shrink-0 font-semibold text-primary/80 tabular-nums"
                style={{ fontSize: fontSize * 0.85, minWidth: '1.6em', paddingTop: '0.1em' }}
              >
                {num}.
              </span>
              <p className={`leading-relaxed ${proseAlign} flex-1`} style={{ fontSize }}>
                {formatInlineText(text)}
              </p>
            </div>
          );
        }

        // Detect footnote blocks (lines starting with numbers followed by period, short text)
        if (/^\d+\.\s/.test(trimmed) && trimmed.length < 200) {
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

        // Detect Arabic text (Unicode Arabic block)
        const isArabic = /[\u0600-\u06FF]/.test(trimmed) && trimmed.replace(/[^\u0600-\u06FF\s]/g, '').length / trimmed.length > 0.3;
        if (isArabic) {
          return (
            <p
              key={idx}
              dir="rtl"
              lang="ar"
              className="leading-loose text-center my-4"
              style={{
                fontSize: fontSize * 1.35,
                fontFamily: "'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif",
                color: textColor || 'inherit',
                lineHeight: 2.2,
              }}
            >
              {trimmed}
            </p>
          );
        }

        // Detect poetry/verse lines (short lines with consistent pattern, NOT regular prose)
        const lines = trimmed.split("\n");
        const avgLineLen = lines.reduce((s, l) => s + l.trim().length, 0) / lines.length;
        const isPoetry = lines.length >= 3 && avgLineLen < 80 && lines.every((l) => l.trim().length < 100 && l.trim().length > 5)
          && !trimmed.includes(". "); // Poetry rarely has full sentences with periods
        if (isPoetry) {
          return (
            <blockquote key={idx} className="border-l-2 border-primary/60 pl-4 my-6 space-y-1">
              {lines.map((line, li) => (
                <p key={li} className="font-semibold" style={{ fontSize: fontSize * 0.95, color: textColor || 'inherit' }}>
                  {line.trim()}
                </p>
              ))}
            </blockquote>
          );
        }

        // First paragraph gets a drop cap (only if starts with uppercase)
        if (idx === 0 && trimmed.length > 100 && /^[A-Z]/.test(trimmed)) {
          const firstChar = trimmed[0];
          const rest = trimmed.slice(1);
          return (
            <p key={idx} className={`${proseAlign} leading-relaxed`} style={{ fontSize }}>
              <span
                className={`font-serif font-bold text-primary ${isRtl ? "float-right ml-2" : "float-left mr-2"}`}
                style={{ fontSize: fontSize * 3.2, lineHeight: 0.8, paddingTop: '0.05em' }}
              >
                {firstChar}
              </span>
              {formatInlineText(rest)}
            </p>
          );
        }

        // Regular paragraphs
        return (
          <p key={idx} className={`${proseAlign} leading-relaxed indent-6`} style={{ fontSize }}>
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
  // French typography: non-breaking space before :, ;, !, ?
  text = text.replace(/ :/g, '\u00a0:').replace(/ ;/g, '\u00a0;');

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
      // Parenthesized Arabic term - render in italic, same color as surrounding text
      parts.push(
        <em key={match.index} style={{ fontStyle: 'italic', color: 'inherit' }}>
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
