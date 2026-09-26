# Blue Photo website

This is the standalone public website repository. Keep mobile/Windows app source, backend code, credentials and private catalogs out of this repository.

Blue Photo is a photo archive. Premium removes ads only. Do not add games, rewards, paid photo access, or unshipped product claims. Keep Korean and English content aligned.

Use Node 22 and Yarn 1. Run the relevant local build and tests. For a Pages publication run `yarn build`, `yarn test`, `yarn build:pages`, and `yarn test:pages`. Publish only the reviewed static output to `codex/github-pages`. Do not add automatic hosted test matrices or source build workflows; GitHub's built-in static Pages deployment is sufficient.

Keep source on `main`. Do not configure a custom domain or change the Tistory blog DNS unless the user requests it. Keep existing external app/store links unchanged unless their migration is specifically requested.

Legal documents are source-backed snapshots. Preserve wording, effective dates and language separation unless an explicit revision is requested. Keep the provenance hashes aligned with any reviewed change. Store badges must use the supplied artwork without distortion.

Prefer a small static implementation. The animated background is optional and must keep reduced-motion and static fallback behavior. Redirects may only target the fixed reviewed stores and must retain a manual fallback.
