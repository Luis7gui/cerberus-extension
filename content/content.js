// content.js
// Responsible for route validation and navigation monitoring

const ALLOWED_ROUTES = [
  "/",
  "/results",
  "/watch",
  "/feed/subscriptions"
];

let isTemporarilyAllowed = false;
let overlayReady = false;

/* ============================
   Route Logic
============================ */

function isRouteAllowed(pathname) {
  return ALLOWED_ROUTES.some(route =>
    pathname.startsWith(route)
  );
}

function shouldBlock() {
  if (isTemporarilyAllowed) return false;
  return !isRouteAllowed(window.location.pathname);
}

function evaluateRoute() {
  if (!overlayReady || !window.CerberusOverlay) return;

  if (shouldBlock()) {
    window.CerberusOverlay.show();
  } else {
    window.CerberusOverlay.hide();
  }
}

/* ============================
   SPA Navigation Interception
============================ */

function observeNavigation() {
  const pushState = history.pushState;
  const replaceState = history.replaceState;

  history.pushState = function () {
    pushState.apply(this, arguments);
    resetTemporaryPermission();
    setTimeout(evaluateRoute, 50);
  };

  history.replaceState = function () {
    replaceState.apply(this, arguments);
    resetTemporaryPermission();
    setTimeout(evaluateRoute, 50);
  };

  window.addEventListener("popstate", () => {
    resetTemporaryPermission();
    setTimeout(evaluateRoute, 50);
  });

  // YouTube internal SPA navigation
  window.addEventListener("yt-navigate-finish", () => {
    resetTemporaryPermission();
    setTimeout(evaluateRoute, 50);
  });
}

/* ============================
   Temporary Permission
============================ */

function resetTemporaryPermission() {
  isTemporarilyAllowed = false;
}

window.CerberusAllowTemporarily = function () {
  isTemporarilyAllowed = true;
  if (window.CerberusOverlay) {
    window.CerberusOverlay.hide();
  }
};

/* ============================
   Overlay Ready Listener
============================ */

window.addEventListener("cerberus:overlay-ready", () => {
  overlayReady = true;
  evaluateRoute();
});

/* ============================
   Init
============================ */

observeNavigation();