function loadBooks(tabId) {
  const container = document.getElementById(tabId);
  if (!container) return;

  const books = ALL_BOOKS[tabId];

  // 🚫 Safety: do nothing if no books
  if (!Array.isArray(books) || books.length === 0) {
    container.innerHTML = "<p>No books available.</p>";
    return;
  }

  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "image-grid";

  books.forEach(book => {
    if (!book.id) return;

    const normalized = {
      id: book.id || book.ID || book["Book ID"],
      title: book.title || book["Book Title"] || "Untitled",
      SetQtty: book.qtty || book.NoofBooks || book["No. of Books"],
      img: book.image || book.Link || "",
      price: Number(book.price || book["Price"] || 0),
      video:
        book["Youtube ID"] ||
        book.youtube ||
        book.video ||
        null,
      category

    };

    BOOK_REGISTRY[normalized.id] = normalized;

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
        data-setqtty="${normalized.SetQtty}"
      >
    `;

    grid.appendChild(item);
  });

  container.appendChild(grid);
}
