console.log("✅ cart.js loaded");

/* =========================
   CART STATE (SINGLE SOURCE)
========================= */
const cartState = {
  items: new Map() // key = bookId, value = {title, price, qty}
};

/* =========================
   ADD TO CART
========================= */
document.addEventListener("click", function (e) {
  const icon = e.target.closest(".cart-icon");
  if (!icon) return;

  const bookId = icon.dataset.bookId;
  if (!bookId || !BOOK_REGISTRY[bookId]) return;

  const book = BOOK_REGISTRY[bookId];
  const price = Number(book.price || 4);

  /* OPEN CART */
  document.getElementById("Cart")?.classList.add("open");

  /* ADD / INCREMENT */
  if (cartState.items.has(bookId)) {
    cartState.items.get(bookId).qty += 1;
  } else {
    cartState.items.set(bookId, {
      title: book.title,
      price,
      qty: 1
    });
  }

  renderCart();
});

/* =========================
   RENDER CART TABLE
========================= */
function renderCart() {
  const tbody = document.getElementById("cartBody");
  const titlesBox = document.getElementById("cartTitles");
  if (!tbody || !titlesBox) return;

  tbody.innerHTML = "";
  titlesBox.innerHTML = "";

  let total = 0;
  let index = 1;

  cartState.items.forEach((item, bookId) => {
    const sub = item.qty * item.price;
    total += sub;

    /* TABLE ROW */
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.title}</td>
      <td>
        <input type="number" min="1" value="${item.qty}"
               data-book-id="${bookId}" class="qty-input">
      </td>
      <td>RM${item.price}</td>
      <td class="sub">RM${sub}</td>
      <td>
        <button class="remove-item" data-book-id="${bookId}">✕</button>
      </td>
    `;
    tbody.appendChild(tr);

    /* TITLE LIST */
    const div = document.createElement("div");
    div.textContent = index + ". " + item.title;
    titlesBox.appendChild(div);
    index++;
  });

  document.getElementById("total").innerText = total;
  document.getElementById("formTotal").value = total;
}

/* =========================
   QTY CHANGE
========================= */
document.addEventListener("input", function (e) {
  if (!e.target.classList.contains("qty-input")) return;

  const bookId = e.target.dataset.bookId;
  const val = Number(e.target.value);

  if (cartState.items.has(bookId) && val > 0) {
    cartState.items.get(bookId).qty = val;
    renderCart();
  }
});

/* =========================
   REMOVE ITEM
========================= */
document.addEventListener("click", function (e) {
  if (!e.target.classList.contains("remove-item")) return;

  const bookId = e.target.dataset.bookId;
  cartState.items.delete(bookId);
  renderCart();
});

/* =========================
   CONTINUE SHOPPING
========================= */
document.getElementById("continueShopping")?.addEventListener("click", () => {
  document.getElementById("Cart")?.classList.remove("open");
});
