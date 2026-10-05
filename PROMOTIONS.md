# Subscription promotion flow

Status: website route infrastructure is present; no store codes or live campaign have been configured.

## Shared YouTube link

Use `https://app.bluewings.photo/promo/{campaign-slug}/`. Add one reviewed entry per campaign to `src/promotions.mjs` and rebuild the static site. GitHub Pages does not dynamically resolve arbitrary `/promo/*` paths. The slug identifies the campaign; it is not a store code or redirect destination.

The landing page presents both platforms so a visitor can choose even when device detection is unreliable. It does not auto-redirect or claim to redeem the offer itself. Campaign pages must be published only after confirming the free duration, eligibility, expiration and renewal terms in both stores.

## iOS

The website button opens the App Store Connect offer-code redemption URL. Apple's flow can prompt installation if the app is missing. No app-specific deep link or in-app code-entry screen is required for this entry path. The app must still recognize the redeemed subscription when it opens and grant Premium after store verification. Check startup, foreground, and restore/sync paths for a redemption completed while the app was closed.

## Android

Google Play custom subscription codes are redeemable only from inside the app and only by customers who have not previously subscribed. The website displays a copyable code and a link to the app's Play listing. The user opens Blue Photo's subscription checkout, selects the payment method in the Google Play purchase UI, and chooses **Redeem code**. The website and Play listing cannot directly apply a shared custom code.

An Android App Link into Blue Photo's Premium checkout is optional. It reduces navigation for users who already have the app, but it does not replace the Play purchase UI. If added later, use a separate app-opening path or button so the shared `/promo/{campaign-slug}/` link still shows the code and instructions. Without an App Link, the page must explain how to reach the subscription checkout manually. An App Link alone does not preserve the campaign through a fresh Play Store installation; that would need a separately designed deferred-link flow. Keep the visible code and manual fallback either way.

The existing app needs to launch the normal Play Billing subscription purchase flow and grant Premium from the resulting verified purchase. A separate in-app promo code field is unnecessary if the Google Play purchase UI exposes **Redeem code** in the app's checkout. Before launch, test the exact published subscription/base plan, code eligibility, purchase callback, app relaunch, and backend entitlement sync. This repository does not contain the app code, so these app checks remain open.

## Store references

- [Apple subscription offer codes](https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-subscription-offer-codes)
- [Google Play promo codes and redemption flow](https://developer.android.com/google/play/billing/promo)
- [Google Play Console promotion setup](https://support.google.com/googleplay/android-developer/answer/6321495?hl=en)
- [Google Play Billing integration and purchases outside the app](https://developer.android.com/google/play/billing/integrate)
