function loadBooks(tabId) {
  const container = document.getElementById(tabId);
  if (!container) return;

  const books = ALL_BOOKS[tabId];

  if (!Array.isArray(books) || books.length === 0) {
    // DO NOT overwrite static tabs
    return;
  }

  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "image-grid";

  books.forEach(book => {
    if (!book.id) return;

    const item = document.createElement("div");
    item.className = "book-thumb";

    item.innerHTML = `
      <img
        src="${book.image || book.Link || ""}"
        class="grid-book-img popup-trigger"
        data-book-id="${book.id}"
      >
      <img
        src="${CART_ICON}"
        class="cart-icon"
        data-book-id="${book.id}"
      >
    `;

    grid.appendChild(item);
  });

  container.appendChild(grid);
}
