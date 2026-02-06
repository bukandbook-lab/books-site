document.addEventListener("DOMContentLoaded", () => {
  
  function hideSeeMore() {
  const box = document.getElementById("seeMoreContainer");
  if (box) box.style.display = "none";
}

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
    hideSeeMore(); 
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

     // 🔑 RE-APPLY SEE MORE FOR CURRENT TAB
     const grid = panel?.querySelector(".image-grid");
     if (grid && typeof applySeeMore === "function") {
        applySeeMore(grid);
       

     }

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
const fields = [
  book.title,
  book.Author,
  book.Series,
  book.category,
  ...(Array.isArray(book.tags) ? book.tags : [])
];

const words = fields.flatMap(f => normalizeWords(f));

if (!words.some(w => w.includes(keyword))) return;


      const div = document.createElement("div");
      div.className = "book-thumb";

      const isSetBook = Number(book.SetQtty) > 1;
      const priceLabel = isSetBook ? "/set" : "/book";

      div.innerHTML = `
  <div class="skeleton"></div>

  <img
    src="${book.img}"
    class="grid-book-img popup-trigger"
    loading="lazy"
    data-book-id="${book.id}"
  >

  <!-- 🔥 HOVER PRICE BOX -->
  <div class="price-box"
    data-book-id="${book.id}"
    data-title="${book.title}"
    data-price="${Number(book.price).toFixed(2)}"
    data-setqtty="${book.SetQtty || 1}"
  >
    &nbsp&nbspRM${Number(book.price).toFixed(2)}${priceLabel}
    <img
      data-book-id="${book.id}"
      src="${CART_ICON}"
      class="cart-icon"
    >
      `;

      grid.appendChild(div);
    });

    if (typeof applySeeMore === "function") {
      applySeeMore(grid);
      moveSeeMoreAfter(grid);

}

    if (typeof syncCartIcons === "function") {
      syncCartIcons();
    }
  });
});
