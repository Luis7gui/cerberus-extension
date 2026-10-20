// overlay.js
// Homepage allowed
// Shorts removed
// Low-quality content filtered

let overlayElement = null;

(function () {

  /* ============================
     Overlay (Used only for Shorts page)
  ============================ */

  function createOverlay() {
    if (overlayElement) return;

    overlayElement = document.createElement("div");
    overlayElement.id = "cerberus-overlay";

    overlayElement.innerHTML = `
      <div class="cerberus-container">
        <h2>Cerberus Active</h2>
        <p>Shorts are disabled.</p>
      </div>
    `;

    document.documentElement.appendChild(overlayElement);
  }

  function show() {
    if (!overlayElement) createOverlay();
    overlayElement.style.display = "flex";
  }

  function hide() {
    if (!overlayElement) return;
    overlayElement.style.display = "none";
  }

  /* ============================
     QUALITY HEURISTICS
  ============================ */

  const MIN_DURATION_SECONDS = 180; // 3 minutes

  const LOW_SIGNAL_PATTERNS = [
    /prank/i,
    /drama/i,
    /reaction/i,
    /exposed/i
  ];

  function isAllCaps(title) {
    return title.length > 10 && title === title.toUpperCase();
  }

  function parseDuration(durationText) {
    if (!durationText) return 0;

    const parts = durationText.split(":").map(Number);
    if (parts.length === 3) {
      return parts[0]*3600 + parts[1]*60 + parts[2];
    }
    if (parts.length === 2) {
      return parts[0]*60 + parts[1];
    }
    return 0;
  }

  function shouldHideVideo(videoElement) {
    const titleEl = videoElement.querySelector("#video-title");
    const durationEl = videoElement.querySelector("ytd-thumbnail-overlay-time-status-renderer span");

    if (!titleEl) return false;

    const title = titleEl.textContent.trim();

    // Low signal keyword
    if (LOW_SIGNAL_PATTERNS.some(pattern => pattern.test(title))) {
      return true;
    }

    // ALL CAPS spam
    if (isAllCaps(title)) {
      return true;
    }

    // Duration filter
    if (durationEl) {
      const seconds = parseDuration(durationEl.textContent.trim());
      if (seconds > 0 && seconds < MIN_DURATION_SECONDS) {
        return true;
      }
    }

    return false;
  }

  function filterVideos() {
    const videos = document.querySelectorAll("ytd-rich-item-renderer, ytd-video-renderer");

    videos.forEach(video => {
      if (shouldHideVideo(video)) {
        video.style.display = "none";
      }
    });
  }

  /* ============================
     Remove Shorts Shelf
  ============================ */

  function removeShortsShelves() {
    const shelves = document.querySelectorAll("ytd-rich-shelf-renderer");

    shelves.forEach(shelf => {
      const title = shelf.textContent;
      if (title && title.toLowerCase().includes("shorts")) {
        shelf.remove();
      }
    });
  }

  /* ============================
     Watch Page Cleanup
  ============================ */

  function enforceWatchPageRestrictions() {
    const secondary = document.getElementById("secondary");
    if (secondary) {
      secondary.style.display = "none";
    }

    const endScreens = document.querySelectorAll(".ytp-endscreen-content");
    endScreens.forEach(el => el.remove());

    const autoplay = document.querySelector("ytd-compact-autoplay-renderer");
    if (autoplay) {
      autoplay.remove();
    }
  }

  /* ============================
     Shorts Page Block
  ============================ */

  function checkShortsPage() {
    if (window.location.pathname.startsWith("/shorts")) {
      show();
    } else {
      hide();
    }
  }

  /* ============================
     Mutation Observer
  ============================ */

  const observer = new MutationObserver(() => {
    removeShortsShelves();
    filterVideos();
    enforceWatchPageRestrictions();
    checkShortsPage();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  /* ============================
     Init
  ============================ */

  function init() {
    removeShortsShelves();
    filterVideos();
    enforceWatchPageRestrictions();
    checkShortsPage();

    window.dispatchEvent(
      new CustomEvent("cerberus:overlay-ready")
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.CerberusOverlay = {
    show,
    hide
  };

})();