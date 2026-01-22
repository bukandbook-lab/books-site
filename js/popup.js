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

      <div class="popup-nav left hidden" id="popupPrev">‹</div>

      <img src="${book.img}" class="popup-img popup-trigger" data-book-id="${bookId}">

      <div class="popup-nav right hidden" id="popupNext">›</div>

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

      ${
        book.video
          ? `<button class="watch-video-btn">Watch Video</button>
             <div class="video-box" data-youtube="${book.video}" style="display:none;"></div>`
          : ``
      }

    </div>
  `;

  const popup = document.getElementById("BookPopup");
  popup.dataset.bookId = bookId;
  popup.style.display = "flex";

  updatePopupNavigation();
  syncCartIcons();

}

/* =====================================
   GALLERY NAVIGATION (BY BOOK ID)
===================================== */
function updatePopupNavigation() {
  if (!currentBookId) return;

  const prefix = currentBookId.charAt(0); // B, P, C, etc.

  const categoryBookIds = Object.keys(BOOK_REGISTRY)
    .filter(id => id.charAt(0) === prefix)
    .sort((a, b) => {
      const numA = parseInt(a.slice(1), 10);
      const numB = parseInt(b.slice(1), 10);
      return numA - numB;
    });

  const index = categoryBookIds.indexOf(currentBookId);

  const prevBtn = document.getElementById("popupPrev");
  const nextBtn = document.getElementById("popupNext");

  /* LEFT */
  if (index > 0) {
    prevBtn.classList.remove("hidden");
    prevBtn.onclick = () => openBookPopup(categoryBookIds[index - 1]);
  } else {
    prevBtn.classList.add("hidden");
  }

  /* RIGHT */
  if (index < categoryBookIds.length - 1) {
    nextBtn.classList.remove("hidden");
    nextBtn.onclick = () => openBookPopup(categoryBookIds[index + 1]);
  } else {
    nextBtn.classList.add("hidden");
  }
}

/* =====================================
   POPUP INTERACTIONS
===================================== */
document.addEventListener("click", e => {

  /* CLOSE POPUP */
  if (e.target.classList.contains("close-popup")) {
    const popup = e.target.closest(".popup");
    if (popup) popup.style.display = "none";

    const iframe = popup?.querySelector("iframe");
    if (iframe) iframe.remove();
    return;
  }

  /* WATCH / HIDE VIDEO */
  if (e.target.classList.contains("watch-video-btn")) {
    const popup = e.target.closest(".popup");
    if (!popup) return;

    const videoBox = popup.querySelector(".video-box");
    if (!videoBox) return;

    const bookId = popup.dataset.bookId;
    const book = BOOK_REGISTRY[bookId];
    if (!book || !book.video) return;

    if (videoBox.innerHTML) {
      videoBox.innerHTML = "";
      videoBox.style.display = "none";
      e.target.innerText = "Watch Video";
    } else {
      videoBox.innerHTML = `
        <iframe
          width="100%"
          height="260"
          src="https://www.youtube.com/embed/${book.video}"
          frameborder="0"
          allowfullscreen>
        </iframe>
      `;
      videoBox.style.display = "block";
      e.target.innerText = "Hide Video";
    }
  }
});
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

