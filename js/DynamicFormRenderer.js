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
      <label>Number of request</label>
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
      <br/>
      ${i}. 
      
<div>  
<label>
  <input
    type="radio"
    name="requestType-${id}"
    data-book-id="${id}"
    value="book"
    checked
  > Book
</label>

<label>
  <input
    type="radio"
    name="requestType-${id}"
    data-book-id="${id}"
    value="series"
  > Series
</label>
</div>

      <input class="req-book-title" data-book-id="${id}" placeholder="Enter exact title for Book/Series">
      ${i === 1 ? "" : `
        <img src="${CLOSE_ICON}" class="remove-request" data-book-id="${id}">
      `}
      <br/>
      <input class="req-book-author" data-book-id="${id}" placeholder="Author's name (optional)">
      <input class="req-book-specific" data-book-id="${id}" placeholder="Specific book title for Series(if any)">


      <div class="inline-search-grid"></div>

    `;

    wrap.appendChild(row);
  }

  while (wrap.children.length > count) {
    wrap.lastElementChild.remove();
  }
}


/* ==============================
   set Request Type
================================ */
function setRequestType(priceBox, id, type) {
  if (!priceBox) return;

  priceBox.dataset.bookId = id;

  if (type === "series") {
    priceBox.dataset.price = "4";
    priceBox.dataset.type = "series";
    priceBox.innerHTML = `
      Request at RM4 / set
      <img src="${CART_ICON}" data-book-id="${id}" class="cart-icon">
    `;
  } else {
    priceBox.dataset.price = "1";
    priceBox.dataset.type = "book";
    priceBox.innerHTML = `
      Request at RM1 / book
      <img src="${CART_ICON}" data-book-id="${id}" class="cart-icon">
    `;
  }

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
   helper to ensure price-box exists
================================ */
function ensurePriceBox(row) {
  let priceBox = row.querySelector(".request-price-box");
  if (!priceBox) {
    priceBox = document.createElement("div");
    priceBox.className = "price-box request-price-box hidden";
    priceBox.dataset.bookId = row.dataset.bookId;
    priceBox.dataset.price = "1";
    priceBox.dataset.type = "book";

    priceBox.innerHTML = `
      Request at RM1 / book
      <img src="${CART_ICON}" data-book-id="${row.dataset.bookId}" class="cart-icon">
    `;

    row.appendChild(priceBox);
  }
  return priceBox;
}

/* ==============================
   radio handler
================================ */
document.addEventListener("change", e => {
  if (e.target.type !== "radio") return;

  const row = e.target.closest(".req-book-row");
  if (!row) return;

  const priceBox = ensurePriceBox(row);
  setRequestType(priceBox, row.dataset.bookId, e.target.value);
});


/* ==============================
   LIVE SEARCH ON BOOK TITLE AUTHOR AND SERIS
================================ */
document.addEventListener("input", e => {
  const row = e.target.closest(".req-book-row");
  if (!row) return;

  if (
    e.target.matches(".req-book-title") ||
    e.target.matches(".req-book-author") ||
    e.target.matches(".req-book-specific")
  ) {
    LiveSearch(row);
  }
});
/* ==============================
   search helpers
================================ */
function searchBooksByAuthor(author) {
  if (!author || !window.BOOK_REGISTRY) return [];

  const words = normalizeWords(author);

  return Object.values(BOOK_REGISTRY).filter(book => {
    if (!book.Author) return false;
    const authorWords = normalizeWords(book.Author);
    return words.every(w => authorWords.some(a => a.includes(w)));
  });
}

function searchBooksByTitle(title) {
  if (!title || !window.BOOK_REGISTRY) return [];

  const words = normalizeWords(title);

  return Object.values(BOOK_REGISTRY).filter(book => {
    const text = normalizeWords(book.title || "");
    return words.every(w => text.some(t => t.includes(w)));
  });
}

function searchBooksBySeries(series) {
  if (!series || !window.BOOK_REGISTRY) return [];

  const words = normalizeWords(series);

  return Object.values(BOOK_REGISTRY).filter(book => {
    if (!book.Series) return false;
    const seriesWords = normalizeWords(book.Series);
    return words.every(w => seriesWords.some(s => s.includes(w)));
  });
}
  /* ==============================
     add filter helper
  ================================= */
function filterByAuthor(list, author) {
  const words = normalizeWords(author);

  return list.filter(book => {
    if (!book.Author) return false;
    const authorWords = normalizeWords(book.Author);
    return words.every(w => authorWords.some(a => a.includes(w)));
  });
}

function filterByTitle(list, title) {
  const words = normalizeWords(title);

  return list.filter(book => {
    const titleWords = normalizeWords(book.title || "");
    return words.every(w => titleWords.some(t => t.includes(w)));
  });
}

function filterBySeries(list, series) {
  const words = normalizeWords(series);

  return list.filter(book => {
    if (!book.Series) return false;
    const seriesWords = normalizeWords(book.Series);
    return words.every(w => seriesWords.some(s => s.includes(w)));
  });
}
/* ==============================
   handler for Yes, proceed with request
================================ */
document.addEventListener("change", e => {
  if (e.target.value === "yesproceed") {
    const row = e.target.closest(".req-book-row");
    const priceBox = row.querySelector(".request-price-box");
    priceBox.classList.remove("hidden"); // show request price box
    setRequestType(priceBox, row.dataset.bookId, "book"); // set default

   const grid = row.querySelector(".inline-search-grid");
   if (grid) grid.classList.add("hidden"); // hide search results

     
   const mesage = row.querySelector(".search-found-message");
   if (mesage) mesage.classList.add("hidden"); // hide search results

  }
});

/* ==============================
   function live search
================================ */
function LiveSearch(row) {
  hideSeeMore(); 
   
  const titleInput = row.querySelector(".req-book-title");
  const authorInput = row.querySelector(".req-book-author");
  const specificInput = row.querySelector(".req-book-specific");

  const priceBox = ensurePriceBox(row);            // request-level
  const grid = ensureInlineGrid(row);

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const specific = specificInput.value.trim();

  // Always hide request price-box by default
  priceBox.classList.add("hidden");

  // Clear dataset
  priceBox.dataset.title = title;
  priceBox.dataset.author = author;
  priceBox.dataset.specific = specific;

  // Clear grid
  grid.innerHTML = "";
  grid.classList.add("hidden");

  if (!title && !author && !specific) {
    // No input at all → show default request price
    setRequestType(priceBox, row.dataset.bookId, "book");
    priceBox.classList.remove("hidden");
    return;
  }

  // Start with full dataset
  let results = Object.values(BOOK_REGISTRY);

  // Apply filters
  if (author) results = filterByAuthor(results, author);
  if (title) results = filterByTitle(results, title);
  if (specific) results = filterBySeries(results, specific);


   if (results.length) {
  // Hide row-level request price-box
  priceBox.classList.add("hidden");

  grid.classList.remove("hidden");

  // ✅ Search results exist → hide request price-box
  priceBox.classList.add("hidden");
  grid.classList.remove("hidden");


/* 🔔 Message */
const msg = document.createElement("div");
msg.className = "search-found-message";
msg.style.gridColumn = "1 / -1";
msg.style.marginBottom = "6px";
msg.style.fontWeight = "500";
msg.innerHTML = `The book is found as below. Not the book?
<label>
  <input
    type="radio"
    name="requestType-${row.dataset.bookId}"
    data-book-id="${row.dataset.bookId}"
    value="yesproceed"
  > Yes
</label>`;

grid.appendChild(msg);

/* 📚 Results */
  results.forEach(book => {
    const div = document.createElement("div");
    div.className = "book-thumb";

    const isSetBook = Number(book.SetQtty) > 1;
    const priceLabel = isSetBook ? "/set" : "/book";

    div.innerHTML = `
      <div class="book-bg" style="background-image:url('${book.img}')"></div>
      <img
    src="${book.img}"
    class="grid-book-img popup-trigger"
    loading="lazy"
    data-book-id="${book.id}"
      >


      <div class="price-box result-price-box"
        data-book-id="${book.id}"
        data-title="${book.title}"
        data-price="${Number(book.price).toFixed(2)}"
        data-setqtty="${book.SetQtty || 1}"
      >
        RM${Number(book.price).toFixed(2)}${priceLabel}
        <img src="${CART_ICON}" data-book-id="${book.id}" class="cart-icon">
      </div>
    `;

    grid.appendChild(div);
  });
        // Append message & results...
} else {
  // No results → show request price-box
  priceBox.classList.remove("hidden");
  setRequestType(priceBox, row.dataset.bookId, "book");
  hideSeeMore();

}

  if (typeof applySeeMore === "function") {
    applySeeMore(grid);
    moveSeeMoreAfter(grid);
  }

  if (typeof syncCartIcons === "function") {
    syncCartIcons();
  }
}

