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

  const table = document.createElement("table");
  table.className = "image-grid";

  let row;
  let colCount = 0;

  books.forEach(book => {

const bookId = book.id || book.ID || book["Book ID"];

if (!bookId) {
      console.error("Missing book.id", book);
      return;
    }

    const normalized = {
      id: book.id,
      title: book.title || book["Book Title"] || "Untitled",
      img: book.image || book.Link || "",
      price: book.price || 4,
      video: book.video || null,
      category: tabId
    };

    BOOK_REGISTRY[normalized.id] = normalized;

    if (colCount % 5 === 0) {
      row = document.createElement("tr");
      table.appendChild(row);
    }

    const td = document.createElement("td");
    td.innerHTML = `
      <img
        src="${normalized.img}"
        class="grid-book-img popup-trigger"
        data-book-id="${normalized.id}"
      >
    `;

    row.appendChild(td);
    colCount++;
  });

  container.appendChild(table);
}

/* =========================================================
   AUTO LOAD DEFAULT TAB
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  loadBooks("BeginningReader");
});
