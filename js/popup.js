let currentBookId = null;

/* =====================================
   OPEN POPUP (CLICK ON BOOK)
===================================== */
document.addEventListener("click", e => {
  const trigger = e.target.closest(".popup-trigger");
  if (!trigger) return;

  const bookId = trigger.dataset.bookId;
  openBookPopup(bookId);
});

/* =====================================
   OPEN BOOK POPUP (REUSABLE)
===================================== */
function openBookPopup(bookId) {
  const content = document.getElementById("BookPopupContent");
  const existingBox = content.querySelector(".popup-box");

  if (existingBox) {
    existingBox.classList.add("fade-out");
    setTimeout(() => renderPopup(bookId), 200);
  } else {
    renderPopup(bookId);
  }
}
function renderPopup(bookId) {
  if (!window.BOOK_REGISTRY) {
    console.error("BOOK_REGISTRY missing");
    return;
  }

  const book = BOOK_REGISTRY[bookId];
  if (!book) {
    alert("Book not found");
    return;
  }

  currentBookId = bookId;

  /* ===============================
     PRICE & LABEL LOGIC (FIXED)
  =============================== */
  const isSetBook = Number(book.SetQtty) > 1;
  const priceLabel = isSetBook ? "/set" : "/book";

  const setQtyHTML = isSetBook
    ? `<div class="set-qty"><b>No. of books:</b> ${book.SetQtty} books / set</div>`
    : "";

  /* ===============================
     POPUP HTML
  =============================== */
  document.getElementById("BookPopupContent").innerHTML = `
    <div class="popup-box">

      <img src="${CLOSE_ICON}" class="close-popup" alt="Close">

      <div class="popup-nav left" id="popupPrev">‹</div>

      <div class="popup-img-wrapper">
         <div class="skeleton"></div>
      
         <img src="${book.img}" class="popup-img popup-trigger" loading="eager" data-book-id="${bookId}">
      </div>
      <div class="popup-nav right" id="popupNext">›</div>

      <div class="book-title">${book.title}</div>

      ${setQtyHTML}

      <div
        class="price-box"
        data-book-id="${bookId}"
        data-title="${book.title}"
        data-price="${book.price}"
        data-setqtty="${book.SetQtty || 1}"
      >
        <b>RM${book.price} ${priceLabel}</b>

        <img
          class="cart-icon"
          src="${CART_ICON}"
          width="22"
          data-book-id="${bookId}"
        >
      </div>

${book.video ? `
  <button class="watch-video-btn">Watch Video</button>

  <div class="video-box" style="display:none;"></div>
` : ""}

      </div>
  `;

  

  const popup = document.getElementById("BookPopup");
  popup.dataset.bookId = bookId;
  popup.style.display = "flex";

  bindPopupNavigation();
  syncCartIcons();

}

/* =====================================
   GALLERY NAVIGATION (BY BOOK ID)
===================================== */
function bindPopupNavigation() {
  const img = document.querySelector(".popup-img");
  const wrapper = document.querySelector(".popup-img-wrapper");

  document.getElementById("popupPrev")?.addEventListener("click", () => {
    navigatePopup(-1);
  });

  document.getElementById("popupNext")?.addEventListener("click", () => {
    navigatePopup(1);
  });

  function navigatePopup(step) {
    const ids = Object.keys(BOOK_REGISTRY);
    let index = ids.indexOf(img.dataset.bookId);

    index = (index + step + ids.length) % ids.length;
    const nextId = ids[index];
    const nextBook = BOOK_REGISTRY[nextId];

    // 🔄 RESET skeleton
    wrapper.classList.remove("loaded");
    img.classList.remove("loaded");

    img.src = nextBook.img;
    img.dataset.bookId = nextId;

    document.querySelector(".book-title").textContent = nextBook.title;
  }
}

/* =====================================
   CLOSE POPUP
===================================== */
document.addEventListener("click", e => {
  const close = e.target.closest(".close-popup");
  if (!close) return;

  const popup = close.closest(".popup");
  if (!popup) return;

  resetVideo(popup);
  popup.style.display = "none";
});

/* =====================================
   WATCH HIDE VIDEO
===================================== */
document.addEventListener("click", e => {
  if (!e.target.classList.contains("watch-video-btn")) return;

  const popup = e.target.closest(".popup");
  if (!popup) return;

  const bookId = popup.dataset.bookId;
  const book = BOOK_REGISTRY[bookId];
  if (!book || !book.video) return;

  const videoBox = popup.querySelector(".video-box");
  const btn = e.target;

  if (videoBox.style.display === "block") {
    resetVideo(popup);
    return;
  }

  // show thumbnail
  videoBox.innerHTML = `
    <div class="yt-lazy" data-video-id="${book.video}">
      <img
        src="https://img.youtube.com/vi/${book.video}/hqdefault.jpg"
        loading="lazy"
        alt="Video thumbnail"
      >
      <span class="yt-play">▶</span>
    </div>
  `;
  videoBox.style.display = "block";
  btn.textContent = "Hide Video";
});

/* =====================================
   CLICK YOUTUBE COVER → AUTOPLAY
===================================== */
document.addEventListener("click", e => {
  const yt = e.target.closest(".yt-lazy");
  if (!yt) return;

  const id = yt.dataset.videoId;
  if (!id) return;

  yt.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${id}?autoplay=1"
      frameborder="0"
      allow="autoplay; encrypted-media"
      allowfullscreen
    ></iframe>
  `;
});

/* =====================================
   RESET VIDEO
===================================== */
function resetVideo(popup) {
  const videoBox = popup.querySelector(".video-box");
  const btn = popup.querySelector(".watch-video-btn");

  if (videoBox) {
    videoBox.innerHTML = "";
    videoBox.style.display = "none";
  }
  if (btn) btn.textContent = "Watch Video";
}

/* =====================================
   NAVIGATION
===================================== */
function bindPopupNavigation() {
  document.getElementById("popupPrev")?.addEventListener("click", () => navigate(-1));
  document.getElementById("popupNext")?.addEventListener("click", () => navigate(1));

  function navigate(step) {
    const popup = document.getElementById("BookPopup");
    const img = popup.querySelector(".popup-img");

    const ids = Object.keys(BOOK_REGISTRY);
    let index = ids.indexOf(popup.dataset.bookId);

    index = (index + step + ids.length) % ids.length;
    const nextId = ids[index];
    const nextBook = BOOK_REGISTRY[nextId];

    popup.dataset.bookId = nextId;
    resetVideo(popup);

    img.src = nextBook.img;
    img.dataset.bookId = nextId;
    popup.querySelector(".book-title").textContent = nextBook.title;
  }
}

/* =====================================
   MOBILE SWIPE SUPPORT
===================================== */
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("touchstart", e => {
  const popupImg = e.target.closest(".popup-img");
  if (!popupImg) return;

  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener("touchend", e => {
  const popupImg = e.target.closest(".popup-img");
  if (!popupImg) return;

  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const diff = touchStartX - touchEndX;

  // swipe threshold
  if (Math.abs(diff) < 50) return;

  if (diff > 0) {
    // swipe left → next
    document.getElementById("popupNext")?.click();
  } else {
    // swipe right → prev
    document.getElementById("popupPrev")?.click();
  }
}
/* =====================================
   WHEN OUTSIDE POPUP IS CLICKED
===================================== */
document.addEventListener("click", e => {
  const popup = document.getElementById("BookPopup");
  const box = popup?.querySelector(".popup-box");

  if (!popup || popup.style.display !== "flex") return;

  if (!box.contains(e.target) && e.target === popup) {
    popup.style.display = "none";

    // stop video if any
    const iframe = popup.querySelector("iframe");
    if (iframe) iframe.remove();
  }
});

