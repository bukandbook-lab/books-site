/* =========================================================
   GLOBAL REGISTRY (REQUIRED)
========================================================= */
window.BOOK_REGISTRY = {};

/* =========================================================
   BOOK DATA SOURCES
========================================================= */
const BOOK_SOURCES = {
  BeginningReader: "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/BeginningReaderData.json",
  ChapterBook:     "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/ChapterBookData.json",
  PictureBook:     "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/PictureBookData.json",
  Novel:           "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/NovelData.json",
  Islamic:         "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/islamicdata.json",
  Melayu:          "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/MelayuData.json",
  Jawi:            "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/jawidata.json",
  Comic:           "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/comicdata.json"
};

/* =========================================================
   LOAD BOOKS
========================================================= */
function loadBooks(tabId) {
  const container = document.getElementById(tabId);
  if (!container) return;

  container.innerHTML = "<p>Loading...</p>";

  const url = BOOK_SOURCES[tabId];
  if (!url) {
    container.innerHTML = "<p>No data source.</p>";
    return;
  }

  fetch(url)
    .then(res => res.json())
    .then(data => renderBooks(tabId, data))
    .catch(err => {
      console.error("LOAD ERROR:", err);
      container.innerHTML = "<p>Failed to load data.</p>";
    });
}

/* =========================================================
   RENDER IMAGE GRID (5 COLUMNS)
========================================================= */
function renderBooks(tabId, books) {
  const container = document.getElementById(tabId);
  container.innerHTML = "";

   const grid = document.createElement("div");
   grid.className = "image-grid";


  let row;
  let colCount = 0;

books.forEach(book => {

  const bookId = book.id || book.ID || book["Book ID"];

  if (!bookId) {
    console.error("Missing book ID", book);
    return;
  }

 const normalized = {
  id: bookId,
  title: book.title || book["Book Title"] || "Untitled",
  img: book.image || book.Link || "",
  price: book.price || book["Price"],
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
    src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhXY9v_P8iRSYsYvMxOLOABTK4pixnG9knKgqEalOO2mA41MJh8/s320/cart.png"
    class="cart-icon"
    data-book-id="${normalized.id}"
    data-title="${normalized.title}"
    data-price="${normalized.price}"
  >
`;
grid.appendChild(item);

  });

  container.appendChild(table);
}

/* =========================================================
   AUTO LOAD DEFAULT TAB
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  loadBooks("BeginningReader");
});
