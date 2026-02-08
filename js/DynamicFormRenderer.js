/* ==============================
   DynamicFormRenderer.js — foundation
================================ */

document.addEventListener("DOMContentLoaded", () => {
  initRequestBook();
});

/* ==============================
   Global state VERY IMPORTANT
================================ */
let requestCounter = 1; // R001, R002...

/* ==============================
   Init + radio switching
================================ */
function initRequestBook() {
  const radios = document.querySelectorAll("input[name='requestType']");
  radios.forEach(radio => {
    radio.addEventListener("change", e => {
      renderRequestForm(e.target.value);
    });
  });

  renderRequestForm("book"); // default
}

/* ==============================
   Form router
================================ */
function renderRequestForm(type) {
  const box = document.getElementById("requestFormContainer");
  if (!box) return;

  if (type === "book") renderBookTitleForm(box);
  if (type === "series") renderSeriesForm(box);
}
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
   Dynamic input + BookID logic THIS IS THE HEART
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
        placeholder="Book title (${id})"
      >

      <input
        class="req-book-author"
        data-book-id="${id}"
        placeholder="Author (optional)"
      >

      <div class="price-box"
           data-book-id="${id}"
           data-title=""
           data-author=""
           data-price="1">
        RM1 / book
        <img src="${CART_ICON}" data-book-id="${id}" class="cart-icon">
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
   update data-title live as user types
================================ */
document.addEventListener("input", e => {
  const titleInput = e.target.closest(".req-book-title");
  if (!titleInput) return;

  const row = titleInput.closest(".req-book-row");
  const priceBox = row.querySelector(".price-box");

  priceBox.dataset.title = titleInput.value.trim();
});


/* ==============================
   sync author too
================================ */
document.addEventListener("input", e => {
  const authorInput = e.target.closest(".req-book-author");
  if (!authorInput) return;

  const row = authorInput.closest(".req-book-row");
  const priceBox = row.querySelector(".price-box");

  priceBox.dataset.author = authorInput.value.trim();
});
