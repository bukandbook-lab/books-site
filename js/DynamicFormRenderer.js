/* ==============================
   Dynamic Form Renderer
================================ */
function renderRequestForm(type) {
  const box = document.getElementById("requestForm");
  if (!box) return;

  if (type === "single") {
    box.innerHTML = `
      <input id="reqTitle" placeholder="Book title">
      <input id="reqAuthor" placeholder="Author (optional)">

      <div class="price-box" data-mode="single">
        RM1 / book
        <img class="cart-icon">
      </div>
    `;
  }

  if (type === "multiple") {
    box.innerHTML = `
      <input type="number" id="reqCount" min="1" value="1">
      <div id="multiTitles"></div>
      <input id="reqAuthor" placeholder="Author (optional)">

      <div class="price-box" data-mode="multiple">
        RM1 / book
        <img class="cart-icon">
      </div>
    `;
    updateMultiInputs(1);
  }

  if (type === "series") {
    box.innerHTML = `
      <input id="reqSeries" placeholder="Series name">
      <input id="reqAuthor" placeholder="Author (optional)">

      <div class="price-box" data-mode="series">
        RM4 / set
        <img class="cart-icon">
      </div>
    `;
  }
}

/* ==============================
   Radio handler:
================================ */
document.querySelectorAll("input[name='requestType']")
  .forEach(r => {
    r.addEventListener("change", e => {
      renderRequestForm(e.target.value);
    });
  });

renderRequestForm("single");

/* ==============================
   STEP 3: Multiple Titles Input Generator
================================ */
function updateMultiInputs(count) {
  const box = document.getElementById("multiTitles");
  box.innerHTML = "";

  for (let i = 0; i < count; i++) {
    box.innerHTML += `
      <input class="multi-title" placeholder="Book title ${i + 1}">
    `;
  }
}

document.addEventListener("input", e => {
  if (e.target.id === "reqCount") {
    updateMultiInputs(Number(e.target.value));
  }
});


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
  STEP 4: SEARCH OR CREATE LOGIC (KEY PART)
================================ */
function findExistingBook(title, author) {
  const key = title.toLowerCase();

  return Object.values(BOOK_REGISTRY).find(b => {
    if (!b.title) return false;
    if (!b.title.toLowerCase().includes(key)) return false;

    if (author) {
      return (b.Author || "").toLowerCase().includes(author.toLowerCase());
    }
    return true;
  });
}

/* ==============================
   STEP 5: Generate Request Book ID
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
   STEP 6: Add Request Books to Cart
================================ */
function handleSingleRequest() {
  const title = document.getElementById("reqTitle").value.trim();
  const author = document.getElementById("reqAuthor").value.trim();

  if (!title) return alert("Please enter a title");

  const found = findExistingBook(title, author);

  if (found) {
    openSearchResult(found.title);
    return;
  }

  const id = generateRequestId();

  const virtualBook = {
    id,
    title,
    price: 1,
    SetQtty: 1,
    isRequest: true
  };

  cart.items.set(id, virtualBook);
  openCart();
}
function handleMultipleRequest() {
  const titles = [...document.querySelectorAll(".multi-title")]
    .map(i => i.value.trim())
    .filter(Boolean);

  titles.forEach(title => {
    const found = findExistingBook(title);
    if (found) {
      openSearchResult(found.title);
      return;
    }

    const id = generateRequestId();
    cart.items.set(id, {
      id,
      title,
      price: 1,
      SetQtty: 1,
      isRequest: true
    });
  });

  openCart();
}
function handleSeriesRequest() {
  const series = document.getElementById("reqSeries").value.trim();
  const author = document.getElementById("reqAuthor").value.trim();

  if (!series) return alert("Please enter series");

  const found = findExistingBook(series, author);
  if (found) {
    openSearchResult(found.Series || found.title);
    return;
  }

  const id = generateRequestId();
  cart.items.set(id, {
    id,
    title: series + " (Series Request)",
    price: 4,
    SetQtty: 1,
    isRequest: true
  });

  openCart();
}

/* ==============================
   Price-Box Click Dispatcher
================================ */
document.addEventListener("click", e => {
  const box = e.target.closest(".price-box");
  if (!box) return;

  const mode = box.dataset.mode;

  if (mode === "single") handleSingleRequest();
  if (mode === "multiple") handleMultipleRequest();
  if (mode === "series") handleSeriesRequest();
});
