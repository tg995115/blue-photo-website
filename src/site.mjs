export const site = {
  origin: "https://bluewings.photo",
  name: "Blue Photo",
  archive: "https://suwon.bluewings.photo/",
  privacy: "/privacy/",
  terms: "/terms/",
  legacyDownload: "https://go.sqd.link/42eb4",
  socialImage: "/assets/app-icon.png",
};

// Fixed destinations only. Never accept a redirect destination from a URL parameter.
export const stores = {
  ios: {
    label: "App Store",
    platform: "iPhone · iPad",
    url: "https://apps.apple.com/app/id6801591787",
  },
  android: {
    label: "Google Play",
    platform: "Android",
    url: "https://play.google.com/store/apps/details?id=photo.bluewings.suwon",
  },
  windows: {
    label: "Microsoft Store",
    platform: "Windows",
    url: "https://apps.microsoft.com/detail/9PL0MP9K81CC",
  },
};

export function detectPlatform({
  userAgent = "",
  platform = "",
  maxTouchPoints = 0,
} = {}) {
  if (
    /bot|crawler|spider|preview|facebookexternalhit|slack|discord|whatsapp|telegram/i.test(
      userAgent,
    )
  )
    return null;
  if (/android/i.test(userAgent)) return "android";
  if (
    /iphone|ipad|ipod/i.test(userAgent) ||
    (/MacIntel/i.test(platform) && maxTouchPoints > 1)
  )
    return "ios";
  if (/windows nt/i.test(userAgent)) return "windows";
  return null;
}

export const copy = {
  ko: {
    title: "Blue Photo — 수원의 순간을, 사진으로",
    description:
      "수원삼성의 경기와 그 주변의 순간들. Blue Photo에서 사진을 둘러보고, 좋아하는 장면을 다시 만나보세요. iOS, Android, Windows에서 사용할 수 있습니다.",
    nav: "앱 소개",
    archive: "블로그",
    download: "앱 다운로드",
    eyebrow: "수원삼성 사진 아카이브",
    headline: ["그날의 수원을,", "다시 꺼내보다."],
    intro:
      "경기장의 함성부터 오래 기억하고 싶은 표정까지. 여러 해에 걸쳐 쌓인 사진을 Blue Photo에서 만나보세요.",
    availability: "iPhone, iPad, Android, Windows",
    galleryLabel: "앱에서 만나는 사진들",
    galleryTitle: "사진 한 장에서 시작하는 기억.",
    galleryBody:
      "시간을 따라 둘러보고, 선수와 경기를 찾아보고, 마음에 남는 장면은 즐겨찾기에 모아두세요.",
    screenLabels: [
      "날짜를 따라 둘러보기",
      "컬렉션으로 다시 만나기",
      "원하는 장면 찾아보기",
    ],
    featureTitles: ["시간을 따라", "기억을 찾아", "SNS로 나누기"],
    featureBodies: [
      "라이브러리에서 공개된 사진을 날짜순으로 둘러보세요.",
      "선수, 경기, 연도별 컬렉션과 검색으로 원하는 장면을 찾으세요.",
      "마음에 드는 사진을 SNS로 공유하고, 함께했던 순간을 나눠보세요.",
    ],
    getTitle: "다음 기억은, Blue Photo에서.",
    getBody: "사용하는 기기에 맞는 스토어에서 다운로드하세요.",
    open: "스토어에서 다운로드",
    privacy: "개인정보 처리방침",
    terms: "이용약관",
    credit: "사진 · 홍준기",
    skip: "본문으로 건너뛰기",
    downloadTitle: "Blue Photo 다운로드",
    downloadBody: "사용하는 기기에 맞는 스토어를 선택하세요.",
    redirect:
      "스토어로 이동하고 있습니다. 이동하지 않으면 아래 버튼을 눌러주세요.",
    manual: "다른 기기용 앱도 아래에서 선택할 수 있습니다.",
    back: "Blue Photo 알아보기",
    notFound: "페이지를 찾을 수 없습니다.",
    notFoundBody: "주소를 확인하거나 Blue Photo 소개 페이지로 이동해 주세요.",
  },
  en: {
    title: "Blue Photo — Suwon, remembered in photographs",
    description:
      "Suwon Samsung matches and the moments around them. Explore the Blue Photo archive on iOS, Android and Windows.",
    nav: "The app",
    archive: "Blog",
    download: "Get the app",
    eyebrow: "Suwon Samsung photo archive",
    headline: ["Back to the match.", "Back to that moment."],
    intro:
      "The sound of the stands. A face you still remember. Find years of Suwon Samsung memories in Blue Photo.",
    availability: "iPhone, iPad, Android, Windows",
    galleryLabel: "Inside Blue Photo",
    galleryTitle: "Every photograph brings you back.",
    galleryBody:
      "Browse by date, find a player or match, and keep the moments that matter in your favorites.",
    screenLabels: [
      "Browse through the years",
      "Rediscover a collection",
      "Find your moment",
    ],
    featureTitles: [
      "Through the years",
      "Find your moment",
      "Share the moment",
    ],
    featureBodies: [
      "Explore published photographs in date order.",
      "Browse collections by player, match and year, or search for a memory.",
      "Share photos to social media and enjoy the memories together.",
    ],
    getTitle: "Your next memory starts here.",
    getBody: "Download Blue Photo from the store for your device.",
    open: "Download from the store",
    privacy: "Privacy policy",
    terms: "Terms of use",
    credit: "Photography · JK HONG",
    skip: "Skip to content",
    downloadTitle: "Download Blue Photo",
    downloadBody: "Choose the store for your device.",
    redirect:
      "Opening your app store. If it does not open, use a button below.",
    manual: "You can also choose an app for another device below.",
    back: "About Blue Photo",
    notFound: "This page could not be found.",
    notFoundBody: "Check the address or return to the Blue Photo home page.",
  },
};
