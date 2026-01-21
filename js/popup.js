document.addEventListener("click", e => {
  const trigger = e.target.closest(".popup-trigger");
  if (!trigger) return;

  if (!window.BOOK_REGISTRY) {
    console.error("BOOK_REGISTRY missing");
    return;
  }

  const bookId = trigger.dataset.bookId;
  const book = BOOK_REGISTRY[bookId];

  if (!book) {
    alert("Book not found");
    return;
  }

  /* ===============================
     PRICE & LABEL LOGIC
  =============================== */
  const isSetBook = book.price === 2 || book.price === 4;
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

      <img src="${book.img}" class="popup-img">

      <div class="book-title">${book.title}</div>

      ${setQtyHTML}

<div
  class="price-box"
  data-book-id="${book.id}"
  data-title="${book.title}"
  data-price="${book.price}"
  data-setqtty="${book.SetQtty || 0}"
>
  <b>  RM${book.price}</b>
<img
  class="cart-icon"
  src="${CART_ICON}"
  width="22"
  data-book-id="${book.id}"
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
});

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
