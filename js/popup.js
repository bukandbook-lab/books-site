let currentBookId = null;

/* =====================================
   OPEN POPUP
===================================== */
document.addEventListener("click", e => {
  const trigger = e.target.closest(".popup-trigger");
  if (!trigger) return;

  openBookPopup(trigger.dataset.bookId);
});

function openBookPopup(bookId) {
  const popup = document.getElementById("BookPopup");
  const book = BOOK_REGISTRY[bookId];
  if (!popup || !book) return;

  popup.dataset.bookId = bookId;
  popup.dataset.category = book.category;

  renderPopup(bookId);
  popup.style.display = "flex";
}

/* =====================================
   RENDER POPUP
===================================== */
function renderPopup(bookId) {
  const book = BOOK_REGISTRY[bookId];
  if (!book) return;

  currentBookId = bookId;

  const isSetBook = Number(book.SetQtty) > 1;
  const priceLabel = isSetBook ? "/set" : "/book";
  const setQtyHTML = isSetBook
    ? `<div class="set-qty"><b>No. of books:</b> ${book.SetQtty} books / set</div>`
    : "";


  document.getElementById("BookPopupContent").innerHTML = `
    <div class="popup-box">

      <img src="${CLOSE_ICON}" class="close-popup" alt="Close">

      <div class="popup-nav left">‹</div>

      <div class="popup-img-wrapper">
        <div class="img-skeleton"></div>
        <img src="${book.img}"
             class="popup-img"
             data-book-id="${bookId}"
             loading="eager">
      </div>


      <div class="popup-nav right">›</div>

      <div class="book-title">${book.title}</div>
      <div><b>Category:</b> ${book.category}</div>
       ${setQtyHTML}

      <div class="price-box"
        data-book-id="${bookId}"
        data-title="${book.title}"
        data-price="${book.price}"
        data-setqtty="${book.SetQtty || 1}">
        RM${book.price} ${priceLabel}
        <img class="cart-icon" src="${CART_ICON}" width="22">
      </div>

      ${book.video ? `
        <button class="watch-video-btn">Watch Video</button>
        <div class="video-box"></div>
      ` : ""}
    </div>
  `;
}
/* =====================================
   AFTER RENDER 
===================================== */
const img = document.querySelector(".popup-img");
const skeleton = document.querySelector(".img-skeleton");

img.onload = () => {
  skeleton.remove();
  img.classList.add("loaded");
};

/* =====================================
   NAVIGATION (CATEGORY AWARE)
===================================== */
document.addEventListener("click", e => {
  if (e.target.closest(".popup-nav.left")) navigatePopup(-1);
  if (e.target.closest(".popup-nav.right")) navigatePopup(1);
});

function navigatePopup(step) {
  const popup = document.getElementById("BookPopup");

  let category = popup.dataset.category;
  let bookId = popup.dataset.bookId;

  let catIndex = CATEGORY_ORDER.indexOf(category);
  let books = ORDERED_BOOKS_BY_CATEGORY[category];
  let index = books.indexOf(bookId);

  if (index === -1) index = 0;
  index += step;

  if (index >= books.length) {
    catIndex = (catIndex + 1) % CATEGORY_ORDER.length;
    books = ORDERED_BOOKS_BY_CATEGORY[CATEGORY_ORDER[catIndex]];
    index = 0;
  }

  if (index < 0) {
    catIndex = (catIndex - 1 + CATEGORY_ORDER.length) % CATEGORY_ORDER.length;
    books = ORDERED_BOOKS_BY_CATEGORY[CATEGORY_ORDER[catIndex]];
    index = books.length - 1;
  }

  popup.dataset.bookId = books[index];
  popup.dataset.category = CATEGORY_ORDER[catIndex];

  resetVideo();
  renderPopup(books[index]);
}

/* =====================================
   CLOSE POPUP (X + OUTSIDE)
===================================== */
document.addEventListener("click", e => {
  const popup = document.getElementById("BookPopup");
  if (!popup || popup.style.display !== "flex") return;

  const box = popup.querySelector(".popup-box");

  /* ❌ X BUTTON */
  if (e.target.closest(".close-popup")) {
    e.stopPropagation();
    closePopup();
    return;
  }

  /* ❌ CLICK OUTSIDE BOX */
  if (!box.contains(e.target)) {
    closePopup();
  }
});

function closePopup() {
  const popup = document.getElementById("BookPopup");
  popup.style.display = "none";
  resetVideo();
}

/* =====================================
   VIDEO LOGIC
===================================== */
document.addEventListener("click", e => {
  const btn = e.target.closest(".watch-video-btn");
  if (!btn) return;

  const popup = document.getElementById("BookPopup");
  const book = BOOK_REGISTRY[popup.dataset.bookId];
  const box = popup.querySelector(".video-box");

  if (box.classList.contains("active")) {
    resetVideo();
    return;
  }

  box.classList.add("active");
  box.innerHTML = `
    <div class="yt-lazy" data-video-id="${book.video}">
      <img src="https://img.youtube.com/vi/${book.video}/hqdefault.jpg">
    </div>
  `;

  btn.textContent = "Hide Video";
});

document.addEventListener("click", e => {
  const yt = e.target.closest(".yt-lazy");
  if (!yt) return;

  yt.classList.add("active");
   yt.innerHTML = `
    <iframe class="book-yt-video"
      src="https://www.youtube.com/embed/${yt.dataset.videoId}?autoplay=1"
      allow="autoplay"
      allowfullscreen></iframe>
  `;
});

/* =====================================
   RESET VIDEO
===================================== */
function resetVideo() {
  const popup = document.getElementById("BookPopup");
  popup.querySelectorAll("iframe").forEach(i => i.remove());

  const box = popup.querySelector(".video-box");
  const btn = popup.querySelector(".watch-video-btn");

  if (box) {
    box.classList.remove("active");
    box.innerHTML = "";
  }
  if (btn) btn.textContent = "Watch Video";
}

/* =====================================
   MOBILE SWIPE
===================================== */
let startX = 0;

document.addEventListener("touchstart", e => {
  if (!e.target.closest(".popup-img")) return;
  startX = e.changedTouches[0].screenX;
});

document.addEventListener("touchend", e => {
  if (!e.target.closest(".popup-img")) return;

  const diff = startX - e.changedTouches[0].screenX;
  if (Math.abs(diff) < 50) return;

  navigatePopup(diff > 0 ? 1 : -1);
});
