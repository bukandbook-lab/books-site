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
      <input type="number" id="bookCount" min="1" value="1">
    </div>

    <div id="bookTitleInputs"></div>

    <input id="bookAuthor" placeholder="Author (optional)">

    <div class="price-box request-add" data-price="1">
      RM1 / book
      <img src="${CART_ICON}" class="cart-icon">
    </div>
  `;

  updateBookInputs(1);

  document.getElementById("bookCount")
    .addEventListener("input", e => {
      updateBookInputs(+e.target.value);
    });
}

/* ==============================
   Dynamic input + BookID logic THIS IS THE HEART
================================ */
function updateBookInputs(count) {
  const wrap = document.getElementById("bookTitleInputs");
  wrap.innerHTML = "";

  for (let i = 1; i <= count; i++) {
    const id = `R${String(i).padStart(3, "0")}`;

    wrap.innerHTML += `
      <input
        class="req-book-title"
        data-book-id="${id}"
        placeholder="Book title (${id})"
      >
    `;
  }
}



/* ==============================
   BookID generator
================================ */

/* ==============================
   SERIES FORM
================================ */
function renderSeriesForm(container) {
  container.innerHTML = `
    <input
      id="seriesTitle"
      data-book-id="${generateRequestId()}"
      placeholder="Series title"
    >

    <input id="seriesAuthor" placeholder="Author (optional)">

    <div class="price-box request-add" data-price="4">
      RM4 / set
      <img src="${CART_ICON}" class="cart-icon">
    </div>
  `;
}

/* ==============================
   Inject data into price-box / cart-icon
================================ */
document.addEventListener("click", e => {
  const btn = e.target.closest(".request-add");
  if (!btn) return;

  const type = document.querySelector("input[name='requestType']:checked").value;
  const price = Number(btn.dataset.price);

  if (type === "book") collectBookTitleData(price);
  if (type === "series") collectSeriesData(price);
});

/* ==============================
   Collect Book Title data
================================ */
function collectBookTitleData(price) {
  const titles = document.querySelectorAll(".req-book-title");
  const author = document.getElementById("bookAuthor").value.trim();

  const payload = [];

  titles.forEach(input => {
    if (!input.value.trim()) return;

    payload.push({
      bookId: input.dataset.bookId,
      title: input.value.trim(),
      author,
      price
    });
  });

  console.log("READY FOR CART:", payload);
}

/* ==============================
   Collect Book Title data
================================ */

function collectSeriesData(price) {
  const input = document.getElementById("seriesTitle");
  if (!input.value.trim()) return;

  const payload = {
    bookId: input.dataset.bookId,
    title: input.value.trim(),
    author: document.getElementById("seriesAuthor").value.trim(),
    price
  };

  console.log("READY FOR CART:", payload);
}
