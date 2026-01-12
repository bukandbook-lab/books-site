function closeComicPopup() {
  const popup = document.getElementById("comicPopup");
  if (popup) popup.style.display = "none";
}

document.addEventListener("click", function (e) {

  const img = e.target.closest(".comic-thumb");
  if (!img) return;

  const src   = img.dataset.img || img.src;
  const title = img.dataset.title || "";
  const price = img.dataset.price || DEFAULT_PRICE;

  const popup = document.getElementById("comicPopup");
  const content = document.getElementById("comicPopupContent");

  content.innerHTML = `
    <span class="close-popup">✕</span>
    <img src="${src}">
  `;

  popup.style.display = "flex";
});

/* CLOSE POPUP */
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("close-popup") ||
      e.target.id === "comicPopup") {
    document.getElementById("comicPopup").style.display = "none";
  }
});
