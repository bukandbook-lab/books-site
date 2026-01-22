
/* =========================================================
   RENDER IMAGE GRID (6 COLUMNS, COMPACT)
========================================================= */
function renderBooks(tabId, books) {
  const container = document.getElementById(tabId);
  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "image-grid";

  books.forEach(book => {

    const bookId = book.id || book.ID || book["Book ID"];
    if (!bookId) return;

    const normalized = {
      id: bookId,
      title: book.title || book["Book Title"] || "Untitled",
      SetQtty: book.qtty || book.NoofBooks || book["No. of Books"],
      img: book.image || book.Link || "",
      price: Number(book.price || book["Price"] || 0),
      video:
        book["Youtube ID"] ||
        book.youtube ||
        book.video ||
        null,
      category: tabId
    };

    BOOK_REGISTRY[bookId] = normalized;

    const item = document.createElement("div");
    item.className = "book-thumb";

    item.innerHTML = `
      <img
        src="${normalized.img}"
        class="grid-book-img popup-trigger"
        data-book-id="${normalized.id}"
      >

     <img
  src="${CART_ICON}"
  class="cart-icon"
  data-book-id="${normalized.id}"
  data-title="${normalized.title}"
  data-price="${normalized.price}"
  data-setqtty="${normalized.SetQtty || 0}"
>
    `;

    grid.appendChild(item);
  });

  container.appendChild(grid);
}

/* =========================================================
   AUTO LOAD DEFAULT TAB
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  loadBooks("BeginningReader");
});
