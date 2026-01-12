function closeComicPopup() {
  const popup = document.getElementById("comicPopup");
  if (popup) popup.style.display = "none";
}

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


    document.getElementById("comicPopup").style.display = "flex";
    return;
  }

  // CLOSE POPUP (X)
  if (e.target.classList.contains("close-popup")) {
    closeComicPopup();
  }

  // CLOSE POPUP AFTER ADD TO CART
  if (e.target.closest("#comicPopup .cart-icon")) {
    closeComicPopup();
  }
});
