
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

/* =====================================
   RADIO HANDLER
===================================== */
document.querySelectorAll("input[name='requestType']")
  .forEach(r => {
    r.addEventListener("change", e => {
      renderRequestForm(e.target.value);
    });
  });

renderRequestForm("single");



/* =====================================
   MULTIPLE TITLES INPUT GENERATOR
===================================== */

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
/* =====================================
   Helper: find existing book
===================================== */
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

