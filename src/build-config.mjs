import { site } from "./site.mjs";

export function createBuildConfig({
  siteUrl = `${site.origin}/`,
  outputDir = "dist",
  customDomain = "",
  gaMeasurementId = "",
} = {}) {
  const url = new URL(siteUrl);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "The public site URL must be an HTTPS URL without credentials, query or fragment.",
    );
  }
  if (!["dist", "dist-pages"].includes(outputDir))
    throw new Error("Build output must be dist or dist-pages.");
  const basePath = url.pathname.replace(/\/+$/, "");
  if (!/^(\/[A-Za-z0-9._-]+)*$/.test(basePath))
    throw new Error("Unsupported site base path.");
  if (gaMeasurementId && !/^G-[A-Z0-9]+$/.test(gaMeasurementId))
    throw new Error("Invalid GA4 web measurement ID.");
  if (
    customDomain &&
    (customDomain !== url.hostname ||
      basePath ||
      url.hostname.endsWith(".github.io"))
  ) {
    throw new Error(
      "A custom domain must match a site URL at the domain root.",
    );
  }
  const pathFor = (path) => {
    if (!path.startsWith("/") || path.startsWith("//"))
      throw new Error("Local site paths must begin with a single slash.");
    return `${basePath}${path}`;
  };
  return {
    siteUrl: `${url.origin}${basePath}/`,
    origin: url.origin,
    basePath,
    outputDir,
    customDomain,
    gaMeasurementId,
    pathFor,
    absoluteUrl: (path) => `${url.origin}${pathFor(path)}`,
  };
}
