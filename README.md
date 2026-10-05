# Blue Photo website

The public website for Blue Photo: a photo archive for Suwon Samsung supporters.

**Production address:** https://app.bluewings.photo/

Hosted publicly on GitHub Pages from `tg995115/blue-photo-website`. The production build uses the custom domain at the site root. DNS and HTTPS setup are described in [DEPLOYMENT.md](DEPLOYMENT.md).

This repository contains only the website. It does not contain the iOS, Android or Windows applications, the catalog backend, or their Git history.

## What it serves

- Korean and English app introduction pages with the official store badges.
- One device-aware download link and fixed iOS, Android and Windows links.
- Separate Korean/English privacy policy and terms, with Markdown/text downloads.
- A plain-text `app-ads.txt` file.

The site is authored in React and rendered to static HTML at build time. Only the decorative Paper Shaders background is loaded as a client React component. It pauses offscreen and respects reduced-motion preferences. There is no backend, database or authentication service. The official Pages build includes GA4 website analytics.

## Local development

Use Node 22 and Yarn 1:

```sh
nvm use
yarn install --frozen-lockfile
yarn dev
```

The root-path preview is `http://127.0.0.1:4173/`. Saving source rebuilds the HTML; refresh the browser to see changes.

```sh
yarn build
yarn test
yarn build:pages
yarn test:pages
yarn preview:pages
```

The Pages preview is `http://127.0.0.1:4174/`. `dist-pages/` contains root-relative links and assets, sharing metadata for `https://app.bluewings.photo/`, and an explicit `CNAME`. Only the contents of that directory are deployed. See [DEPLOYMENT.md](DEPLOYMENT.md).

## Routes

Paths below are relative to `https://app.bluewings.photo/`.

| Route | Purpose |
| --- | --- |
| `/`, `/index`, `/index.html` | Korean introduction |
| `/en/` | English introduction |
| `/download/` | Device-aware store redirect |
| `/download/ios/` | App Store |
| `/download/android/` | Google Play |
| `/download/windows/` | Microsoft Store |
| `/en/download/…` | English download pages |
| `/promo/`, `/en/promo/` | Fallback while no campaign is selected |
| `/promo/{campaign}/`, `/en/promo/{campaign}/` | Generated subscription offer page for a configured campaign |
| `/privacy/`, `/en/privacy/` | Privacy policy |
| `/terms/`, `/en/terms/` | Terms of service |
| `/legal/…` | Markdown or plain-text legal files |
| `/app-ads.txt` | AdMob publisher record |

The download pages use browser-side `location.replace`, not HTTP 302. JavaScript-disabled browsers retain the store badges. Mac, Linux, unknown devices and known preview crawlers remain on a chooser. Desktop-user-agent iPads are recognized using touch support. Fixed platform links always target their named store. Incoming query parameters cannot supply a destination. Use `?preview=1` to inspect a download page without navigating.

## Subscription promotions

Campaign links use a public slug such as `/promo/creator-2026/`, not a store code in the URL path or query. Add a campaign to `src/promotions.mjs` only after the Apple offer redemption URL and Google Play custom code have been issued and reviewed. Each entry needs `slug`, `appleFreeMonths`, `googleFreeDays`, `appleUrl`, and `googleCode`. Apple and Google durations appear separately because the Google trial is configured in days. The build generates separate Korean and English pages for each entry. No campaign is currently configured; `/promo/` shows a fallback message.

The iOS button opens the official Apple redemption URL. Android visitors can copy the Google Play custom code and open or install the app from its Play listing. They then open the subscription checkout in the app and enter the code in Google Play's payment UI. The site does not apply or verify a subscription. See [PROMOTIONS.md](PROMOTIONS.md) for the app-side flow and remaining checks.

## Website analytics

The single GA4 web stream for the official website uses measurement ID `G-8LWN209BF9`. `yarn build:pages` includes the tag for the production domain; the generic `yarn build` remains untagged for local previews. The Korean and English Privacy Policy documents are version 1.2 and disclose website and native app analytics in their collection, use, and sharing sections, as well as browser choices for website analytics.

GA4 records page views and a `store_exit` event when a visitor leaves for a reviewed App Store, Google Play, or Microsoft Store destination. The event has `platform` (`ios`, `android`, or `windows`) and `source` (`download_auto`, `download_manual`, or `promo`). Register `platform` as an event-scoped custom dimension in GA4 to break down reports by store. The custom event does not include a promo code or destination URL. Automatic outbound-click measurement configured in the GA4 stream is separate from this custom event and should be reviewed before publishing campaign links.

The redirect waits at most 700 ms for the analytics callback, then opens the store even if the tag is blocked. This tag is a website stream; the iOS and Android apps do not need separate website measurement IDs.

## Editing content

- `src/site.mjs`: Korean/English copy and reviewed store destinations.
- `src/render.jsx`, `src/site.css`: structure and appearance.
- `src/gradient.jsx`: the bounded, optional animated background.
- `public/legal/`: versioned legal documents; record each revision in `legal-revisions.json` and `LEGAL_CHANGELOG.md`.
- `public/app-ads.txt`: the shared Android/iOS AdMob account record.
- `src/build-config.mjs`: site origin, path prefix and explicit custom-domain handling.

The footer links to locally served documents. `legal-sources.json` preserves the original version 1.0 public URLs and integrity hashes. `legal-revisions.json` records the current version 1.2 Privacy Policy hashes, effective date, previous version and original source commit; the Terms remain at version 1.0. The original Korean terms include `gks` in section 2; it is preserved rather than silently corrected. The generic local build's legal pages require no client JavaScript.

`asset-sources.json` records the app icon, public App Store screenshots and official store badges. The current sharing thumbnail is the existing 1024×1024 Blue Photo icon, configured in `site.socialImage`. Update its metadata dimensions if replacing it with a differently sized image.

## Design sources and licenses

The app-showcase composition is adapted from [Start Bootstrap New Age](https://github.com/StartBootstrap/startbootstrap-new-age). Its MIT license is included in `THIRD-PARTY-LICENSE.txt`. [Paper Shaders MeshGradient](https://shaders.paper.design/mesh-gradient) provides the background; its Apache 2.0 license and notice are included in the build.

The Blue Photo brand, photographs and store badge artwork retain their respective owners' rights.
