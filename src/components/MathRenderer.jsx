"use client";

import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

export default function MathRenderer({ text = "", style = {} }) {
  const parts = useMemo(() => {
    const tokens = [];
    // Match $$...$$ (block) before $...$ (inline) to avoid partial matches
    const regex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ type: "text", content: text.slice(lastIndex, match.index) });
      }
      const raw = match[0];
      const isBlock = raw.startsWith("$$");
      const latex = isBlock ? raw.slice(2, -2).trim() : raw.slice(1, -1).trim();
      tokens.push({ type: isBlock ? "block" : "inline", content: latex });
      lastIndex = match.index + raw.length;
    }

    if (lastIndex < text.length) {
      tokens.push({ type: "text", content: text.slice(lastIndex) });
    }

    return tokens;
  }, [text]);

  return (
    <span style={style}>
      {parts.map((part, i) => {
        if (part.type === "text") {
          return <span key={i} style={{ whiteSpace: "pre-wrap" }}>{part.content}</span>;
        }
        try {
          const html = katex.renderToString(part.content, {
            displayMode: part.type === "block",
            throwOnError: false,
            strict: false,
          });
          return (
            <span
              key={i}
              dangerouslySetInnerHTML={{ __html: html }}
              style={part.type === "block" ? { display: "block", textAlign: "center", margin: "6px 0" } : { display: "inline" }}
            />
          );
        } catch {
          return <span key={i}>{part.content}</span>;
        }
      })}
    </span>
  );
}
