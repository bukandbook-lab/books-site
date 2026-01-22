function loadBooks(tabId) {
  const container = document.getElementById(tabId);
  if (!container) return;

  container.innerHTML = "";

  const books = ALL_BOOKS[tabId];
  if (!Array.isArray(books)) {
    console.warn("No books for tab:", tabId);
    return;
  }

  const grid = document.createElement("div");
  grid.className = "image-grid";

  books.forEach(book => {
    if (!book.id) return;

    const normalized = {
      id: book.id,
      title: book.title || "Untitled",
      SetQtty: book.qtty || book.NoofBooks || 0,
      img: book.image || book.Link || "",
      price: Number(book.price || 0),
      video: book.youtube || book.video || null,
      category: tabId
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
