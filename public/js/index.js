// Parse MMSI from path (e.g., /share/636022601)
const pathParts = window.location.pathname.split("/").filter(Boolean);
const mmsi = pathParts.length >= 2 && pathParts[0] === "share" ? pathParts[1] : null;

// Get referral code from URL query params
const urlParams = new URLSearchParams(window.location.search);
const referralCode = urlParams.get("ref") || urlParams.get("referral") ||
  urlParams.get("code") || urlParams.get("r") || "";

// Detect platform
const userAgent = navigator.userAgent.toLowerCase();
const isIOS = /iphone|ipad|ipod/.test(userAgent);
const isMac = /macintosh|mac os x/.test(userAgent) && !("ontouchend" in document);
const isAndroid = /android/.test(userAgent);

// Build store URLs
function buildAppStoreUrl() {
  const base = "https://apps.apple.com/app/id6560109315";
  const params = [];
  if (referralCode) params.push("ref=" + encodeURIComponent(referralCode));
  if (mmsi) params.push("mmsi=" + encodeURIComponent(mmsi));
  return params.length ? base + "?" + params.join("&") : base;
}

function buildPlayStoreUrl() {
  const base = "https://play.google.com/store/apps/details?id=com.lascade.marinetracker";
  const referrerParts = [];
  if (referralCode) referrerParts.push("referral=" + referralCode);
  if (mmsi) referrerParts.push("mmsi=" + mmsi);
  if (referrerParts.length) {
    return base + "&referrer=" + encodeURIComponent(referrerParts.join("&"));
  }
  return base;
}

// Determine redirect URL based on platform
let redirectUrl;
if (isIOS || isMac) {
  redirectUrl = buildAppStoreUrl();
} else if (isAndroid) {
  redirectUrl = buildPlayStoreUrl();
} else {
  // Desktop / other — redirect to main website
  const webBase = "https://www.marineradar.com/";
  if (mmsi) {
    redirectUrl = webBase + "share/" + encodeURIComponent(mmsi);
  } else {
    redirectUrl = webBase;
  }
}

// Log analytics
try {
  firebase.analytics().logEvent("web_share_page_view", {
    isIOS: isIOS,
    isMac: isMac,
    isAndroid: isAndroid,
    referralCode: referralCode,
    mmsi: mmsi,
  });
} catch (e) {
  console.error("Firebase Analytics error:", e);
}

// Redirect
window.location.href = redirectUrl;
