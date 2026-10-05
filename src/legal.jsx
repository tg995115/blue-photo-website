import React from "react";
import { readFile } from "node:fs/promises";

// A deliberately limited, escaped renderer for these four reviewed documents.
// Raw HTML, scripts and embedded content are never interpreted.
function Inline({ text, markdown }) {
  return text
    .split(/(\*\*[^*]+\*\*|https?:\/\/[^\s|\u0080-\uFFFF]+)/g)
    .map((part, index) => {
      if (markdown && part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (/^https?:\/\//.test(part))
        return (
          <a key={index} href={part}>
            {part}
          </a>
        );
      return part;
    });
}

export async function readLegal(kind, lang) {
  const markdown = kind === "privacy";
  const file = `${markdown ? "privacy-policy" : "terms-of-service"}.${lang}.${markdown ? "md" : "txt"}`;
  const source = await readFile(`public/legal/${file}`, "utf8");
  const blocks = source.trim().split(/\n\s*\n/);
  const title = blocks[0].replace(/^#\s+/, "");
  return { title, blocks, file, markdown };
}

export function LegalDocument({ document, lang, pathFor }) {
  const { blocks, file, markdown } = document;
  return (
    <main id="main" className="legal-page container">
      <nav
        className="legal-toolbar"
        aria-label={lang === "ko" ? "문서 메뉴" : "Document navigation"}
      >
        <a href={pathFor(lang === "ko" ? "/" : "/en/")}>
          {lang === "ko" ? "← 앱 소개" : "← About the app"}
        </a>
        <a href={pathFor(`/legal/${file}`)} download>
          {lang === "ko"
            ? markdown
              ? "Markdown 다운로드"
              : "텍스트 다운로드"
            : markdown
              ? "Download Markdown"
              : "Download text"}
        </a>
      </nav>
      <article className="legal-content" data-legal-content>
        {blocks.map((block, index) => {
          const heading = markdown
            ? block.match(/^(#{1,2})\s+([^\n]+)$/)
            : null;
          if (
            heading ||
            (!markdown && (index === 0 || /^\d+\.\s[^\n]+$/.test(block)))
          ) {
            const Tag = index === 0 ? "h1" : "h2";
            return <Tag key={index}>{heading ? heading[2] : block}</Tag>;
          }
          if (markdown && block.startsWith("|")) {
            const rows = block.split("\n").map((line) =>
              line
                .trim()
                .replace(/^\||\|$/g, "")
                .split("|")
                .map((cell) => cell.trim()),
            );
            if (
              rows[0].length !== 2 ||
              !rows[1]?.every((cell) => /^:?-+:?$/.test(cell)) ||
              rows.some((row) => row.length !== 2)
            )
              throw new Error(`Unsupported legal table in ${file}`);
            return (
              <table key={index}>
                <colgroup>
                  <col className="legal-key-column" />
                  <col />
                </colgroup>
                <thead>
                  <tr>
                    {rows[0].map((cell, i) => (
                      <th key={i} scope="col">
                        <Inline text={cell} markdown />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(2).map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => (
                        <td key={c}>
                          <Inline text={cell} markdown />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          }
          return (
            <p key={index}>
              <Inline text={block} markdown={markdown} />
            </p>
          );
        })}
      </article>
    </main>
  );
}
