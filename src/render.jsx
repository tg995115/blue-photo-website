import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { copy, site, stores } from "./site.mjs";
import { promotions, validatePromotions } from "./promotions.mjs";
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

function Promotion({ lang, promotion }) {
  const t = copy[lang];
  if (!promotion)
    return (
      <main id="main" className="download-page container">
        <h1>{t.promoMissingTitle}</h1>
        <p>{t.promoMissingBody}</p>
        <a className="button primary" href={pathFor(`${prefix(lang)}/`)}>
          {t.back}
        </a>
      </main>
    );

  return (
    <main id="main" className="promo-page container">
      <p className="eyebrow">{t.promoEyebrow}</p>
      <h1>{t.promoFreeTitle}</h1>
      <p className="promo-intro">{t.promoBody}</p>
      <div className="promo-platforms">
        <section className="promo-platform" aria-labelledby="promo-ios">
          <h2 id="promo-ios">{t.promoIos}</h2>
          <p className="promo-duration">{t.promoAppleFree(promotion.appleFreeMonths)}</p>
          <p>{t.promoIosBody}</p>
          <a
            className="button primary"
            href={promotion.appleUrl}
            data-store-platform="ios"
            data-store-source="promo"
          >
            {t.promoIosAction}
          </a>
        </section>
        <section className="promo-platform" aria-labelledby="promo-android">
          <h2 id="promo-android">{t.promoAndroid}</h2>
          <p className="promo-duration">{t.promoGoogleFree(promotion.googleFreeDays)}</p>
          <p>{t.promoAndroidBody}</p>
          <div className="promo-code" data-promo-code={promotion.googleCode}>
            <code>{promotion.googleCode}</code>
            <button type="button" data-promo-copy hidden>
              {t.promoCopy}
            </button>
          </div>
          <p
            className="promo-copy-status"
            data-promo-copy-status
            data-success={t.promoCopied}
            data-failure={t.promoCopyFailed}
            aria-live="polite"
          />
          <a
            className="button primary"
            href={stores.android.url}
            data-store-platform="android"
            data-store-source="promo"
          >
            {t.promoAndroidAction}
          </a>
        </section>
      </div>
      <p className="promo-note">{t.promoRenewal}</p>
    </main>
  );
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
  promotion = null,
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
  } else if (kind === "promo") {
    title = `${promotion ? t.promoFreeTitle : t.promoMissingTitle} — Blue Photo`;
    description = promotion ? t.promoBody : t.promoMissingBody;
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
        {(kind === "404" || (kind === "promo" && !promotion)) && (
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
        <meta property="og:image" content={absoluteUrl(site.socialImage)} />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="1024" />
        <meta property="og:image:alt" content="Blue Photo" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={absoluteUrl(site.socialImage)} />
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
                __html: `window.bluePhotoAnalyticsEnabled=true;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config','${buildConfig.gaMeasurementId}');`,
              }}
            />
            <script type="module" src={asset("analytics.js")} />
          </>
        )}
        {kind === "landing" && <script type="module" src={asset("hero.js")} />}
        {kind === "download" && (
          <script type="module" src={asset("download.js")} />
        )}
        {kind === "promo" && promotion && (
          <script type="module" src={asset("promo.js")} />
        )}
      </head>
      <body>
        <a className="skip-link" href="#main">
          {t.skip}
        </a>
        <Header lang={lang} route={route} />
        {legal ? (
          <LegalDocument document={legal} lang={lang} pathFor={pathFor} />
        ) : kind === "landing" ? (
          <Landing lang={lang} />
        ) : kind === "download" ? (
          <Download lang={lang} platform={platform} />
        ) : kind === "promo" ? (
          <Promotion lang={lang} promotion={promotion} />
        ) : (
          <NotFound lang={lang} />
        )}
        <Footer lang={lang} />
      </body>
    </html>
  );
}

export const routes = [];
validatePromotions(promotions);
for (const lang of ["ko", "en"]) {
  const base = prefix(lang);
  routes.push({ route: `${base}/`, lang });
  routes.push({ route: `${base}/index/`, lang, canonical: `${base}/` });
  routes.push({ route: `${base}/download/`, lang, kind: "download" });
  routes.push({ route: `${base}/promo/`, lang, kind: "promo" });
  for (const promotion of promotions)
    routes.push({
      route: `${base}/promo/${promotion.slug}/`,
      lang,
      kind: "promo",
      promotion,
    });
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
