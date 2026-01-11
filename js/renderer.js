const DATA_MAP = {
  BeginningReader: "data/BeginningReaderData.json",
  ChapterBook: "data/ChapterBookData.json",
  PictureBook: "data/PictureBookData.json",
  Novel: "data/NovelData.json",
  Islamic: "data/islamicdata.json",
  Melayu: "data/MelayuData.json",
  Jawi: "data/jawidata.json",
  Comic: "data/comicdata.json"
};

Object.keys(DATA_MAP).forEach(tab => {
  fetch(DATA_MAP[tab])
    .then(r => r.json())
    .then(data => renderBooks(tab, data));
});

function renderBooks(tabId, books) {
  const container = document.getElementById(tabId);
  const table = document.createElement("table");
  const cols = ["Islamic","Melayu","Jawi","Comic"].includes(tabId) ? 5 : 2;

  let row;
  books.forEach((b, i) => {
    if (i % cols === 0) {
      row = document.createElement("tr");
      table.appendChild(row);
    }

    const td = document.createElement("td");
    const bookId = `${tabId}-${i}`;

    td.innerHTML = `
      <img src="${b.image}" width="145">
      <div class="book-title">${b.title}</div>
      ${b.booksNo ? `[${b.booksNo} books]` : ""}
      <div class="Price">
        <b>RM${b.price || DEFAULT_PRICE}/set</b>
        <img class="cart-icon"
             data-id="${bookId}"
             data-title="${b.title}"
             data-price="${b.price || DEFAULT_PRICE}"
             src="${CART_ICON}" width="25">
      </div>
      ${b.youtube ? `
        <button class="watch-video-btn" data-id="${bookId}">Watch Video</button>
        <div class="video-box" data-id="${bookId}" data-youtube="${b.youtube}"></div>
      ` : ""}
    `;

    row.appendChild(td);
  });

  container.appendChild(table);
}
