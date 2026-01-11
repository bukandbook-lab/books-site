function closeComicPopup() {
  const popup = document.getElementById("comicPopup");
  if (popup) popup.style.display = "none";
}

document.addEventListener("click", e => {

  // OPEN POPUP FROM COMIC THUMB
  const thumb = e.target.closest(".comic-thumb");
  if (thumb) {
    const title = thumb.dataset.title;
    const img = thumb.dataset.img;
    const books = thumb.dataset.books || "—";
    const price = thumb.dataset.price || DEFAULT_PRICE;
    const id = thumb.dataset.id;

    document.getElementById("comicPopupContent").innerHTML = `
      <span class="close-popup"
            style="position:absolute;top:8px;right:12px;
                   font-size:22px;cursor:pointer;">✕</span>

      <img src="${img}" style="width:260px;display:block;margin:auto">

      <div class="book-title">${title}</div>
      <div>No. of books: ${books}</div>

      <div class="Price">
        <b>RM${price}/set</b>
        <img class="cart-icon"
             data-id="${id}"
             data-title="${title}"
             data-price="${price}"
             src="${CART_ICON}"
             width="25">
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
