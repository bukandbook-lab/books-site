/* =========================================================
   BOOK DATA SOURCES (RAW GitHub URLs ONLY)
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
   LOAD BOOKS FOR A TAB
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
    .then(data => {
      if (IMAGE_ONLY_TABS.includes(tabId)) {
        renderImageGrid(tabId, data);
      } else {
        renderBookCards(tabId, data);
      }
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = "<p>Failed to load data.</p>";
    });
}

/* =========================================================
   ALL tabs 
========================================================= */
function renderBooks(tabId, books) {
  const container = document.getElementById(tabId);
  container.innerHTML = "";

  const table = document.createElement("table");
  table.className = "image-grid";

  let row;

  books.forEach(book => {

    // ❗ HARD REQUIREMENT
    if (!book.id) {
      console.error("Missing book.id", book);
      return;
    }

    const normalized = {
      id: book.id,
      title: book.title || book["Book Title"] || "Untitled",
      img: book.image || book.Link || "",
      price: book.price,
      video: book.video || null,
      category: tabId
    };

    // 🔐 REGISTER BOOK
    BOOK_REGISTRY[normalized.id] = normalized;

    if (Object.keys(BOOK_REGISTRY).length % 5 === 1) {
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
  });

  container.appendChild(table);
}

/* =========================================================
   AUTO LOAD FIRST TAB
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  loadBooks("BeginningReader");
});
