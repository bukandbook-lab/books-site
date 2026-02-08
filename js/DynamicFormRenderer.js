/* ==============================
   DynamicFormRenderer.js — LIVE SEARCH ENABLED
================================ */

document.addEventListener("DOMContentLoaded", () => {
  renderBookTitleForm();
});

/* ==============================
   GLOBAL STATE
================================ */
let requestCounter = 1;

/* ==============================
   SEARCH UTIL (shared logic)
================================ */
function normalizeWords(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function searchBooks(keyword) {
  if (!keyword || !window.BOOK_REGISTRY) return [];

  const keywordWords = normalizeWords(keyword);
  const results = [];

  Object.values(BOOK_REGISTRY).forEach(book => {
    const searchableText = [book.title, book.Author, book.Series]
      .filter(Boolean)
      .join(" ");

    const words = normalizeWords(searchableText);

    if (keywordWords.every(kw => words.some(w => w.includes(kw)))) {
      results.push(book);
    }
  });

  return results;
}

/* ==============================
   BOOK FORM
================================ */
function renderBookTitleForm() {
  const bookWrap = document.getElementById("bookTitleInputs");
  if (!bookWrap) return;

  bookWrap.insertAdjacentHTML("beforebegin", `
    <div class="request-row">
      <label>Number of books/series</label>
      <input type="text" id="bookCount" inputmode="numeric" pattern="[0-9]*" value="1" />
      <button type="button" id="resetBooks">Reset</button>
    </div>
  `);

  updateBookInputs(1);

  document.getElementById("bookCount").addEventListener("input", e => {
    let val = e.target.value.replace(/\D/g, "");
    if (!val) return;
    e.target.value = Math.max(1, Number(val));
    updateBookInputs(e.target.value);
  });
}

/* ==============================
   BOOK INPUTS
================================ */
function updateBookInputs(count) {
  const wrap = document.getElementById("bookTitleInputs");
  if (!wrap) return;

  const existing = wrap.querySelectorAll(".req-book-row").length;

  for (let i = existing + 1; i <= count; i++) {
    const id = `R${String(i).padStart(3, "0")}`;

    const row = document.createElement("div");
    row.className = "req-book-row";
    row.dataset.bookId = id;

    row.innerHTML = `
      <input class="req-book-title" data-book-id="${id}" placeholder="Enter title for Book/Series #${i}"><br/>
      <input class="req-book-author" data-book-id="${id}" placeholder="Author's name (optional)">
      <input class="req-book-specific" data-book-id="${id}" placeholder="Specific book title for Series #${i}(if any)">

      <div class="price-box request-price-box"
           data-book-id="${id}"
           data-title=""
           data-author=""
           data-specific=""
           data-price="1">
        RM1 / book
        <img src="${CART_ICON}" data-book-id="${id}" class="cart-icon">
      </div>

      ${i === 1 ? "" : `
        <img src="${CLOSE_ICON}" class="remove-request" data-book-id="${id}">
      `}
      <div class="inline-search-grid"></div>

    `;

    wrap.appendChild(row);
  }

  while (wrap.children.length > count) {
    wrap.lastElementChild.remove();
  }
}

/* ==============================
   LIVE SEARCH ON BOOK TITLE
================================ */
document.addEventListener("input", e => {
  const titleInput = e.target.closest(".req-book-title");
  if (!titleInput) return;

  const row = titleInput.closest(".req-book-row");
  const priceBox = row.querySelector(".price-box");
  const grid = ensureInlineGrid(row);

  const keyword = titleInput.value.trim();
  priceBox.dataset.title = keyword;

  // Clear state
  grid.innerHTML = "";
  grid.classList.add("hidden");

  if (!keyword) {
    resetPriceBox(priceBox, row.dataset.bookId);
    return;
  }

  const results = searchBooks(keyword);

  if (!results.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;opacity:.6">No search results found. You may proceed with request books/series</div>`;
    grid.classList.remove("hidden");
    resetPriceBox(priceBox, row.dataset.bookId);
    return;
  }

  grid.classList.remove("hidden");

  results.slice().forEach(book => {
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
   
    if (typeof applySeeMore === "function") {
      applySeeMore(grid);
      moveSeeMoreAfter(grid);

}

    if (typeof syncCartIcons === "function") {
      syncCartIcons();
    }
       
   
    grid.appendChild(item);
  });



/* ==============================
   AUTHOR LIVE UPDATE
================================ */
document.addEventListener("input", e => {
  const authorInput = e.target.closest(".req-book-author");
  if (!authorInput) return;

  const row = authorInput.closest(".req-book-row");
  row.querySelector(".price-box").dataset.author = authorInput.value.trim();
});

/* ==============================
   SPECIFIC LIVE UPDATE
================================ */
document.addEventListener("input", e => {
  const SpecificInput = e.target.closest(".req-book-specific");
  if (!SpecificInput) return;

  const row = SpecificInput.closest(".req-book-row");
  row.querySelector(".price-box").dataset.specific = SpecificInput.value.trim();
});
/* ==============================
   PRICE RESET HELPER
================================ */
function resetPriceBox(priceBox, requestId) {
  priceBox.dataset.bookId = requestId;
  priceBox.dataset.price = "1";
  priceBox.innerHTML = `
    RM1 / book
    <img src="${CART_ICON}" data-book-id="${requestId}" class="cart-icon">
  `;

  if (typeof syncCartIcons === "function") {
    syncCartIcons();
  }
}

/* ==============================
   REMOVE ROW
================================ */
document.addEventListener("click", e => {
  const btn = e.target.closest(".remove-request");
  if (!btn) return;

  e.preventDefault();
  btn.closest(".req-book-row")?.remove();
});

/* ==============================
   RESET
================================ */
document.addEventListener("click", e => {
  if (e.target.id === "resetBooks") {
    e.preventDefault();
    const wrap = document.getElementById("bookTitleInputs");
    document.getElementById("bookCount").value = 1;
    [...wrap.children].slice(1).forEach(r => r.remove());
  }
});

/* ==============================
   helper to ensure grid exists
================================ */
function ensureInlineGrid(row) {
  let grid = row.querySelector(".inline-search-grid");
  if (!grid) {
    grid = document.createElement("div");
    grid.className = "inline-search-grid hidden";
    row.appendChild(grid);
  }
  return grid;
}


