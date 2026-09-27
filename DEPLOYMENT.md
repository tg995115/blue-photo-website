# Deployment

## Current configuration

- Repository: `tg995115/blue-photo-website` (public).
- Source branch: `main`.
- Built static branch: `codex/github-pages`, directory `/`.
- Default URL: `https://tg995115.github.io/blue-photo-website/`.
- Production custom domain: `app.bluewings.photo`.
- DNS management: Dotname Korea → DNS 레코드 설정 → `bluewings.photo`. The authoritative nameservers are `jasmine.ns.cloudflare.com` and `miles.ns.cloudflare.com`.
- DNS record: `CNAME app -> tg995115.github.io`, DNS only (not proxied).
- HTTPS is enforced for this Pages site. The custom-domain certificate is approved, and HTTP requests redirect to HTTPS.

Build and test locally before publishing:

```sh
nvm use
yarn install --frozen-lockfile
yarn build
yarn test
yarn build:pages
yarn test:pages
```

Publish only `dist-pages/` to `codex/github-pages`. In Settings → Pages choose **Deploy from a branch**, `codex/github-pages`, `/ (root)`. Do not publish the source branch directly. Keep `.nojekyll`, `CNAME`, the route directories, assets, legal files and `app-ads.txt`. `CNAME` must contain `app.bluewings.photo`.

GitHub's built-in Pages publication job can run when the static branch changes. No hosted application test matrix or push-triggered source build workflow is configured.

After a deployment, verify the home page, English page, three platform-specific paths, legal documents, raw downloads and `app-ads.txt` over public HTTPS. Check the Pages build status rather than treating a branch push as a successful deployment.

## Custom domain connection

The user requested `app.bluewings.photo`. Keep the existing `suwon.bluewings.photo` Tistory blog and other DNS records intact. `yarn build:pages` produces this root-path build with an explicit CNAME:

```sh
node scripts/build.mjs --site-url https://app.bluewings.photo/ --custom-domain app.bluewings.photo --out-dir dist-pages
```

Publish that `dist-pages/` output and configure the GitHub custom domain before adding the CNAME in Dotname Korea. Enter `app` as the subdomain and `tg995115.github.io` as the target, without a URL scheme or repository path. Check the authoritative DNS response after saving. Then enforce HTTPS once GitHub provisions its certificate and verify public access on port 443. The root build replaces the GitHub subpath build; do not serve `/blue-photo-website/` asset paths at a custom-domain root.

## AdMob and existing links

`https://app.bluewings.photo/app-ads.txt` is included in this deployment, but the store developer website is currently `suwon.bluewings.photo`. Deploying this site alone does not change store metadata or complete AdMob's hostname-based verification. That needs a separate domain/store configuration review.

The old shared link `https://go.sqd.link/42eb4` is not changed by publishing this repository. iPhone/iPad, Android and Windows identify the same store apps. The old link sends Mac to App Store and Linux to the blog; this site leaves those devices on its store chooser.

The app/store legal URLs are also not changed automatically. Their migration is a separate step after the chosen public URL is ready.
