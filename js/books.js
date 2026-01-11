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
   CONSTANT CART ICON
========================================================= */

const CART_ICON =
"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjTsrBEOnV55lpyn2qOEcjDpsePZokQmZ-tQzYH5EHuXOOwNYJbrif6cohUTPCb6OMfol1HNUhHee19v70YOhqOBRUhzaKxZ_yycwoPReWbASOxS_y7m1vuJIHizFzHzgqUWf9C8LCnTq3NrW35-C_dYi8e_zZA-VrZ2vYRtaLgagu2aGsFIakxfWJLjo0_/s3500/pink%20cart.png";

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
    .then(data => renderBooks(tabId, data))
    .catch(err => {
      console.error("JSON load error:", err);
      container.innerHTML = "<p>Failed to load data.</p>";
    });
}

/* =========================================================
   RENDER BOOKS (DEFAULT 2-COLUMN LAYOUT)
========================================================= */

function renderBooks(tabId, books) {
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
    const price = book.price || 4;

    const td = document.createElement("td");
    td.innerHTML = `
      <img src="${img}" class="book-img">

      <div class="book-title">${title}</div>

      <div class="price">
        <b>RM${price}/set</b>
        <img class="cart-icon"
             data-title="${title}"
             data-price="${price}"
             src="${CART_ICON}">
      </div>

      <button class="watch-video-btn">Watch Video</button>
      <div class="video-box" data-youtube="${book.video || ""}" style="display:none;"></div>
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
