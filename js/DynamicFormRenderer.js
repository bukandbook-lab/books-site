/* ==============================
   REQUEST BOOK ENTRY POINT
================================ */
document.addEventListener("DOMContentLoaded", () => {
  initRequestBook();
});

function initRequestBook() {
  const radios = document.querySelectorAll("input[name='requestType']");
  radios.forEach(r =>
    r.addEventListener("change", e => {
      renderRequestForm(e.target.value);
    })
  );

  renderRequestForm("single"); // default
}

/* ==============================
   Form renderers
================================ */
function renderRequestForm(type) {
  const container = document.getElementById("requestFormContainer");
  if (!container) return;

  if (type === "single") {
    container.innerHTML = `
      <input id="reqTitle" placeholder="Book title">
      <input id="reqAuthor" placeholder="Author (optional)">

      <div class="price-box request-add" data-price="1">
        RM1 / book 🛒
      </div>
    `;
  }

  if (type === "multiple") {
    renderMultipleForm(container);
  }

  if (type === "series") {
    container.innerHTML = `
      <input id="reqSeries" placeholder="Series name">
      <input id="reqAuthor" placeholder="Author (optional)">

      <div class="price-box request-add" data-price="4">
        RM4 / set 🛒
      </div>
    `;
  }
}

/* ==============================
   Form renderers - Single Title
================================ */
function renderRequestForm(type) {
  const container = document.getElementById("requestFormContainer");
  if (!container) return;

  if (type === "single") {
    container.innerHTML = `
      <input id="reqTitle" placeholder="Book title">
      <input id="reqAuthor" placeholder="Author (optional)">

      <div class="price-box request-add" data-price="1">
        RM1 / book 🛒
      </div>
    `;
  }

  if (type === "multiple") {
    renderMultipleForm(container);
  }

  if (type === "series") {
    container.innerHTML = `
      <input id="reqSeries" placeholder="Series name">
      <input id="reqAuthor" placeholder="Author (optional)">

      <div class="price-box request-add" data-price="4">
        RM4 / set 🛒
      </div>
    `;
  }
}

/* ==============================
   Form renderers - Multiple titles
================================ */
function renderMultipleForm(container) {
  container.innerHTML = `
    <input type="number" id="multiCount" min="1" value="1">
    <div id="multiInputs"></div>

    <input id="reqAuthor" placeholder="Author (optional)">

    <div class="price-box request-add" data-price="1">
      RM1 / book 🛒
    </div>
  `;

  updateMultiInputs(1);

  document.getElementById("multiCount")
    .addEventListener("input", e => {
      updateMultiInputs(+e.target.value);
    });
}

function updateMultiInputs(count) {
  const box = document.getElementById("multiInputs");
  box.innerHTML = "";
  for (let i = 0; i < count; i++) {
    box.innerHTML += `<input placeholder="Book title ${i + 1}">`;
  }
}

/* ==============================
   Click handler
================================ */
document.addEventListener("click", e => {
  const btn = e.target.closest(".request-add");
  if (!btn) return;

  const price = btn.dataset.price;

  handleRequestAdd(price);
});
/* ==============================
   search → fallback → cart
================================ */

function handleRequestAdd(price) {
  const type = document.querySelector("input[name='requestType']:checked").value;

  if (type === "single") {
    processSingle(price);
  }
  if (type === "multiple") {
    processMultiple(price);
  }
  if (type === "series") {
    processSeries(price);
  }
}
/* ==============================
   Single title flow
================================ */
function processSingle(price) {
  const title = document.getElementById("reqTitle").value.trim();
  const author = document.getElementById("reqAuthor").value.trim();

  if (!title) return alert("Please enter a title");

  const found = searchBookDatabase(title, author);

  if (found) {
    showSearchResult(found);
  } else {
    const book = createRequestBook(title, price);
    addToCart(book);
  }
}
/* ==============================
   Helpers
================================ */
let requestCounter = 1;

function createRequestBook(title, price) {
  const id = `R${String(requestCounter++).padStart(3, "0")}`;
  return { bookId: id, title, price };
}

