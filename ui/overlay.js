// cerberus-extension
// overlay.js
// Responsible for rendering and controlling the UI overlay

let overlayElement = null;

(function () {

  /* ---------------------------
     Overlay Creation
  ---------------------------- */

  function createOverlay() {
    if (overlayElement) return;

    overlayElement = document.createElement("div");
    overlayElement.id = "cerberus-overlay";

    overlayElement.innerHTML = `
      <div class="cerberus-container">
        <input 
          type="text" 
          id="cerberus-search" 
          placeholder="Search YouTube..."
        />
        <div class="cerberus-buttons">
          <button id="cerberus-search-btn">Search</button>
          <button id="cerberus-subscriptions-btn">Subscriptions</button>
          <button id="cerberus-allow-btn" class="cerberus-allow">
            Allow this page
          </button>
        </div>
      </div>
    `;

    document.documentElement.appendChild(overlayElement);

    attachEvents();
  }

  /* ---------------------------
     Event Binding
  ---------------------------- */

  function attachEvents() {
    const searchInput = document.getElementById("cerberus-search");
    const searchBtn = document.getElementById("cerberus-search-btn");
    const subsBtn = document.getElementById("cerberus-subscriptions-btn");
    const allowBtn = document.getElementById("cerberus-allow-btn");

    searchBtn.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href =
          `/results?search_query=${encodeURIComponent(query)}`;
      }
    });

    subsBtn.addEventListener("click", () => {
      window.location.href = "/feed/subscriptions";
    });

    allowBtn.addEventListener("click", () => {
      hide();
    });
  }

  /* ---------------------------
     Visibility Control
  ---------------------------- */

  function show() {
    if (!overlayElement) createOverlay();
    overlayElement.style.display = "flex";
  }

  function hide() {
    if (!overlayElement) return;
    overlayElement.style.display = "none";
  }

  function shouldBlockPage() {
    const path = window.location.pathname;
    return path === "/";
  }

  function updateOverlayVisibility() {
    if (shouldBlockPage()) {
      show();
    } else {
      hide();
    }
  }

  /* ---------------------------
     YouTube SPA Navigation
  ---------------------------- */

  window.addEventListener("yt-navigate-finish", () => {
    updateOverlayVisibility();
  });

  /* ---------------------------
     Init
  ---------------------------- */

  function init() {
    createOverlay();
    updateOverlayVisibility();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* ---------------------------
     Public API
  ---------------------------- */

  window.CerberusOverlay = {
    show,
    hide,
    updateOverlayVisibility
  };

})();