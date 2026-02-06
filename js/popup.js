let currentBookId = null;

/* =====================================
   OPEN POPUP
===================================== */

function openBookPopup(bookId) {
  const popup = document.getElementById("BookPopup");
  if (!popup) return;

  const id = String(bookId);
  const book = BOOK_REGISTRY[id];
  if (!book) {
    console.warn("Book not found for popup:", id);
    return;
  }

  popup.dataset.bookId = id;
  popup.dataset.category = book.category;

  renderPopup(id);

  // 🔑 REQUIRED FOR ANIMATION
  popup.style.display = "flex";

  // allow browser to paint before animation
  requestAnimationFrame(() => {
    popup.classList.add("show");
  });
}



/* =====================================
   RENDER POPUP
===================================== */
function renderPopup(bookId) {
  const id = String(bookId);        // ✅ normalize
  const book = BOOK_REGISTRY[id];
  if (!book) return;

  currentBookId = id;

   const isSetBook = Number(book.SetQtty) > 1;
   const hasSetTotal = Number(book.SetTotal) > 0;
   const hasStatus = book.Status && book.Status.trim() !== "";
   const hasMissingTitle =
      book.MissingTitle && book.MissingTitle.trim() !== "";

  const priceLabel = isSetBook ? "/set" : "/book";

   let setQtyHTML = "";

if (hasSetQtty) {
  setQtyHTML = `
    <div class="set-qty">
      <b>No. of Books:</b>
      ${book.SetQtty}${hasSetTotal ? ` / ${book.SetTotal}` : ""}
      ${hasStatus ? `<br><b>Status:</b> ${book.Status}` : ""}
      ${hasMissingTitle ? `<br><b>Missing Title:</b> ${book.MissingTitle}` : ""}
    </div>
  `;
}



  document.getElementById("BookPopupContent").innerHTML = `
    <div class="popup-box">

      <img src="${CLOSE_ICON}" class="close-popup" alt="Close">

      <div class="popup-nav left">‹</div>

      <div class="popup-img-wrapper">
        <div class="img-skeleton"></div>
        <img src="${book.img}"
             class="popup-img"
             data-book-id="${id}"
             loading="eager">
      </div>


      <div class="popup-nav right">›</div>

      <div class="book-title">${book.title}</div>
          
      ${book.Author ? `
      <div><b>Author:</b> ${book.Author}</div>
    ` : ""}
    
<div>
  <b>Category:</b>
  ${
    [book.category, ...(book.tags || [])]
      .map(cat => `
        <span
          class="popup-category"
          data-category="${cat}"
        >
          ${prettyCategory(cat)}
        </span>
      `)
      .join(", ")
  }
</div>


      ${setQtyHTML}

      ${book.Series ? `
      <div><b>Series:</b> ${book.Series}</div>
    ` : ""}

      <div class="price-box"
        data-book-id="${id}"
        data-title="${book.title}"
        data-price="${book.price.toFixed(2)}"
        data-setqtty="${book.SetQtty || 1}">
        &nbsp&nbspRM${book.price.toFixed(2)} ${priceLabel}
        <img data-book-id="${id}" class="cart-icon" src="${CART_ICON}" width="22">
      </div>

      ${book.video ? `
        <button class="watch-video-btn">Watch Video</button>
        <div class="video-box"></div>
      ` : ""}
    </div>
  `;
   
  // IMAGE SKELETON HANDLING

const img = document.querySelector(".popup-img");
const skeleton = document.querySelector(".img-skeleton");

if (img && skeleton) {
  img.onload = () => {
    skeleton.remove();
    img.classList.add("loaded");
  };
}

     // 🔥 FORCE CART STATUS CHECK FOR THIS BOOK
const popup = document.getElementById("BookPopup");

const popupIcon = popup.querySelector(
  `.cart-icon[data-book-id="${id}"]`
);

if (popupIcon) {
  const inCart = cart.items.has(id);

  popupIcon.src = inCart ? CHECK_ICON : CART_ICON;
  popupIcon.classList.toggle("in-cart", inCart);
}


}

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
 /* =====================
     ONE master handler
  ===================== */

document.addEventListener("click", e => {

  const popup = document.getElementById("BookPopup");

  /* =====================
     CLOSE POPUP (X)
  ===================== */
  if (e.target.closest("#BookPopup .close-popup")) {
    e.preventDefault();
    e.stopPropagation();

    closeBookPopup();
    resetVideo(popup);
    return;
  }

  /* =====================
     CLOSE POPUP (OUTSIDE)
  ===================== */
if (
  popup &&
  popup.classList.contains("show") &&
  e.target === popup
) {
  closeBookPopup();
  resetVideo();
  return;
}

  /* =====================
     IGNORE CLICKS INSIDE POPUP
  ===================== */
  if (e.target.closest("#BookPopup")) return;

  /* =====================
     OPEN POPUP
  ===================== */
  const trigger = e.target.closest(".popup-trigger");
  if (trigger) {
    openBookPopup(trigger.dataset.bookId);
  }
});



/* =====================================
   VIDEO LOGIC
===================================== */
document.addEventListener("click", e => {
  if (!e.target.classList.contains("watch-video-btn")) return;

  const popup = document.getElementById("BookPopup");
  const book = BOOK_REGISTRY[popup.dataset.bookId];
  const box = popup.querySelector(".video-box");

  if (!book?.video || !box) return;

  // Toggle video box
  if (box.classList.contains("active")) {
    box.classList.remove("active");
    box.innerHTML = "";
    e.target.textContent = "Watch Video";
    return;
  }

  // Activate video box
  box.classList.add("active");
  e.target.textContent = "Hide Video";

  // Add YouTube cover image with play button
  box.innerHTML = `
    <div class="yt-lazy" data-video-id="${book.video}">
      <img src="https://img.youtube.com/vi/${book.video}/hqdefault.jpg">
      <span class="yt-play"></span>
    </div>
  `;
});


document.addEventListener("click", e => {
  const yt = e.target.closest(".yt-lazy");
  if (!yt) return;

  // Replace thumbnail with iframe
  yt.innerHTML = `
    <iframe class="book-yt-video"
      src="https://www.youtube.com/embed/${yt.dataset.videoId}?autoplay=1"
      allow="autoplay; encrypted-media"
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
/* =====================================
   CLOSE POPUP
===================================== */
function closeBookPopup() {
  const popup = document.getElementById("BookPopup");
  if (!popup) return;

  popup.classList.remove("show");

  setTimeout(() => {
    popup.style.display = "none";
  }, 250);
}

