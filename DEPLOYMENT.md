# Deployment

## Current configuration

- Repository: `dusskapark/blue-photo-website` (public).
- Source branch: `main`.
- Built static branch: `codex/github-pages`, directory `/`.
- Default URL: `https://dusskapark.github.io/blue-photo-website/`.
- Custom domain: none. The user will request domain connection separately.

Build and test locally before publishing:

```sh
nvm use
yarn install --frozen-lockfile
yarn build
yarn test
yarn build:pages
yarn test:pages
```

Publish only `dist-pages/` to `codex/github-pages`. In Settings → Pages choose **Deploy from a branch**, `codex/github-pages`, `/ (root)`. Do not publish the source branch directly. Keep `.nojekyll`, the route directories, assets, legal files and `app-ads.txt`. There is no CNAME in the initial build.

GitHub's built-in Pages publication job can run when the static branch changes. No hosted application test matrix or push-triggered source build workflow is configured.

After a deployment, verify the home page, English page, three platform-specific paths, legal documents, raw downloads and `app-ads.txt` over public HTTPS. Check the Pages build status rather than treating a branch push as a successful deployment.

## Later domain connection

The proposed future domain is `bluewings.photo`. Keep the existing `suwon.bluewings.photo` Tistory blog intact. When the user requests domain connection, produce a root-path build with an explicit CNAME:

```sh
node scripts/build.mjs --site-url https://bluewings.photo/ --custom-domain bluewings.photo
```

Publish that `dist/` output, configure the GitHub custom domain, and only then complete DNS and HTTPS. The root build replaces the GitHub subpath build; do not serve `/blue-photo-website/` asset paths at a custom-domain root.

## AdMob and existing links

`/blue-photo-website/app-ads.txt` is directly accessible on the default Pages URL, but the store developer website is currently `suwon.bluewings.photo`. Serving the file on GitHub's project path alone does not complete AdMob's hostname-based verification. That needs the later reviewed domain/store configuration.

The old shared link `https://go.sqd.link/42eb4` is not changed by publishing this repository. iPhone/iPad, Android and Windows identify the same store apps. The old link sends Mac to App Store and Linux to the blog; this site leaves those devices on its store chooser.

The app/store legal URLs are also not changed automatically. Their migration is a separate step after the chosen public URL is ready.
