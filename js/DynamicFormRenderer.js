/* ==============================
   DynamicFormRenderer.js — foundation
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("requestFormContainer");
  if (!container) return;

  // render Book section
  renderBookTitleForm(container);

  // render Series section (default 1)
  updateSeriesInputs(1);
});


/* ==============================
   Global state VERY IMPORTANT
================================ */
let requestCounter = 1; // R001, R002...

/* ==============================
   BOOK TITLE FORM
================================ */
function renderBookTitleForm(container) {
  container.innerHTML = `
    <div class="request-row">
      <label>Number of books</label>
      <input
  type="text"
  id="bookCount"
  inputmode="numeric"
  pattern="[0-9]*"
  value="1"
/>

    </div>

    <div id="bookTitleInputs"></div>

  `;

  updateBookInputs(1);

const bookCount = document.getElementById("bookCount");

bookCount.addEventListener("input", e => {
  let val = e.target.value.replace(/\D/g, ""); // digits only

  if (val === "") {
    e.target.value = "";
    return;
  }

  val = Math.max(1, Number(val));
  e.target.value = val;

  updateBookInputs(val);
});


}

/* ==============================
   BOOKS INPUT
================================ */
function updateBookInputs(count) {
  const wrap = document.getElementById("bookTitleInputs");
  if (!wrap) return;

  const existingRows = [...wrap.querySelectorAll(".req-book-row")];

  // ➕ ADD rows
  for (let i = existingRows.length + 1; i <= count; i++) {
    const id = `R${String(i).padStart(3, "0")}`;

    const row = document.createElement("div");
    row.className = "req-book-row";
    row.dataset.bookId = id;

    row.innerHTML = `
      <input
        class="req-book-title"
        data-book-id="${id}"
        placeholder="Title for Book ${i}"
      >

      <input
        class="req-book-author"
        data-book-id="${id}"
        placeholder="Author for Book ${i} (optional)"
      >

      <div class="price-box request-price-box"
           data-book-id="${id}"
           data-title=""
           data-author=""
           data-price="1">
        RM1 / book
        <img src="${CART_ICON}" data-book-id="${id}" class="cart-icon">
        
          <img src="${CLOSE_ICON}"
       class="remove-request"
       data-book-id="${id}">
      </div>
    `;

    wrap.appendChild(row);
  }

  // ➖ REMOVE rows
  while (wrap.children.length > count) {
    wrap.removeChild(wrap.lastElementChild);
  }
}

/* ==============================
   SERIES INPUT
================================ */
function updateSeriesInputs(count) {
  const wrap = document.getElementById("seriesInputs");
  if (!wrap) return;

  while (wrap.children.length < count) {
    const i = wrap.children.length + 1;
    const id = `S${String(i).padStart(3, "0")}`;

    const row = document.createElement("div");
    row.className = "req-series-row";

    row.innerHTML = `
      <input class="req-series-title"
             placeholder="Title for Series ${i}">

      <input class="req-series-author"
             placeholder="Author for Series ${i}(optional)">

      <div class="price-box request-price-box"
           data-book-id="${id}"
           data-title=""
           data-price="4">
        RM4 / set
        <img src="${CART_ICON}" class="cart-icon">
      </div>
    `;

    wrap.appendChild(row);
  }

  while (wrap.children.length > count) {
    wrap.removeChild(wrap.lastElementChild);
  }
}


/* ==============================
   update book-title live as user types
================================ */
document.addEventListener("input", e => {
  const titleInput = e.target.closest(".req-book-title");
  if (!titleInput) return;

  const row = titleInput.closest(".req-book-row");
  const priceBox = row.querySelector(".price-box");

  priceBox.dataset.title = titleInput.value.trim();
});


/* ==============================
   update book-author live as user types
================================ */
document.addEventListener("input", e => {
  const authorInput = e.target.closest(".req-book-author");
  if (!authorInput) return;

  const row = authorInput.closest(".req-book-row");
  const priceBox = row.querySelector(".price-box");

  priceBox.dataset.author = authorInput.value.trim();
});

/* ==============================
   update series-title live as user types
================================ */
document.addEventListener("input", e => {
  const titleInput = e.target.closest(".req-series-title");
  if (!titleInput) return;

  const row = titleInput.closest(".req-series-row");
  const priceBox = row.querySelector(".price-box");

  priceBox.dataset.title = titleInput.value.trim();
});


/* ==============================
   update series-author live as user types
================================ */
document.addEventListener("input", e => {
  const authorInput = e.target.closest(".req-series-author");
  if (!authorInput) return;

  const row = authorInput.closest(".req-series-row");
  const priceBox = row.querySelector(".price-box");

  priceBox.dataset.author = authorInput.value.trim();
});
/* ==============================
   close icon to remove book item
================================ */
document.addEventListener("click", e => {
  const btn = e.target.closest(".remove-request");
  if (!btn) return;

  e.preventDefault();
  e.stopPropagation();

  const row = btn.closest(".req-book-row");
  row?.remove();
});
/* ==============================
   close icon to remove series item
================================ */
document.addEventListener("click", e => {
  const btn = e.target.closest(".remove-request");
  if (!btn) return;

  e.preventDefault();
  e.stopPropagation();

  const row = btn.closest(".req-series-row");
  row?.remove();
});
