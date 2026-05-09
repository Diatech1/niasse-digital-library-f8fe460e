import React from "react";

interface FormattedContentProps {
  content: string;
  fontSize: number;
  textColor?: string;
  dir?: "ltr" | "rtl";
  lang?: string;
  centered?: boolean;
  /** Render each paragraph as a verse line of a poem/doua. */
  poem?: boolean;
}

/**
 * Renders book content with formatting matching the original PDF.
 */
const FormattedContent = ({ content, fontSize, textColor, dir = "ltr", lang, centered = false, poem = false }: FormattedContentProps) => {
  const paragraphs = content.split("\n\n").filter((p) => p.trim().length > 0);
  const isRtl = dir === "rtl";
  const proseAlign = (centered || poem) ? "text-center" : (isRtl ? "text-right" : "text-justify");

  if (poem) {
    return (
      <div className="formatted-content poem-content" dir={dir} lang={lang}>
        {paragraphs.map((para, idx) => {
          const trimmed = para.trim();
          const isArabic = /[\u0600-\u06FF]/.test(trimmed) && trimmed.replace(/[^\u0600-\u06FF\s]/g, '').length / trimmed.length > 0.3;
          if (isArabic) {
            return (
              <p key={idx} dir="rtl" lang="ar" className="text-center my-5"
                style={{
                  fontSize: fontSize * 1.15,
                  fontFamily: "'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif",
                  color: textColor || 'inherit',
                  lineHeight: 1.7,
                }}>
                {trimmed}
              </p>
            );
          }
          if (/^\(.*\)$/.test(trimmed) && trimmed.length < 80) {
            return (
              <p key={idx} className="text-center my-3 italic text-muted-foreground"
                style={{ fontSize: fontSize * 0.85 }}>
                {trimmed}
              </p>
            );
          }
          return (
            <p key={idx} className="text-center my-3 font-serif"
              style={{
                fontSize: fontSize * 1.02,
                lineHeight: 1.6,
                color: textColor || 'inherit',
                fontStyle: 'italic',
                letterSpacing: '0.01em',
              }}>
              {formatInlineText(trimmed)}
            </p>
          );
        })}
      </div>
    );
  }

  return (
    <div className="formatted-content space-y-4" dir={dir} lang={lang}>
      {paragraphs.map((para, idx) => {
        const trimmed = para.trim();

        // Skip empty markdown heading markers (## with no content)
        if (/^#+\s*$/.test(trimmed)) {
          return null;
        }

        // Markdown headings: # / ## / ### ...
        const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const text = headingMatch[2].trim();
          const isArabicHeading = /[\u0600-\u06FF]/.test(text) && text.replace(/[^\u0600-\u06FF\s]/g, '').length / text.length > 0.3;
          const sizeMul = level === 1 ? 1.6 : level === 2 ? 1.35 : 1.15;
          return (
            <h3
              key={idx}
              dir={isArabicHeading ? "rtl" : dir}
              lang={isArabicHeading ? "ar" : lang}
              className="text-center font-semibold mt-8 mb-4 text-primary"
              style={{
                fontSize: fontSize * sizeMul * (isArabicHeading ? 1.2 : 1),
                fontFamily: isArabicHeading
                  ? "'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', serif"
                  : undefined,
                lineHeight: isArabicHeading ? 1.8 : 1.3,
              }}
            >
              {text}
            </h3>
          );
        }

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
              className="my-3"
              style={{
                fontSize: fontSize * 1.15,
                fontFamily: "'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', serif",
                color: textColor || 'inherit',
                lineHeight: 1.7,
                textAlign: 'justify',
                textAlignLast: 'center',
                fontFeatureSettings: '"liga", "calt", "kern"',
                hyphens: 'none',
              } as React.CSSProperties}
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

        // Italic opener: date/location header at the start of a letter.
        // e.g. "From the city of Kaolack, on the 25th of Rabi' al-Thani 1356..."
        //      "From Kaolack, 27 Jumadah al-Ula 1363, to Dakar."
        //      "From the City of Kaolack at the end of the year 1358 AH..."
        //      "From the dictations of our Shaikh to al-Hajj Sidi Ali Cisse..."
        const isOpener =
          trimmed.length < 320 &&
          /^From\s+(?:the\s+(?:city|City)\s+of\s+|the\s+dictations?\s+of\s+|Kaolack|Kawl|Kawsī|Koussi|Medina|Fez|Fes|Dakar)/i.test(trimmed);

        // Standalone date / place-date line (often follows the body, before signature)
        // e.g. "Kaolack, 13 Safar 1361 AH."
        //      "Kaolack, Senegal 1354H/1935"
        //      "Medina-Baye, Kaolack Interpreted from the Arabic..."
        const isDateLine =
          trimmed.length < 240 &&
          (
            /^(?:Kaolack|Kawl[aā]kh|Medina(?:-Baye)?|Fez|Fes|Dakar|Senegal)\b[^.]*\d{3,4}\s*(?:AH|H|CE|Hijri)?/i.test(trimmed) ||
            /^\d{3,4}\s*(?:AH|H|CE|Hijri)\b/i.test(trimmed)
          );

        // Italic signature block: author name, sender note, blessings, transcriber line
        const isSignature =
          trimmed.length < 320 &&
          (
            /^(?:Ibrahim|Ibrāhīm|Ibrahīm|Ibr[aā]h[iī]m)\b/i.test(trimmed) ||
            /^(?:Your\s+(?:sympathizing|humble|noble|loving|sincere|devoted|brother|servant|slave)|He\s+sends\s+this|Transcribed\s+by|Dictated\s+by|Written\s+by|Signed(?:\s+by)?|Sent\s+by|Compiled\s+by|This\s+(?:was\s+)?(?:written|dictated|transcribed)\s+by|The\s+(?:humble|poor)\s+(?:servant|slave))/i.test(trimmed) ||
            /^May\s+Allah\s+(?:be\s+kind\s+to\s+him|elevate|reward|have\s+mercy|bless\s+the\s+author|allow\s+(?:us|him))/i.test(trimmed) ||
            /^May\s+Allah[\u2019']?s\s+(?:Mercy|Peace|Blessings)/i.test(trimmed) ||
            /[—–-]\s*may\s+Allah\s+be\s+kind\s+to\s+him/i.test(trimmed) ||
            /^Wa[s\-\s]?sal[aā]m/i.test(trimmed) ||
            /^Peace(?:\s+(?:and|be))?\b/i.test(trimmed) && trimmed.length < 80
          );

        if (isOpener || isDateLine || isSignature) {
          return (
            <p
              key={idx}
              className={`${proseAlign} leading-relaxed italic`}
              style={{ fontSize, color: textColor || 'inherit' }}
            >
              {formatInlineText(trimmed)}
            </p>
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
          <p key={idx} className={`${proseAlign} leading-relaxed ${centered ? "" : "indent-6"}`} style={{ fontSize }}>
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
