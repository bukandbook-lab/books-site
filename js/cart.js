const cartItems = {};

document.addEventListener("click", e => {
  const icon = e.target.closest(".cart-icon");
  if (!icon) return;

  const id = icon.dataset.id;
  const title = icon.dataset.title;
  const price = Number(icon.dataset.price);

  if (!cartItems[id]) {
    cartItems[id] = { title, price, qty: 0 };
  }
  cartItems[id].qty++;

  renderCart();
});

function renderCart() {
  const cart = document.getElementById("Cart");
  let total = 0;

  cart.innerHTML = "<h3>Cart</h3>";

  Object.values(cartItems).forEach(item => {
    const sub = item.price * item.qty;
    total += sub;

    cart.innerHTML += `
      <div>
        ${item.title} — RM${item.price} × ${item.qty} = RM${sub}
      </div>
    `;
  });

  cart.innerHTML += `<b>Total: RM${total}</b>`;
}
