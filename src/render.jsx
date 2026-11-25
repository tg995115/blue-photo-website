import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { copy, site, stores } from "./site.mjs";
import { LegalDocument, readLegal } from "./legal.jsx";
import { createBuildConfig } from "./build-config.mjs";

const buildConfig = createBuildConfig({
  siteUrl: process.env.BLUE_PHOTO_SITE_URL,
  outputDir: process.env.BLUE_PHOTO_OUTPUT_DIR,
  customDomain: process.env.BLUE_PHOTO_CUSTOM_DOMAIN,
  gaMeasurementId: process.env.BLUE_PHOTO_GA_MEASUREMENT_ID,
});
const { pathFor, absoluteUrl, outputDir } = buildConfig;

const prefix = (lang) => (lang === "en" ? "/en" : "");
const asset = (file) => pathFor(`/assets/${file}`);

function Brand({ lang }) {
  return (
    <a
      className="brand"
      href={pathFor(`${prefix(lang)}/`)}
      aria-label="Blue Photo"
    >
      <img src={asset("app-icon.jpg")} alt="" width="40" height="40" />
      <span>Blue Photo</span>
    </a>
  );
}

function StoreLinks({ lang, selected = null, direct = false }) {
  const t = copy[lang];
  return (
    <div className="store-links badge-links">
      {Object.entries(stores).map(([key, store]) => (
        <a
          key={key}
          className={`badge-link badge-${key}${key === selected ? " recommended" : ""}`}
          href={
            direct ? store.url : pathFor(`${prefix(lang)}/download/${key}/`)
          }
          data-store-platform={direct ? key : undefined}
          data-store-source={direct ? "download_manual" : undefined}
          aria-label={`${store.platform} — ${store.label}: ${t.open}`}
        >
          <img
            src={asset(
              `badges/${key === "ios" ? "app-store" : key === "android" ? "google-play" : "microsoft-store"}-${lang}.${key === "android" ? "png" : "svg"}`,
            )}
            alt={`${store.label} — ${t.open}`}
            className={`store-badge badge-art-${key}`}
          />
        </a>
      ))}
    </div>
  );
}

function Header({ lang, route }) {
  const t = copy[lang];
  const otherLang = lang === "ko" ? "en" : "ko";
  const localeRoute =
    route === "/404.html" ? "/" : route.replace(/^\/en(?=\/|$)/, "");
  const otherRoute = `${prefix(otherLang)}${localeRoute === "/index/" ? "/" : localeRoute}`;
  return (
    <header className="site-header container">
      <Brand lang={lang} />
      <nav aria-label={lang === "ko" ? "주요 메뉴" : "Main navigation"}>
        <a className="archive-link" href={site.archive}>
          {t.archive}
        </a>
        <a
          className="language-link"
          href={pathFor(otherRoute)}
          lang={otherLang}
          hrefLang={otherLang}
        >
          {otherLang === "en" ? "EN" : "한국어"}
        </a>
      </nav>
    </header>
  );
}

function Footer({ lang }) {
  const t = copy[lang];
  return (
    <footer className="site-footer container">
      <div>
        <span className="footer-name">Blue Photo</span>
        <span className="photo-credit">{t.credit}</span>
      </div>
      <nav aria-label={lang === "ko" ? "서비스 정보" : "Service information"}>
        <a href={pathFor(`${prefix(lang)}${site.privacy}`)}>{t.privacy}</a>
        <a href={pathFor(`${prefix(lang)}${site.terms}`)}>{t.terms}</a>
      </nav>
      <small>© 2026 BLUE PHOTO JK HONG</small>
    </footer>
  );
}

function Landing({ lang }) {
  const t = copy[lang];
  return (
    <>
      {/* Adapted app-showcase composition from Start Bootstrap New Age (MIT). */}
      <main id="main">
        <section className="hero-section" aria-labelledby="hero-title">
          <div
            className="hero-gradient"
            data-gradient-root
            aria-hidden="true"
          />
          <div className="hero container">
            <div className="hero-copy">
              <p className="eyebrow">{t.eyebrow}</p>
              <h1 id="hero-title">
                {t.headline[0]}
                <br />
                <span>{t.headline[1]}</span>
              </h1>
              <p className="intro">{t.intro}</p>
              <StoreLinks lang={lang} />
              <p className="availability">{t.availability}</p>
            </div>
            <div
              className="hero-visual"
              aria-label={t.galleryLabel}
              data-hero-stage
            >
              <div className="device-position screen-back" data-hero-device>
                <div className="device-frame" data-device-surface>
                  <span className="device-volume" aria-hidden="true" />
                  <span className="device-power" aria-hidden="true" />
                  <div className="device-screen">
                    <img
                      className="hero-screen"
                      src={asset("collections.jpg")}
                      alt={t.screenLabels[1]}
                      width="600"
                      height="1300"
                    />
                  </div>
                </div>
              </div>
              <div className="device-position screen-front" data-hero-device>
                <div className="device-frame" data-device-surface>
                  <span className="device-volume" aria-hidden="true" />
                  <span className="device-power" aria-hidden="true" />
                  <div className="device-screen">
                    <img
                      className="hero-screen"
                      src={asset("library.jpg")}
                      alt={t.screenLabels[0]}
                      width="600"
                      height="1300"
                      fetchPriority="high"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="about-section"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">{t.galleryLabel}</p>
              <h2 id="about-title">{t.galleryTitle}</h2>
              <p>{t.galleryBody}</p>
            </div>
            <div className="feature-list">
              {t.featureTitles.map((title, index) => (
                <article key={title}>
                  <span className="feature-number" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <h3>{title}</h3>
                  <p>{t.featureBodies[index]}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          className="download-section container"
          aria-labelledby="download-title"
        >
          <img
            src={asset("app-icon.jpg")}
            alt=""
            width="72"
            height="72"
            loading="lazy"
          />
          <h2 id="download-title">{t.getTitle}</h2>
          <p>{t.getBody}</p>
          <StoreLinks lang={lang} />
        </section>
      </main>
    </>
  );
}

function Download({ lang, platform }) {
  const t = copy[lang];
  return (
    <main
      id="main"
      className="download-page container"
      data-download-platform={platform || "auto"}
      data-download-path={pathFor(`${prefix(lang)}/download/`)}
    >
      <img
        className="download-icon"
        src={asset("app-icon.jpg")}
        alt=""
        width="88"
        height="88"
      />
      <p className="eyebrow">
        {platform ? stores[platform].platform : "iOS · Android · Windows"}
      </p>
      <h1>{t.downloadTitle}</h1>
      <p data-download-status aria-live="polite">
        {t.downloadBody}
      </p>
      <StoreLinks lang={lang} selected={platform} direct />
      <p className="download-help">{t.manual}</p>
      <a className="text-link" href={pathFor(`${prefix(lang)}/`)}>
        {t.back}
        <span aria-hidden="true"> ↗</span>
      </a>
    </main>
  );
}

function OpenInApp({ lang, promotion = false }) {
  const t = copy[lang];
  // Both languages are in the markup; the script picks one from the visitor's browser language.
  return (
    <main id="main" className="download-page container" data-open-page
      data-promotion={promotion || undefined}
      data-download-path={promotion ? pathFor(`${prefix(lang)}/download/`) : undefined}
      data-opening={promotion ? t.promoOpeningBody : undefined}
      data-opening-ko={promotion ? copy.ko.promoOpeningBody : undefined}
      data-opening-en={promotion ? copy.en.promoOpeningBody : undefined}
      data-invalid-code={promotion ? t.promoInvalidCode : undefined}
      data-invalid-code-ko={promotion ? copy.ko.promoInvalidCode : undefined}
      data-invalid-code-en={promotion ? copy.en.promoInvalidCode : undefined}
      data-phone-required={promotion ? t.promoPhoneRequired : undefined}
      data-phone-required-ko={promotion ? copy.ko.promoPhoneRequired : undefined}
      data-phone-required-en={promotion ? copy.en.promoPhoneRequired : undefined}>
      <img
        className="download-icon"
        src={asset("app-icon.jpg")}
        alt=""
        width="88"
        height="88"
      />
      <h1 data-ko={promotion ? copy.ko.promoOpeningTitle : "Blue Photo 앱으로 이동"}
        data-en={promotion ? copy.en.promoOpeningTitle : "Opening Blue Photo"}>
        {promotion ? t.promoOpeningTitle : t.openTitle}
      </h1>
      <p
        id={promotion ? "promotion-status" : undefined}
        data-promotion-status={promotion || undefined}
        role={promotion ? "status" : undefined}
        aria-live={promotion ? "polite" : undefined}
        data-ko={promotion ? copy.ko.promoOpeningBody : "앱으로 이동하고 있습니다. 이동하지 않으면 아래 버튼을 눌러 주세요."}
        data-en={promotion ? copy.en.promoOpeningBody : "If the app does not open, use the buttons below."}
      >
        {promotion ? t.promoOpeningBody : t.openBody}
      </p>
      {promotion ? (
        <form className="promotion-controls" data-promotion-form noValidate>
          <label htmlFor="promotion-code" data-ko={copy.ko.promoCodeLabel} data-en={copy.en.promoCodeLabel}>{t.promoCodeLabel}</label>
          <input id="promotion-code" data-promotion-code type="text" maxLength={64}
            autoComplete="off" autoCapitalize="characters" spellCheck="false"
            aria-describedby="promotion-status" />
          <button className="button primary" type="submit" data-ko={copy.ko.openButton} data-en={copy.en.openButton}>{t.openButton}</button>
          <p className="download-help" data-ko={copy.ko.promoManualHelp} data-en={copy.en.promoManualHelp}>{t.promoManualHelp}</p>
        </form>
      ) : <>
      <a
        className="button primary"
        data-open-app
        href={pathFor("/download/")}
        data-ko="앱에서 열기"
        data-en="Open in app"
      >
        {t.openButton}
      </a>
      <a
        className="button"
        data-store
        href={pathFor("/download/")}
        data-ko="앱 받기 · 업데이트"
        data-en="Get or update app"
      >
        {t.openGet}
      </a>
      {/* An older app opens but ignores a link type it does not know; this tells the visitor what to do. */}
      <p
        className="download-help"
        data-ko={copy.ko.openUpdate}
        data-en={copy.en.openUpdate}
      >
        {t.openUpdate}
      </p>
      </>}
    </main>
  );
}

function Promotion({ lang }) {
  return <OpenInApp lang={lang} promotion />;
}

function NotFound({ lang }) {
  const t = copy[lang];
  return (
    <main id="main" className="download-page container">
      <p className="eyebrow">404</p>
      <h1>{t.notFound}</h1>
      <p>{t.notFoundBody}</p>
      <a className="button primary" href={pathFor(`${prefix(lang)}/`)}>
        {t.back}
      </a>
    </main>
  );
}

function Document({
  lang,
  route,
  kind = "landing",
  platform = null,
  canonical = route,
  legal = null,
}) {
  const t = copy[lang];
  let title = t.title;
  let description = t.description;
  if (legal) {
    title = legal.title;
    description = legal.title;
  } else if (kind === "download") {
    title = `${t.downloadTitle}${platform ? ` — ${stores[platform].platform}` : ""}`;
    description = t.getBody;
  } else if (kind === "open") {
    // A shared link's preview stays small: the photos travel in the message itself.
    title = t.openTitle;
    description = t.openPreview;
  } else if (kind === "promo") {
    title = t.promoOpeningTitle;
    description = t.promoOpeningBody;
  } else if (kind === "404") {
    title = `${t.notFound} — Blue Photo`;
  }
  const url = absoluteUrl(canonical);
  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="theme-color" content="#124cdb" />
        <link rel="canonical" href={url} />
        {(kind === "promo" || kind === "download") && <meta name="referrer" content="no-referrer" />}
        {(kind === "404" || kind === "open" || kind === "promo") && (
          <meta name="robots" content="noindex" />
        )}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={site.name} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta
          property="og:locale"
          content={lang === "ko" ? "ko_KR" : "en_US"}
        />
        {kind !== "open" && (
          <>
            <meta property="og:image" content={absoluteUrl(site.socialImage)} />
            <meta property="og:image:width" content="1024" />
            <meta property="og:image:height" content="1024" />
            <meta property="og:image:alt" content="Blue Photo" />
          </>
        )}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {kind !== "open" && (
          <meta name="twitter:image" content={absoluteUrl(site.socialImage)} />
        )}
        <link rel="icon" type="image/jpeg" href={asset("app-icon.jpg")} />
        <link rel="apple-touch-icon" href={asset("app-icon.jpg")} />
        <link rel="stylesheet" href={asset("site.css")} />
        {buildConfig.gaMeasurementId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${buildConfig.gaMeasurementId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.bluePhotoAnalyticsEnabled=true;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config','${buildConfig.gaMeasurementId}'${(kind === "promo" || kind === "download") ? `,{page_location:'${url}',page_referrer:''}` : ""});`,
              }}
            />
            <script type="module" src={asset("analytics.js")} />
          </>
        )}
        {kind === "landing" && <script type="module" src={asset("hero.js")} />}
        {kind === "download" && (
          <script type="module" src={asset("download.js")} />
        )}
        {kind === "promo" && (
          <script type="module" src={asset("promo.js")} />
        )}
        {kind === "open" && <script type="module" src={asset("open.js")} />}
      </head>
      <body>
        {kind !== "open" && kind !== "promo" && (
          <>
            <a className="skip-link" href="#main">
              {t.skip}
            </a>
            <Header lang={lang} route={route} />
          </>
        )}
        {legal ? (
          <LegalDocument document={legal} lang={lang} pathFor={pathFor} />
        ) : kind === "landing" ? (
          <Landing lang={lang} />
        ) : kind === "download" ? (
          <Download lang={lang} platform={platform} />
        ) : kind === "promo" ? (
          <Promotion lang={lang} />
        ) : kind === "open" ? (
          <OpenInApp lang={lang} />
        ) : (
          <NotFound lang={lang} />
        )}
        {kind !== "open" && kind !== "promo" && <Footer lang={lang} />}
      </body>
    </html>
  );
}

export const routes = [];
for (const lang of ["ko", "en"]) {
  const base = prefix(lang);
  routes.push({ route: `${base}/`, lang });
  routes.push({ route: `${base}/index/`, lang, canonical: `${base}/` });
  routes.push({ route: `${base}/download/`, lang, kind: "download" });
  // The shared link carries no language; the script chooses the text from the visitor's browser.
  routes.push({ route: `${base}/open/`, lang, kind: "open" });
  routes.push({ route: `${base}/promo/`, lang, kind: "promo" });
  for (const kind of ["privacy", "terms"]) {
    routes.push({
      route: `${base}/${kind}/`,
      lang,
      kind,
      legal: await readLegal(kind, lang),
    });
  }
  for (const platform of Object.keys(stores))
    routes.push({
      route: `${base}/download/${platform}/`,
      lang,
      kind: "download",
      platform,
    });
}
routes.push({ route: "/404.html", lang: "ko", kind: "404" });

for (const page of routes) {
  const path = join(
    outputDir,
    page.route.endsWith(".html")
      ? page.route.slice(1)
      : `${page.route.slice(1)}index.html`,
  );
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(
    path,
    `<!doctype html>\n${renderToStaticMarkup(<Document {...page} />)}\n`,
  );
}
await writeFile(
  join(outputDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["/", "/en/", "/privacy/", "/terms/", "/en/privacy/", "/en/terms/"].map((path) => `<url><loc>${absoluteUrl(path)}</loc></url>`).join("")}</urlset>\n`,
);
await writeFile(
  join(outputDir, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${absoluteUrl("/sitemap.xml")}\n`,
);
if (buildConfig.customDomain)
  await writeFile(join(outputDir, "CNAME"), `${buildConfig.customDomain}\n`);
console.log(
  `Rendered ${routes.length} static React pages for ${buildConfig.siteUrl}`,
);
