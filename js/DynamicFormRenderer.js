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
      MERGED & INTEGRATED handler
  ================================= */

document.addEventListener("input", e => {
  const row = e.target.closest(".req-book-row");
  if (!row) return;

  const titleInput = row.querySelector(".req-book-title");
  const authorInput = row.querySelector(".req-book-author");
  const specificInput = row.querySelector(".req-book-specific");
  const priceBox = row.querySelector(".price-box");
  const grid = ensureInlineGrid(row);

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const specific = specificInput.value.trim();

  // sync dataset
  priceBox.dataset.title = title;
  priceBox.dataset.author = author;
  priceBox.dataset.specific = specific;

  // clear grid state
  grid.innerHTML = "";
  grid.classList.add("hidden");

  if (!title) {
    resetPriceBox(priceBox, row.dataset.bookId);
    return;
  }

  const keyword = [title, author, specific].join(" ").trim();
  const results = searchBooks(keyword);

  /* ==============================
     NO SEARCH RESULTS
  ================================= */
  if (!results.length) {
    grid.classList.remove("hidden");

    grid.innerHTML = `
      <div style="grid-column:1/-1;opacity:.7">
        No search results found.<br/>
        Choose request type:
        <div style="margin-top:6px">
          <label>
            <input type="radio" name="reqType-${row.dataset.bookId}" value="book" checked>
            Book
          </label>
          &nbsp;&nbsp;
          <label>
            <input type="radio" name="reqType-${row.dataset.bookId}" value="series">
            Series
          </label>
        </div>
      </div>
            <div class="price-box request-price-box"
           data-book-id="${id}"
           data-title="${priceBox.dataset.title}"
           data-author="${priceBox.dataset.author}"
           data-specific="${priceBox.dataset.specific}"
           data-price="">
        RM1 / book
        <img src="${CART_ICON}" data-book-id="${id}" class="cart-icon">
      </div>
    `;

    // default → Book
    setRequestType(priceBox, row.dataset.bookId, "book");

    return;
  }

  /* ==============================
     SEARCH RESULTS FOUND
  ================================= */
  grid.classList.remove("hidden");

  results.forEach(book => {
    const div = document.createElement("div");
    div.className = "book-thumb";

    const isSet = Number(book.SetQtty) > 1;
    const priceLabel = isSet ? "/set" : "/book";

    div.innerHTML = `
      <img src="${book.img}" class="grid-book-img" loading="lazy">
      <div class="price-box"
           data-book-id="${book.id}"
           data-price="${Number(book.price).toFixed(2)}">
        RM${Number(book.price).toFixed(2)}${priceLabel}
      </div>
    `;

    div.addEventListener("click", () => {
      titleInput.value = book.title;

      priceBox.dataset.bookId = book.id;
      priceBox.dataset.price = Number(book.price).toFixed(2);
      priceBox.dataset.type = isSet ? "series" : "book";

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

    grid.appendChild(div);
  });
});

/* ==============================
   PRICE RESET HELPER
================================ */
function resetPriceBox(priceBox, id) {
  priceBox.dataset.bookId = ${id};
  priceBox.dataset.price = "1";
  priceBox.innerHTML = `
    RM1 / book
    <img src="${CART_ICON}" data-book-id="${id}" class="cart-icon">
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
/* ==============================
   radio-button behavior listener
================================ */
document.addEventListener("change", e => {
  if (!e.target.matches("input[type=radio][name^='reqType-']")) return;

  const row = e.target.closest(".req-book-row");
  const priceBox = row.querySelector(".price-box");

  setRequestType(priceBox, row.dataset.bookId, e.target.value);
});

/* ==============================
   price switcher helper
================================ */
function setRequestType(priceBox, id, type) {
  if (type === "series") {
    priceBox.dataset.bookId = ${id};
    priceBox.dataset.price = "4";
    priceBox.dataset.type = "series";

    priceBox.innerHTML = `
      RM4 / set
      <img src="${CART_ICON}" data-book-id="${id}" class="cart-icon">
    `;
  } else {
    priceBox.dataset.bookId = ${id};
    priceBox.dataset.price = "1";
    priceBox.dataset.type = "book";

    priceBox.innerHTML = `
      RM1 / book
      <img src="${CART_ICON}" data-book-id="${id}" class="cart-icon">
    `;
  }

  if (typeof syncCartIcons === "function") {
    syncCartIcons();
  }
}



