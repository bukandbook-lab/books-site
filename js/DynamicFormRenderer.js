/* ==============================
   DynamicFormRenderer.js — LIVE SEARCH ENABLED
================================ */

document.addEventListener("DOMContentLoaded", () => {
  renderBookTitleForm();
  renderSeriesForm();
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
      <label>Number of books</label>
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
      <input class="req-book-title" data-book-id="${id}" placeholder="Title for Book ${i}">
      <input class="req-book-author" data-book-id="${id}" placeholder="Author (optional)">

      <div class="price-box request-price-box"
           data-book-id="${id}"
           data-title=""
           data-author=""
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
    grid.innerHTML = `<div style="grid-column:1/-1;opacity:.6">No results found</div>`;
    grid.classList.remove("hidden");
    resetPriceBox(priceBox, row.dataset.bookId);
    return;
  }

  grid.classList.remove("hidden");

  results.slice(0, 8).forEach(book => {
    const item = document.createElement("div");
    item.className = "inline-search-item";

    item.innerHTML = `
      <img src="${book.img}" loading="lazy">
      <div>${book.title}</div>
    `;

    item.addEventListener("click", () => {
      const isSet = Number(book.SetQtty) > 1;
      const priceLabel = isSet ? "/set" : "/book";

      titleInput.value = book.title;

      priceBox.dataset.bookId = book.id;
      priceBox.dataset.price = Number(book.price).toFixed(2);
      priceBox.dataset.title = book.title;

      priceBox.innerHTML = `
        RM${Number(book.price).toFixed(2)}${priceLabel}
        <img src="${CART_ICON}" data-book-id="${book.id}" class="cart-icon">
      `;

      grid.innerHTML = "";
      grid.classList.add("hidden");

      if (typeof syncCartIcons === "function") {
        syncCartIcons();
      }
    });

    grid.appendChild(item);
  });
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
   SERIES (UNCHANGED)
================================ */
function renderSeriesForm() {
  const wrap = document.getElementById("seriesInputs");
  if (!wrap) return;

  wrap.insertAdjacentHTML("beforebegin", `
    <div class="request-row">
      <label>Number of series</label>
      <input type="text" id="seriesCount" value="1">
      <button type="button" id="resetSeries">Reset</button>
    </div>
  `);

  updateSeriesInputs(1);

  document.getElementById("seriesCount").addEventListener("input", e => {
    const v = Math.max(1, Number(e.target.value.replace(/\D/g, "")));
    e.target.value = v;
    updateSeriesInputs(v);
  });
}

function updateSeriesInputs(count) {
  const wrap = document.getElementById("seriesInputs");
  if (!wrap) return;

  while (wrap.children.length < count) {
    const i = wrap.children.length + 1;
    const id = `S${String(i).padStart(3, "0")}`;

    wrap.insertAdjacentHTML("beforeend", `
      <div class="req-series-row">
        <input class="req-series-title" placeholder="Series ${i}">
        <input class="req-series-author" placeholder="Author (optional)">
        <div class="price-box request-price-box" data-book-id="${id}" data-price="4">
          RM4 / set
          <img src="${CART_ICON}" class="cart-icon">
        </div>
      </div>
    `);
  }

  while (wrap.children.length > count) {
    wrap.lastElementChild.remove();
  }
}

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

