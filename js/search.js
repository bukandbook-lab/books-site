document.addEventListener("DOMContentLoaded", () => {

  const searchInput = document.getElementById("bookSearch");
  if (!searchInput) return;

  let lastTab = "BeginningReader"; // 🧠 default fallback

  function normalizeWords(text = "") {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);
  }

  function getActiveTab() {
    return document.querySelector(".tab-btn.active")?.dataset.tab;
  }

  function hideTabs() {
    document.querySelectorAll(".tabcontent")
      .forEach(t => t.style.display = "none");
  }

  function getSearchGrid() {
    let g = document.getElementById("searchResults");
    if (!g) {
      g = document.createElement("div");
      g.id = "searchResults";
      g.className = "image-grid";
      document.body.appendChild(g);
    }
    return g;
  }

  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.trim().toLowerCase();

    // 🧠 remember last active tab BEFORE search starts
    const active = getActiveTab();
    if (active) lastTab = active;

    /* ============================
       🔙 SEARCH CLEARED
    ============================ */
    if (!keyword) {
      document.getElementById("searchResults")?.remove();

      hideTabs();

      // restore last tab
      const panel = document.getElementById(lastTab);
      if (panel) panel.style.display = "block";

      document.querySelectorAll(".tab-btn")
        .forEach(btn =>
          btn.classList.toggle("active", btn.dataset.tab === lastTab)
        );

      return;
    }

    /* ============================
       🔍 GLOBAL SEARCH MODE
    ============================ */

    // remove all active tab styles
    document.querySelectorAll(".tab-btn")
      .forEach(btn => btn.classList.remove("active"));

    hideTabs();

    const grid = getSearchGrid();
    grid.innerHTML = "";

    Object.values(BOOK_REGISTRY).forEach(book => {
      const words = normalizeWords(book.title);
      if (!words.some(w => w.includes(keyword))) return;

      const div = document.createElement("div");
      div.className = "book-thumb";

      div.innerHTML = `
      <div class="skeleton"></div>
        <img
          src="${book.img}"
          class="grid-book-img popup-trigger"
          loading="lazy" 
          data-book-id="${book.id}"
        >
        <img
          src="${CART_ICON}"
          class="cart-icon"
          loading="lazy" 
          data-book-id="${book.id}"
          data-title="${book.title}"
          data-price="${book.price}"
          data-setqtty="${book.SetQtty}"
        >
      `;

      grid.appendChild(div);
    });

    if (typeof syncCartIcons === "function") {
      syncCartIcons();
    }
  });
});
