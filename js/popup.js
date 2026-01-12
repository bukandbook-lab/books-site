document.addEventListener("click", e => {

  const trigger = e.target.closest(".popup-trigger");
  if (!trigger) return;

  const bookId = trigger.dataset.bookId;
  const book = BOOK_REGISTRY[bookId];

  if (!book) {
    alert("Book not found");
    return;
  }

  document.getElementById("comicPopupContent").innerHTML = `
    <div class="popup-inner">
      <span class="close-popup">✕</span>

      <img src="${book.img}" class="popup-large-img">

      <h2>${book.title}</h2>

      <div class="popup-price">
        <b>RM${book.price}/set</b>
        <img
          class="cart-icon"
          data-book-id="${book.id}"
          src="${CART_ICON}">
      </div>

      ${
        book.video
        ? `<button class="watch-video-btn">Watch Video</button>
           <div class="video-box" data-youtube="${book.video}" style="display:none;"></div>`
        : `<p class="no-video">No video available</p>`
      }
    </div>
  `;


  document.getElementById("comicPopup").dataset.bookId = bookId;
  document.getElementById("comicPopup").style.display = "flex";
});
document.addEventListener("click", function (e) {

  /* ===============================
     CLOSE POPUP (X)
  =============================== */
  if (e.target.classList.contains("close-popup")) {
    const popup = e.target.closest(".popup");
    if (popup) popup.style.display = "none";

    // stop video if playing
    const iframe = popup?.querySelector("iframe");
    if (iframe) iframe.remove();
    return;
  }

  /* ===============================
     WATCH / HIDE VIDEO
  =============================== */
  if (e.target.classList.contains("watch-video-btn")) {

    const popup = e.target.closest(".popup");
    if (!popup) return;

    const videoBox = popup.querySelector(".video-box");
    if (!videoBox) return;

    const bookId = popup.dataset.bookId;
    const book = BOOK_REGISTRY[bookId];

    if (!book || !book.video) {
      alert("No video available");
      return;
    }

    // TOGGLE
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

