/* =========================================================
   RENDER BOOKS INTO A TAB
========================================================= */

function renderBooks(tabId, books) {
  const container = document.getElementById(tabId);
  if (!container) return;

  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "image-grid";

  books.forEach(book => {
    if (!book || !book.id) return;

    // 🔒 Normalize once (DO NOT overwrite global registry here)
    const normalized = {
      id: book.id,
      title: book.title || "Untitled",
      img: book.img || "",
      price: Number(book.price || 0),
      SetQtty: book.SetQtty || 0,
      category: tabId
    };

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
      >
    `;

    grid.appendChild(item);
  });

  container.appendChild(grid);

  // 🔄 Sync cart icon state
  if (typeof syncCartIcons === "function") {
    syncCartIcons();
  }
}

/* =========================================================
   LOAD BOOKS FOR TAB (FROM PRELOADED DATA)
========================================================= */

function loadBooks(tabId) {
  const books = window.ALL_BOOKS?.[tabId];
  if (!books) {
    console.warn("No books for tab:", tabId);
    return;
  }
  renderBooks(tabId, books);
}
