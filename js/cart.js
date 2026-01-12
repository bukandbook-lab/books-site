window.CART = {};

document.addEventListener("click", e => {

  if (!e.target.classList.contains("cart-icon")) return;

  const bookId = e.target.dataset.bookId;
  const book = BOOK_REGISTRY[bookId];
  if (!book) return;

  if (!CART[bookId]) {
    CART[bookId] = {
      id: bookId,
      title: book.title,
      price: book.price,
      qty: 1
    };
  } else {
    CART[bookId].qty++;
  }

  renderCart();
});
