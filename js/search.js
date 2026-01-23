document.addEventListener("DOMContentLoaded", () => {

  const searchInput = document.getElementById("bookSearch");
  if (!searchInput) return;

  let lastTab = null;

  function normalize(t = "") {
    return t.toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function getActiveTab() {
    const btn = document.querySelector(".tab-btn.active");
    return btn?.dataset.tab;
  }

  function hideTabs() {
    document.querySelectorAll(".tabcontent").forEach(t => t.style.display = "none");
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

    if (!keyword) {
      document.getElementById("searchResults")?.remove();
      document.getElementById(lastTab).style.display = "block";
      return;
    }

    hideTabs();

    const grid = getSearchGrid();
    grid.innerHTML = "";

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
        >
      `;

      grid.appendChild(div);
    });

    syncCartIcons();
  });
});
