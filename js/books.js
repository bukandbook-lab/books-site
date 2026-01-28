function loadBooks(tabId) {
  // hide See More first
  const seeMoreBox = document.getElementById("seeMoreContainer");
  if (seeMoreBox) seeMoreBox.style.display = "none";

  const container = document.getElementById(tabId);
  if (!container) return;

  const primaryBooks = ALL_BOOKS[tabId] || [];
  const taggedBooks = [];

  // 🔁 collect tagged books from other categories
  Object.values(BOOK_REGISTRY).forEach(book => {
    if (
      book.category !== tabId &&
      Array.isArray(book.tags) &&
      book.tags.includes(tabId)
    ) {
      taggedBooks.push(book);
    }
  });

  // 🔥 merge: primary first, tagged last
  const combinedBooks = [
    ...primaryBooks.map(b => ({ ...b, _source: "primary" })),
    ...taggedBooks.map(b => ({ ...b, _source: "tag" }))
  ];

  // guard
  if (!Array.isArray(combinedBooks) || combinedBooks.length === 0) {
    container.innerHTML = `<p style="padding:16px">No books found.</p>`;
    return;
  }

  // clear container
  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "image-grid";

  combinedBooks.forEach(book => {
    const id = book.id || book.ID || book["Book ID"];
    if (!id) return;

    const normalized = {
      id,
      title: book.title || book["Book Title"] || "Untitled",
      img: book.image || book.Link || book.img || "",
      price: Number(book.price || book["Price"] || 0),
      SetQtty: book.qtty || book["No. of Books"] || 0,
      video: book["Youtube ID"] || book.video || null
    };

    const item = document.createElement("div");
    item.className = "book-thumb";

    // optional visual hint for tagged books
    if (book._source === "tag") {
      item.classList.add("tagged-book");
    }

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

  // 🔥 INIT SEE MORE AFTER RENDER
  applySeeMore(grid);
}
