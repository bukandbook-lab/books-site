let currentBookId = null;

/* =====================================
   OPEN POPUP (CLICK ON BOOK)
===================================== */
document.addEventListener("click", e => {
  const trigger = e.target.closest(".popup-trigger");
  if (!trigger) return;

  openBookPopup(trigger.dataset.bookId);
});

/* =====================================
   OPEN BOOK POPUP
===================================== */
function openBookPopup(bookId) {
  const popup = document.getElementById("BookPopup");
  const book = BOOK_REGISTRY[bookId];
  if (!book) return;

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

      <div class="popup-nav left" id="popupPrev">‹</div>

      <div class="popup-img-wrapper">
        <div class="skeleton"></div>
        <img src="${book.img}"
             class="popup-img"
             data-book-id="${bookId}"
             loading="eager">
      </div>

      <div class="popup-nav right" id="popupNext">›</div>

      <div class="book-title">${book.title}</div>
      <div>${book.category}</div>
      ${setQtyHTML}

      <div class="price-box"
        data-book-id="${bookId}"
        data-title="${book.title}"
        data-price="${book.price}"
        data-setqtty="${book.SetQtty || 1}">
        <b>RM${book.price} ${priceLabel}</b>
        <img class="cart-icon" src="${CART_ICON}" width="22">
      </div>

      ${book.video ? `
        <button class="watch-video-btn">Watch Video</button>
        <div class="video-box" style="display:none;"></div>
      ` : ""}

    </div>
  `;

  bindPopupNavigation();
  syncCartIcons();
}

/* =====================================
   CATEGORY-AWARE NAVIGATION (STEP 4)
===================================== */
function bindPopupNavigation() {
  document.getElementById("popupPrev")?.addEventListener("click", () => navigatePopup(-1));
  document.getElementById("popupNext")?.addEventListener("click", () => navigatePopup(1));
}

function navigatePopup(step) {
  const popup = document.getElementById("BookPopup");
  if (!popup) return;

  let category = popup.dataset.category;
  let bookId = popup.dataset.bookId;

  // 🛑 SAFETY CHECKS
  if (!category || !bookId) {
    console.warn("Popup missing category or bookId");
    return;
  }

  if (!Array.isArray(CATEGORY_ORDER)) {
    console.error("CATEGORY_ORDER missing or not an array");
    return;
  }

  if (!ORDERED_BOOKS_BY_CATEGORY?.[category]) {
    console.error("No books for category:", category);
    return;
  }

  let catIndex = CATEGORY_ORDER.indexOf(category);
  let books = ORDERED_BOOKS_BY_CATEGORY[category];

  if (!Array.isArray(books) || books.length === 0) {
    console.error("Empty book list for category:", category);
    return;
  }

  let index = books.indexOf(bookId);

  // fallback if bookId not found
  if (index === -1) index = 0;

  // ➕ move step
  index += step;

  /* ▶ NEXT CATEGORY */
  if (index >= books.length) {
    catIndex = (catIndex + 1) % CATEGORY_ORDER.length;
    category = CATEGORY_ORDER[catIndex];
    books = ORDERED_BOOKS_BY_CATEGORY[category];
    index = 0;
  }

  /* ◀ PREVIOUS CATEGORY */
  if (index < 0) {
    catIndex = (catIndex - 1 + CATEGORY_ORDER.length) % CATEGORY_ORDER.length;
    category = CATEGORY_ORDER[catIndex];
    books = ORDERED_BOOKS_BY_CATEGORY[category];
    index = books.length - 1;
  }

  const nextId = books[index];
  if (!nextId) return;

  // 🧠 UPDATE POPUP STATE
  popup.dataset.bookId = nextId;
  popup.dataset.category = category;

  // 🛑 STOP VIDEO BEFORE SWITCH
  resetVideo(popup);

  // 🔄 RERENDER BOOK
  renderPopup(nextId);
}


/* =====================================
   CLOSE POPUP
===================================== */
document.addEventListener("click", e => {
  const closeBtn = e.target.closest(".close-popup");
  if (!closeBtn) return;

  const popup = closeBtn.closest(".popup");
  popup.style.display = "none";
  resetVideo(popup);
});

/* =====================================
   VIDEO LOGIC
===================================== */
document.addEventListener("click", e => {
  if (!e.target.classList.contains("watch-video-btn")) return;

  const popup = e.target.closest(".popup");
  const book = BOOK_REGISTRY[popup.dataset.bookId];
  if (!book?.video) return;

  const box = popup.querySelector(".video-box");
  if (box.style.display === "block") {
    resetVideo(popup);
    return;
  }

  box.innerHTML = `
    <div class="yt-lazy" data-video-id="${book.video}">
      <img src="https://img.youtube.com/vi/${book.video}/hqdefault.jpg">
      <span class="yt-play">▶</span>
    </div>
  `;
  box.style.display = "block";
  e.target.textContent = "Hide Video";
});

document.addEventListener("click", e => {
  const yt = e.target.closest(".yt-lazy");
  if (!yt) return;

  yt.innerHTML = `
    <iframe src="https://www.youtube.com/embed/${yt.dataset.videoId}?autoplay=1"
      allow="autoplay" allowfullscreen></iframe>
  `;
});

function resetVideo(popup) {
  popup.querySelectorAll("iframe").forEach(f => f.remove());
  const videoBox = popup.querySelector(".video-box");
  const btn = popup.querySelector(".watch-video-btn");

  if (videoBox) {
    videoBox.innerHTML = "";
    videoBox.style.display = "none";
  }

  if (btn) {
    btn.textContent = "Watch Video";
  }
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
   
  if (diff > 0) {
  navigatePopup(1);
} else {
  navigatePopup(-1);
}

});
