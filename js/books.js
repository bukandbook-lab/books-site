function loadBooks(tabId) {
  const container = document.getElementById(tabId);
  if (!container) return;

  const books = ALL_BOOKS[tabId];

  // guard log
    if (!Array.isArray(books)) {
    console.warn("No books for tab:", tabId, books);
    return;
  }

  // Clear only book containers
  container.innerHTML = "";

  if (!Array.isArray(books) || books.length === 0) {
    container.innerHTML = `<p style="padding:16px">No books found.</p>`;
    return;
  }

  const grid = document.createElement("div");
  grid.className = "image-grid";

  books.forEach(book => {
    const id = book.id || book.ID || book["Book ID"];
    if (!id) return;

    const normalized = {
      id,
      title: book.title || book["Book Title"] || "Untitled",
      img: book.image || book.Link || "",
      price: Number(book.price || book["Price"] || 0),
      SetQtty: book.qtty || book["No. of Books"] || 0,
      video: book["Youtube ID"] || book.youtube || book.video || null
    };

   
    const item = document.createElement("div");
    item.className = "book-thumb";

    item.innerHTML = `
    <div class="skeleton"></div>
      <img
        src="${normalized.img}"
        class="grid-book-img popup-trigger"
        loading="lazy" 
        data-book-id="${normalized.id}"
      >
      <img
        src="${CART_ICON}"
        class="cart-icon"
        loading="lazy" 
        data-book-id="${normalized.id}"
        data-title="${normalized.title}"
        data-price="${normalized.price}"
        data-setqtty="${normalized.SetQtty}"
      >
    `;

    grid.appendChild(item);
  });

  container.appendChild(grid);

/* 🔥 INIT SEE MORE */
applySeeMore(grid);

}

/* =====================================
   SEE MORE SYSTEM (FINAL)
===================================== */

const SEE_MORE_BATCH = 50;
let currentVisible = 0;
let currentGrid = null;

/* =====================================
   INIT SEE MORE FOR A GRID
===================================== */
function applySeeMore(grid) {
  if (!grid) return;

  const items = [...grid.querySelectorAll(".book-thumb")];
  currentGrid = grid;
  currentVisible = SEE_MORE_BATCH;

  // hide items beyond first batch
  items.forEach((item, i) => {
    item.style.display = i < SEE_MORE_BATCH ? "" : "none";
  });

  updateSeeMoreText(items.length);
}

/* =====================================
   UPDATE SEE MORE TEXT + VISIBILITY
===================================== */
function updateSeeMoreText(totalItems) {
  const btnBox = document.getElementById("seeMoreContainer");
  const btn = document.getElementById("seeMoreBtn");
  if (!btnBox || !btn) return;

  const remaining = totalItems - currentVisible;

  if (remaining <= 0) {
    btnBox.style.display = "none";
    return;
  }

  btnBox.style.display = "block";
  btn.textContent = `---------- See ${Math.min(SEE_MORE_BATCH, remaining)} more books ----------`;
}

/* =====================================
   SEE MORE CLICK HANDLER
===================================== */
document.addEventListener("click", e => {
  if (e.target.id !== "seeMoreBtn") return;
  if (!currentGrid) return;

  const items = [...currentGrid.querySelectorAll(".book-thumb")];
  const nextVisible = currentVisible + SEE_MORE_BATCH;

  items.forEach((item, i) => {
    if (i < nextVisible) item.style.display = "";
  });

  currentVisible = nextVisible;

  updateSeeMoreText(items.length);
});
