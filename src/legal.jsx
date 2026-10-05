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
      {markdown && <WebsiteAnalyticsNotice lang={lang} />}
    </main>
  );
}

function WebsiteAnalyticsNotice({ lang }) {
  return (
    <section className="legal-content website-analytics-notice">
      {lang === "ko" ? (
        <>
          <h2>공식 웹사이트 분석 안내</h2>
          <p>공식 웹사이트(app.bluewings.photo)는 Google Analytics 4로 방문 페이지와 앱스토어 이동을 집계합니다. Google은 이 과정에서 IP 주소, 브라우저·기기 정보, 쿠키 또는 유사 식별자, 방문·이동 페이지 주소와 이용 시각 등을 처리할 수 있습니다.</p>
          <p>Blue Photo가 별도로 보내는 스토어 이동 이벤트에는 iOS·Android·Windows 플랫폼과 이동 경로 구분값이 포함됩니다. 웹사이트 이용 현황과 앱 다운로드 경로를 파악하고 사이트를 개선하는 데 사용합니다. 브라우저에서 쿠키를 제한하거나 Google의 <a href="https://tools.google.com/dlpage/gaoptout">Analytics 차단 도구</a>를 사용할 수 있습니다. Google의 처리에 관한 자세한 내용은 <a href="https://policies.google.com/privacy">Google 개인정보처리방침</a>을 참고하세요.</p>
        </>
      ) : (
        <>
          <h2>Official website analytics notice</h2>
          <p>The official website (app.bluewings.photo) uses Google Analytics 4 to measure page visits and departures to app stores. Google may process IP address, browser and device information, cookies or similar identifiers, visited and destination page URLs, and usage time.</p>
          <p>The store-exit event sent separately by Blue Photo contains the iOS, Android, or Windows platform and the type of exit. We use these measurements to understand website use and app download paths and to improve the site. You can restrict cookies in your browser or use the <a href="https://tools.google.com/dlpage/gaoptout">Google Analytics opt-out tool</a>. See the <a href="https://policies.google.com/privacy">Google Privacy Policy</a> for details of Google's processing.</p>
        </>
      )}
    </section>
  );
}
