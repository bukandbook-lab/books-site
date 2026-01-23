document.addEventListener("DOMContentLoaded", () => {

  const searchInput = document.getElementById("bookSearch");
  if (!searchInput) return;

  let lastTab = null;

  function normalize(t = "") {
    return t.toLowerCase().replace(/[^a-z0-9]/g, "");
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
    const keyword = normalize(searchInput.value);

    if (!lastTab) lastTab = getActiveTab();

    // 🔙 Restore tab view when search cleared
    if (!keyword) {
      document.getElementById("searchResults")?.remove();
      if (lastTab) {
        document.getElementById(lastTab).style.display = "block";
      }
      return;
    }

    hideTabs();
    const grid = getSearchGrid();
    grid.innerHTML = "";

    // ✅ GLOBAL SEARCH (ALL BOOKS, ALL TABS)
    Object.values(BOOK_REGISTRY).forEach(book => {
      if (!normalize(book.title).includes(keyword)) return;

      const div = document.createElement("div");
      div.className = "book-thumb";

      div.innerHTML = `
        <img
          src="${book.img}"
          class="grid-book-img popup-trigger"
          data-book-id="${book.id}"
        >
        <img
          src="${CART_ICON}"
          class="cart-icon"
          data-book-id="${book.id}"
          data-title="${book.title}"
          data-price="${book.price}"
          data-setqtty="${book.SetQtty}"
        >
      `;

      grid.appendChild(div);
    });

    // keep cart icons in sync
    if (typeof syncCartIcons === "function") {
      syncCartIcons();
    }
  });
});
