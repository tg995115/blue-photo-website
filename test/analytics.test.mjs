import test from "node:test";
import assert from "node:assert/strict";
import { trackStoreExit } from "../src/analytics.mjs";

test("store exits navigate immediately when the optional GA4 tag is absent", () => {
  const previousWindow = globalThis.window;
  try {
    globalThis.window = {
      gtag: () => assert.fail("The default build must not send GA4 events."),
    };
    let navigations = 0;
    trackStoreExit("ios", "download_auto", () => navigations++);
    assert.equal(navigations, 1);
  } finally {
    globalThis.window = previousWindow;
  }
});

test("store exit reports the platform once before navigation", () => {
  const previousWindow = globalThis.window;
  try {
    let event;
    let navigations = 0;
    globalThis.window = {
      bluePhotoAnalyticsEnabled: true,
      setTimeout: () => 1,
      clearTimeout: () => {},
      gtag: (type, name, params) => {
        event = { type, name, params };
        params.event_callback();
      },
    };
    trackStoreExit("android", "promo", () => navigations++);
    event.params.event_callback();
    assert.equal(event.type, "event");
    assert.equal(event.name, "store_exit");
    assert.equal(event.params.platform, "android");
    assert.equal(event.params.source, "promo");
    assert.equal(navigations, 1);
  } finally {
    globalThis.window = previousWindow;
  }
});

test("manual store links send their platform before leaving the website", async () => {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  try {
    let clickHandler;
    let platform;
    let destination;
    globalThis.document = {
      addEventListener: (type, handler) => {
        assert.equal(type, "click");
        clickHandler = handler;
      },
    };
    globalThis.window = {
      bluePhotoAnalyticsEnabled: true,
      setTimeout: () => 1,
      clearTimeout: () => {},
      gtag: (_, __, params) => {
        platform = params.platform;
        params.event_callback();
      },
      location: { assign: (url) => (destination = url) },
    };
    await import("../src/analytics-browser.mjs?manual-store-test");
    let prevented = false;
    clickHandler({
      button: 0,
      target: {
        closest: () => ({
          href: "https://play.google.com/store/apps/details?id=photo.bluewings.suwon",
          dataset: { storePlatform: "android", storeSource: "promo" },
          target: "",
        }),
      },
      preventDefault: () => (prevented = true),
    });
    assert.equal(prevented, true);
    assert.equal(platform, "android");
    assert.match(destination, /^https:\/\/play\.google\.com\//);
  } finally {
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
  }
});
