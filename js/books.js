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
}
