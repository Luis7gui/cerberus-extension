// cerberus-extension
// content.js
// Responsible for route validation and navigation monitoring

const ALLOWED_ROUTES = [
  "/results",
  "/watch",
  "/feed/subscriptions"
];

let isTemporarilyAllowed = false;
let overlayReady = false;

function isRouteAllowed(pathname) {
  return ALLOWED_ROUTES.some(route => pathname.startsWith(route));
}

function shouldBlock() {
  if (isTemporarilyAllowed) return false;
  return !isRouteAllowed(window.location.pathname);
}

function evaluateRoute() {
  if (!overlayReady) return;

  if (shouldBlock()) {
    window.CerberusOverlay.show();
  } else {
    window.CerberusOverlay.hide();
  }
}

// SPA navigation interception
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
}

function resetTemporaryPermission() {
  isTemporarilyAllowed = false;
}

window.CerberusAllowTemporarily = function () {
  isTemporarilyAllowed = true;
  window.CerberusOverlay.hide();
};

// Wait for overlay to be ready
window.addEventListener("cerberus:overlay-ready", () => {
  overlayReady = true;
  evaluateRoute();
});

observeNavigation();