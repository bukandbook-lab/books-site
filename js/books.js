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

const IMAGE_ONLY_TABS = ["Islamic", "Melayu", "Jawi", "Comic"];

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
   Normal tabs (BeginningReader etc.)
========================================================= */

function renderBookCards(tabId, books) {
  const container = document.getElementById(tabId);
  container.innerHTML = "";

  const table = document.createElement("table");
  table.className = "book-table";

  let row;

  books.forEach((book, i) => {
    if (i % 2 === 0) {
      row = document.createElement("tr");
      table.appendChild(row);
    }

    const title = book["Book Title"] || "Untitled";
    const img   = book.Link || "";
    const price = book.price || DEFAULT_PRICE;

    const td = document.createElement("td");
    td.innerHTML = `
      <img src="${img}" class="book-img">

      <div class="book-title">${title}</div>
      
      <div class="Price">
        <b>RM${price}/set</b>
        <img class="cart-icon"
             data-id="${id}"
             data-title="${title}"
             data-price="${price}"
             src="${CART_ICON}"
             width="25">
      </div>

<button class="watch-video-btn">Watch Video</button>

<div class="video-box"
     data-youtube="${book.video || ""}"
     style="display:none;">
</div>

    `;

    row.appendChild(td);
  });

  container.appendChild(table);
}
/* =========================================================
   Image-only tabs (Islamic, Melayu, Jawi, Comic)
========================================================= */
function renderImageGrid(tabId, books) {
  const container = document.getElementById(tabId);
  container.innerHTML = "";

  const table = document.createElement("table");
  table.className = "image-grid";

  let row;

  books.forEach((book, i) => {
    if (i % 5 === 0) {
      row = document.createElement("tr");
      table.appendChild(row);
    }

    const img   = book.Link || "";
    const title = book["Book Title"] || "Untitled";
    const price = book.price || DEFAULT_PRICE;

    const td = document.createElement("td");
    td.innerHTML = `
      <img class="comic-thumb"
           src="${img}"
           data-title="${title}"
           data-img="${img}"
           data-price="${price}">
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
