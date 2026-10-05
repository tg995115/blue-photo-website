import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validatePromotions } from "../src/promotions.mjs";

test("promo landing has a safe fallback before store codes are issued", async () => {
  for (const lang of ["", "en/"]) {
    const html = await readFile(
      new URL(`../dist/${lang}promo/index.html`, import.meta.url),
      "utf8",
    );
    assert.match(html, /<h1[^>]*>/);
    assert.match(html, /name="robots" content="noindex"/);
    assert.doesNotMatch(html, /data-promo-code=/);
    assert.doesNotMatch(html, /assets\/download\.js/);
  }
});

test("campaign configuration only accepts reviewed store links and stable slugs", () => {
  const campaign = {
    slug: "creator-2026",
    appleFreeMonths: 2,
    googleFreeDays: 60,
    appleUrl: "https://apps.apple.com/redeem?ctx=offercodes&id=6801591787&code=EXAMPLE",
    googleCode: "EXAMPLE",
  };
  assert.equal(validatePromotions([campaign]).length, 1);
  assert.throws(() => validatePromotions([campaign, campaign]), /unique/);
  assert.throws(
    () => validatePromotions([{ ...campaign, googleFreeDays: 91 }]),
    /Google trial duration/,
  );
  assert.throws(
    () => validatePromotions([{ ...campaign, appleUrl: "https://example.com/redeem" }]),
    /Apple redemption URL/,
  );
  assert.throws(
    () => validatePromotions([{ ...campaign, slug: "../download" }]),
    /unique, lowercase URL segments/,
  );
});
