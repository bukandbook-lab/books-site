
/* =====================================
   CART STATE (SINGLE SOURCE OF TRUTH)
===================================== */
const cart = {
  items: new Map(), // bookId => { title, price }
  delivery: "email"
};

/* =====================================
   ADD TO CART (FROM CART ICON)
===================================== */
document.addEventListener("click", e => {
  const icon = e.target.closest(".cart-icon[data-book-id]");
  if (!icon) return;

  const bookId = icon.dataset.bookId;
  const title  = icon.dataset.title;
  const price  = Number(icon.dataset.price);

  if (!bookId || !title || !price) return;

  /* ADD / UPDATE CART */
  cart.items.set(bookId, { title, price });

  renderCart();
  openCart();

  /* ✅ AUTO-CLOSE POPUP IF INSIDE ONE */
  const popup = icon.closest(".popup");
  if (popup) {
    popup.style.display = "none";

    /* stop video if any */
    const iframe = popup.querySelector("iframe");
    if (iframe) iframe.remove();
  }
});

/* =====================================
   REMOVE ITEM
===================================== */
document.addEventListener("click", e => {
  const removeBtn = e.target.closest(".remove-item");
  if (!removeBtn) return;

  cart.items.delete(removeBtn.dataset.bookId);
  renderCart();
});

/* =====================================
   DELIVERY CHANGE
===================================== */
document.addEventListener("change", e => {
  if (e.target.name === "delivery") {
    cart.delivery = e.target.value;
    renderCart();
  }
});

/* =====================================
   RENDER CART
===================================== */
function renderCart() {
  const box = document.getElementById("Cart");
  if (!box) return;

  let total = 0;
  let index = 1;

  let itemsHTML = "";

  cart.items.forEach((item, id) => {
    total += item.price;

    itemsHTML += `
      <div class="cart-row">
        <span>${index}. ${item.title}</span>
        <span>
          RM${item.price}
          <span class="remove-item" data-book-id="${id}">✕</span>
        </span>
      </div>
    `;
    index++;
 });

  /* DELIVERY FEES */
  let deliveryFeeHTML = "";
  if (cart.delivery === "courier") {
    total += 17;
    deliveryFeeHTML = `
      <div class="cart-fee">Shipping Fee: RM10</div>
      <div class="cart-fee">Thumb Drive: RM7</div>
    `;
  }

  const isCartEmpty = cart.items.size === 0;

box.innerHTML = `
  <h3>CART</h3>

  ${itemsHTML || "<p>No items selected</p>"}

  <hr>

  <div class="delivery">
    <b>Delivery Method</b><br>
    <label>
      <input type="radio" name="delivery" value="email"
        ${cart.delivery === "email" ? "checked" : ""}>
      Email
    </label><br>

    <label>
      <input type="radio" name="delivery" value="courier"
        ${cart.delivery === "courier" ? "checked" : ""}>
      Courier
    </label>
  </div>

  ${deliveryFeeHTML}

  <hr>

  <div class="total"><b>TOTAL: RM${total}</b></div>

  <label class="terms">
    <input type="checkbox" id="agreeTerms">
    Please read Terms and Conditions under READ ME FIRST before payment.
  </label>

  <div class="cart-actions">
    <button id="continueShopping">CONTINUE SHOPPING</button>
    <button id="clickToPay" ${isCartEmpty ? "disabled" : ""}>
      CLICK TO PAY
    </button>
  </div>
`;
    updatePayButton();

}

document.addEventListener("change", e => {
  if (e.target.id === "agreeTerms") updatePayButton();
});

function updatePayButton() {
  const payBtn = document.getElementById("clickToPay");
  const terms  = document.getElementById("agreeTerms");

  if (!payBtn) return;

  payBtn.disabled = cart.items.size === 0 || !terms?.checked;
}
/* =====================================
   CLICK TO PAY
===================================== */
document.addEventListener("click", e => {
  if (e.target.id !== "clickToPay") return;

  if (cart.items.size === 0) return;

  const terms = document.getElementById("agreeTerms");
  if (!terms?.checked) {
    alert("Please agree to Terms before payment.");
    return;
  }

  /* BUILD BOOK LIST */
  const emailBox = document.getElementById("emailBookTitles");
  const hidden   = document.getElementById("emailBookTitlesInput");

  emailBox.innerHTML = "";
  const titles = [];

  let index = 1;
  cart.items.forEach(item => {
    const div = document.createElement("div");
    div.textContent = `${index}. ${item.title}`;
    emailBox.appendChild(div);
    titles.push(`${index}. ${item.title}`);
    index++;
  });

  hidden.value = titles.join(" | ");

  /* TOTAL */
  let total = 0;
  cart.items.forEach(i => total += i.price);
  if (cart.delivery === "courier") total += 17;

  document.getElementById("payText").innerHTML = `
    Please bank in <b>RM${total}</b> to Account Number:
    <b>1234567890 (Maybank)</b>.<br><br>

    Once payment is made, please <b>CLICK THIS</b>:
    <br><br>

    <a href="http://www.wasap.my/601113127911/paymentdone" target="_blank">
      <img width="30" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjUhNlQdGbG0-uvrDrJmMrforsQT7WwfxNOotS02BNczodK1gvVQB86wafY3OPLsOn4wCQJ2kQGNNGzQ_HSgwtaT8Y6W3uRSOEnO7Kwi970G-tZz5ZwOGYchAfmP9LUueDq5EPWYtQZRHT8xUPk1vinzuuGP11DHbxt-tWnrG_aF63Dw2HkXAZU7N5qO1Ql/s320/WhatsApp.jpg">
    </a>

    <a href="https://t.me/KidsBooksCatalogue" target="_blank">
      <img width="25" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhs3FdHPhgW48faXfJVVfX_pnB-XlOH8LR8F2f-oIedscEl8R3t9TScaafGCnDI1Y5SoRwxSvsQnDIhhgNfSq9QVBKrEqbGFl2IhwLbtpjLUqJqi0W7Y8rldmlNGqZeF4P9ZctlhWtMG5E6FcSd9JP_dJkYroz9bQDvNyXowuRd8MZezpItBs_fHSu1Dpf3/s320/Telegram_logo.jpg">
    </a>
  `;

  document.getElementById("Cart").classList.remove("open");
  document.getElementById("paymentPopup").style.display = "flex";
});

/* =====================================
   OPEN / CLOSE CART
===================================== */
function openCart() {
  document.getElementById("Cart").classList.add("open");
}

document.addEventListener("click", e => {
  if (e.target.id === "continueShopping") {
    document.getElementById("Cart").classList.remove("open");
     
  }
   
});

document.addEventListener("click", e => {
  if (e.target.id === "closePayment") {
    document.getElementById("paymentPopup").style.display = "none";
  }
});

