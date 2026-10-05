// Add a campaign only after both stores have issued the production offer.
// The slug is public and stable; store codes and URLs stay in this reviewed map.
export const promotions = [];

export function validatePromotions(items) {
  const slugs = new Set();
  for (const item of items) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) || slugs.has(item.slug))
      throw new Error("Promotion slugs must be unique, lowercase URL segments.");
    if (!Number.isInteger(item.appleFreeMonths) || item.appleFreeMonths < 1)
      throw new Error(`Invalid Apple offer duration for ${item.slug}.`);
    if (
      !Number.isInteger(item.googleFreeDays) ||
      item.googleFreeDays < 3 ||
      item.googleFreeDays > 90
    )
      throw new Error(`Invalid Google trial duration for ${item.slug}.`);
    const appleUrl = item.appleUrl && new URL(item.appleUrl);
    if (
      !appleUrl ||
      appleUrl.protocol !== "https:" ||
      appleUrl.hostname !== "apps.apple.com" ||
      appleUrl.pathname !== "/redeem"
    )
      throw new Error(`Expected an Apple redemption URL for ${item.slug}.`);
    if (!/^[A-Za-z0-9]+$/.test(item.googleCode || ""))
      throw new Error(`Expected a Google Play custom code for ${item.slug}.`);
    slugs.add(item.slug);
  }
  return items;
}
