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

function renderBooks(containerId, jsonUrl) {
  fetch(jsonUrl)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById(containerId);
      container.innerHTML = "";

      data.forEach((book, i) => {
        const title = book["Book Title"] || "Untitled";
        const img   = book["Link"] || "";
        const price = book.price || 4;

        const div = document.createElement("div");
        div.className = "book-card";

        div.innerHTML = `
          <img src="${img}" class="book-img">
          <div class="book-title">${title}</div>
          <div class="price">
            RM${price}/set
            <img class="cart-icon"
              data-title="${title}"
              data-price="${price}"
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjTsrBEOnV55lpyn2qOEcjDpsePZokQmZ-tQzYH5EHuXOOwNYJbrif6cohUTPCb6OMfol1HNUhHee19v70YOhqOBRUhzaKxZ_yycwoPReWbASOxS_y7m1vuJIHizFzHzgqUWf9C8LCnTq3NrW35-C_dYi8e_zZA-VrZ2vYRtaLgagu2aGsFIakxfWJLjo0_/s3500/pink%20cart.png">
          </div>
        `;

        container.appendChild(div);
      });
    })
    .catch(err => console.error("JSON load error:", err));
}
