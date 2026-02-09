    /* ============================
       HIDE TAB
    ============================ */
function hideTabs() {
  document.querySelectorAll(".tabcontent")
    .forEach(t => t.style.display = "none");
}

    /* ============================
       getNoSearchResultBox
    ============================ */
window.getNoSearchResultBox = function () {
  let box = document.getElementById("noSearchResultBox");
  if (box) return box;

  box = document.createElement("div");
  box.id = "noSearchResultBox";
  box.className = "noSearchResult hidden";
  box.style.margin = "12px 0";
  box.style.fontWeight = "500";

  box.innerHTML = `
    <div style="margin-bottom:6px">
      No search result found. Do you want to make a special request instead?
    </div>
    <button id="reqYes">Yes</button>
    <button id="reqNo">No</button>
  `;

  // ✅ Insert AFTER search results container
  const searchGrid = document.getElementById("searchResults");
  if (searchGrid) {
    searchGrid.insertAdjacentElement("afterend", box);
  } else {
    // fallback
    document.body.appendChild(box);
  }

  return box;
};


 /* ============================
       LISTENER FOR YES NO PROCEED TO REQUEST
    ============================ */
document.addEventListener("click", e => {
  // YES → go to RequestBook
  if (e.target.id === "reqYes") {
    hideTabs();

const reqTab = document.getElementById("RequestBook");
if (reqTab) {
  reqTab.style.display = "block";
}


    document.querySelectorAll(".tab-btn")
      .forEach(btn => btn.classList.remove("active"));

    getNoSearchResultBox().classList.add("hidden");
    hideSeeMore();
  }

  // NO → return to last tab
  if (e.target.id === "reqNo") {
    hideTabs();

    const panel = document.getElementById(window.lastTab);
    if (panel) panel.style.display = "block";

    document.querySelectorAll(".tab-btn")
      .forEach(btn =>
        btn.classList.toggle("active", btn.dataset.tab === window.lastTab)
      );

    const grid = panel?.querySelector(".image-grid");
    if (grid && typeof applySeeMore === "function") {
      applySeeMore(grid);
      bindSeeMoreToGrid(grid);
    }

    getNoSearchResultBox().classList.add("hidden");
  }
});

 /* ============================
       SEARCH.JS
    ============================ */

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

  const box = getNoSearchResultBox();
  box.classList.add("hidden");
        
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

<div class="book-bg" data-bg="img.jpg"></div>

  <img
    src="${book.img}"
    class="grid-book-img popup-trigger"
    loading="lazy"
    data-book-id="${book.id}"
    decoding="async"
    fetchpriority="high"
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
      progressiveImageLoad(div);

    });

const box = getNoSearchResultBox();

if (!hasResult) {
  box.classList.remove("hidden");
  grid.classList.add("hidden");
  hideSeeMore();
} else {
  box.classList.add("hidden");
  grid.classList.remove("hidden");
}




    if (typeof applySeeMore === "function") {
      applySeeMore(grid);
      moveSeeMoreAfter(grid);


}

    if (typeof syncCartIcons === "function") {
      syncCartIcons();
    }
  });



});


