/* ==============================
   DynamicFormRenderer.js — FINAL
================================ */

document.addEventListener("DOMContentLoaded", () => {
  renderBookTitleForm();
});

/* ==============================
   SEARCH UTIL
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

  return Object.values(BOOK_REGISTRY).filter(book => {
    const searchable = [book.title, book.Author, book.Series]
      .filter(Boolean)
      .join(" ");
    const words = normalizeWords(searchable);

    return keywordWords.every(kw =>
      words.some(w => w.includes(kw))
    );
  });
}

/* ==============================
   FORM
================================ */
function renderBookTitleForm() {
  const wrap = document.getElementById("bookTitleInputs");
  if (!wrap) return;

  wrap.insertAdjacentHTML("beforebegin", `
    <div class="request-row">
      <label>Number of books / series</label>
      <input id="bookCount" value="1">
      <button id="resetBooks">Reset</button>
    </div>
  `);

  updateBookInputs(1);

  document.getElementById("bookCount").addEventListener("input", e => {
    const val = Math.max(1, Number(e.target.value.replace(/\D/g, "")));
    e.target.value = val;
    updateBookInputs(val);
  });
}

/* ==============================
   ROW CREATION
================================ */
function updateBookInputs(count) {
  const wrap = document.getElementById("bookTitleInputs");

  while (wrap.children.length < count) {
    const i = wrap.children.length + 1;
    const id = `R${String(i).padStart(3, "0")}`;

    const row = document.createElement("div");
    row.className = "req-book-row";
    row.dataset.bookId = id;

    row.innerHTML = `
      <input class="req-book-title" placeholder="Title">
      <input class="req-book-author" placeholder="Author (optional)">
      <input class="req-book-specific" placeholder="Specific book (optional)">
      <div class="inline-search-grid hidden"></div>
    `;

    wrap.appendChild(row);
  }

  while (wrap.children.length > count) {
    wrap.lastElementChild.remove();
  }
}

/* ==============================
   ENSURE PRICE BOX
================================ */
function ensurePriceBox(row) {
  let priceBox = row.querySelector(".price-box");
  if (!priceBox) {
    priceBox = document.createElement("div");
    priceBox.className = "price-box request-price-box";
    priceBox.dataset.bookId = row.dataset.bookId;
    priceBox.dataset.price = "1";
    priceBox.dataset.type = "book";

    priceBox.innerHTML = `
      RM1 / book
      <img src="${CART_ICON}" data-book-id="${row.dataset.bookId}" class="cart-icon">
    `;

    row.appendChild(priceBox);
  }
  return priceBox;
}

/* ==============================
   LIVE SEARCH (MERGED)
================================ */
document.addEventListener("input", e => {
  const row = e.target.closest(".req-book-row");
  if (!row) return;

  const title = row.querySelector(".req-book-title").value.trim();
  const author = row.querySelector(".req-book-author").value.trim();
  const specific = row.querySelector(".req-book-specific").value.trim();

  const grid = row.querySelector(".inline-search-grid");
  const priceBox = ensurePriceBox(row);

  priceBox.dataset.title = title;
  priceBox.dataset.author = author;
  priceBox.dataset.specific = specific;

  grid.innerHTML = "";
  grid.classList.add("hidden");

  if (!title) return;

  const results = searchBooks([title, author, specific].join(" "));

  /* ===== NO RESULTS ===== */
  if (!results.length) {
    grid.classList.remove("hidden");
    grid.innerHTML = `
      <div style="grid-column:1/-1;opacity:.7">
        No search results found.<br>
        Choose request type:
        <div>
          <label><input type="radio" name="req-${row.dataset.bookId}" value="book" checked> Book</label>
          <label><input type="radio" name="req-${row.dataset.bookId}" value="series"> Series</label>
        </div>
      </div>
    `;
    setRequestType(priceBox, row.dataset.bookId, "book");
    return;
  }

  /* ===== RESULTS FOUND ===== */
  grid.classList.remove("hidden");

  results.forEach(book => {
    const item = document.createElement("div");
    item.className = "book-thumb";

    const isSet = Number(book.SetQtty) > 1;
    const label = isSet ? "/set" : "/book";

    item.innerHTML = `
      <img src="${book.img}" loading="lazy">
      <div>RM${Number(book.price).toFixed(2)}${label}</div>
    `;

    item.addEventListener("click", () => {
      row.querySelector(".req-book-title").value = book.title;

      priceBox.dataset.bookId = book.id;
      priceBox.dataset.price = Number(book.price).toFixed(2);
      priceBox.dataset.type = isSet ? "series" : "book";

      priceBox.innerHTML = `
        RM${Number(book.price).toFixed(2)}${label}
        <img src="${CART_ICON}" data-book-id="${book.id}" class="cart-icon">
      `;

      grid.innerHTML = "";
      grid.classList.add("hidden");

      if (typeof syncCartIcons === "function") syncCartIcons();
    });

    grid.appendChild(item);
  });
});

/* ==============================
   RADIO HANDLER
================================ */
document.addEventListener("change", e => {
  if (!e.target.matches("input[type=radio][name^='req-']")) return;

  const row = e.target.closest(".req-book-row");
  const priceBox = ensurePriceBox(row);

  setRequestType(priceBox, row.dataset.bookId, e.target.value);
});

/* ==============================
   PRICE SWITCHER
================================ */
function setRequestType(priceBox, id, type) {
  priceBox.dataset.bookId = id;

  if (type === "series") {
    priceBox.dataset.price = "4";
    priceBox.dataset.type = "series";
    priceBox.innerHTML = `
      RM4 / set
      <img src="${CART_ICON}" data-book-id="${id}" class="cart-icon">
    `;
  } else {
    priceBox.dataset.price = "1";
    priceBox.dataset.type = "book";
    priceBox.innerHTML = `
      RM1 / book
      <img src="${CART_ICON}" data-book-id="${id}" class="cart-icon">
    `;
  }

  if (typeof syncCartIcons === "function") syncCartIcons();
}

/* ==============================
   RESET
================================ */
document.addEventListener("click", e => {
  if (e.target.id === "resetBooks") {
    document.getElementById("bookCount").value = 1;
    const wrap = document.getElementById("bookTitleInputs");
    [...wrap.children].slice(1).forEach(r => r.remove());
  }
});
