function hideTabs() {
  document.querySelectorAll(".tabcontent")
    .forEach(t => t.style.display = "none");
}

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
    hideSeeMore(); 
    const keyword = searchInput.value.trim().toLowerCase();
    let hasResult = false;

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
        bindSeeMoreToGrid(grid);
 

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
  const searchableText = [
    book.title,
    book.Author,
    book.Series
  ].filter(Boolean).join(" ");

  const words = normalizeWords(searchableText);
  const keywordWords = normalizeWords(keyword);

  if (!keywordWords.every(kw =>
    words.some(w => w.includes(kw))
  )) return;

  hasResult = true;

      const div = document.createElement("div");
      div.className = "book-thumb";

      const isSetBook = Number(book.SetQtty) > 1;
      const priceLabel = isSetBook ? "/set" : "/book";

      div.innerHTML = `
  <div class="skeleton"></div>

  <div class="book-bg"
     style="background-image:url('${book.img}')"></div>

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


let msg = document.getElementById("noSearchResult");

if (!msg) {
  msg = document.createElement("div");
  msg.id = "noSearchResult";
  msg.className = "hidden";
  msg.style.gridColumn = "1 / -1";
  msg.style.marginBottom = "6px";
  msg.style.fontWeight = "500";

  msg.innerHTML = `
    No search result found.<br>
    Do you want to make a special request instead?
    <br><br>
    <button data-action="reqYes">Yes</button>
    <button data-action="reqNo">No</button>
  `;

  grid.parentNode.insertBefore(msg, grid);
}



if (!hasResult) {
  msg.classList.remove("hidden");
  grid.classList.add("hidden");
  hideSeeMore();
} else {
  msg.classList.add("hidden");
  grid.classList.remove("hidden");
}

    if (typeof applySeeMore === "function") {
      applySeeMore(grid);
      bindSeeMoreToGrid(grid);


}

    if (typeof syncCartIcons === "function") {
      syncCartIcons();
    }
  });



});


