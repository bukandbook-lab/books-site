/* =====================================
   CART STATE (SINGLE SOURCE OF TRUTH)
===================================== */
const cart = {
  items: new Map(), // bookId => { title, price }
  delivery: "email",
  agreed: false
};

/* =====================================
   ADD TO CART (GRID + POPUP)
===================================== */
document.addEventListener("click", e => {
  const icon = e.target.closest(".cart-icon[data-book-id]");
  if (!icon) return;

  const bookId = icon.dataset.bookId;
  const title  = icon.dataset.title;
  const price  = Number(icon.dataset.price);

  if (!bookId || !title || !price) return;

  cart.items.set(bookId, { title, price });

  renderCart();
  openCart();

  /* auto-close popup if clicked inside one */
  const popup = icon.closest(".popup");
  if (popup) {
    popup.style.display = "none";
    popup.querySelector("iframe")?.remove();
  }
});

/* =====================================
   REMOVE ITEM (KEEP CART OPEN)
===================================== */
document.addEventListener("click", e => {
  const removeBtn = e.target.closest(".remove-item");
  if (!removeBtn) return;

  e.preventDefault();
  e.stopPropagation();

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
   TERMS CHECKBOX
===================================== */
document.addEventListener("change", e => {
  if (e.target.id === "agreeTerms") {
    cart.agreed = e.target.checked;
    updatePayButton();
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
          <img
            src="${CLOSE_ICON}"
            class="remove-item"
            data-book-id="${id}"
            alt="Remove"
          >
        </span>
      </div>
    `;
    index++;
  });

  let deliveryFeeHTML = "";
  if (cart.delivery === "courier") {
    total += 17;
    deliveryFeeHTML = `
      <div class="cart-fee">Shipping Fee: RM10</div>
      <div class="cart-fee">Thumb Drive: RM7</div>
    `;
  }

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
      <input type="checkbox" id="agreeTerms" ${cart.agreed ? "checked" : ""}>
      Please read Terms and Conditions under READ ME FIRST before payment.
    </label>

    <div class="cart-actions">
      <button id="continueShopping">CONTINUE SHOPPING</button>
      <button id="clickToPay" ${cart.items.size === 0 ? "disabled" : ""}>
        CLICK TO PAY
      </button>
    </div>
  `;

  updatePayButton();
}

/* =====================================
   PAY BUTTON ENABLE / DISABLE
===================================== */
function updatePayButton() {
  const payBtn = document.getElementById("clickToPay");
  if (!payBtn) return;
  payBtn.disabled = cart.items.size === 0 || !cart.agreed;
}

/* =====================================
   CLICK TO PAY
===================================== */
document.addEventListener("click", e => {
  if (e.target.id !== "clickToPay") return;
  if (cart.items.size === 0 || !cart.agreed) return;

  const emailBox = document.getElementById("emailBookTitles");
  const hidden   = document.getElementById("emailBookTitlesInput");

  if (emailBox) emailBox.innerHTML = "";

  let total = 0;
  let index = 1;
  const titles = [];

  cart.items.forEach(item => {
    total += item.price;
    const line = `${index}. ${item.title}`;
    titles.push(line);

    if (emailBox) {
      const div = document.createElement("div");
      div.textContent = line;
      emailBox.appendChild(div);
    }
    index++;
  });

  if (cart.delivery === "courier") total += 17;
  if (hidden) hidden.value = titles.join(" | ");

  const payText = document.getElementById("payText");
if (!payText) {
  console.error("payText element not found");
  return;
}

payText.innerHTML =
  "Please bank in <b>RM" + total + "</b> to Account Number: <b>1234567890 (Maybank)</b>.<br><br>" +
  "Once payment is made, please <b>CLICK THIS</b>&nbsp;" +

  "<img " +
    "src='https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjUhNlQdGbG0-uvrDrJmMrforsQT7WwfxNOotS02BNczodK1gvVQB86wafY3OPLsOn4wCQJ2kQGNNGzQ_HSgwtaT8Y6W3uRSOEnO7Kwi970G-tZz5ZwOGYchAfmP9LUueDq5EPWYtQZRHT8xUPk1vinzuuGP11DHbxt-tWnrG_aF63Dw2HkXAZU7N5qO1Ql/s320/WhatsApp.jpg' " +
    "width='30' " +
    "style='cursor:pointer; vertical-align:middle;' " +
    "onclick=\"window.open('https://wa.me/601113127911?text=' + buildWhatsAppMessage(), '_blank')\" " +
  ">&nbsp;" +

  "<a href='https://t.me/KidsBooksCatalogue' target='_blank'>" +
    "<img width='25' style='vertical-align:middle;' " +
    "src='https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhs3FdHPhgW48faXfJVVfX_pnB-XlOH8LR8F2f-oIedscEl8R3t9TScaafGCnDI1Y5SoRwxSvsQnDIhhgNfSq9QVBKrEqbGFl2IhwLbtpjLUqJqi0W7Y8rldmlNGqZeF4P9ZctlhWtMG5E6FcSd9JP_dJkYroz9bQDvNyXowuRd8MZezpItBs_fHSu1Dpf3/s320/Telegram_logo.jpg'>" +
  "</a>" +
  "<br><br><b>LOGO</b> to send payment screenshot or please fill in below.";
  document.getElementById("paymentPopup").style.display="block";



const cartEl = document.getElementById("Cart");
if (cartEl) cartEl.classList.remove("open");

const paymentPopup = document.getElementById("paymentPopup");
if (paymentPopup) paymentPopup.style.display = "flex";

});

/* =====================================
   OPEN / CLOSE CART
===================================== */
function openCart() {
  const cartEl = document.getElementById("Cart");
  if (cartEl) cartEl.classList.add("open");

}
/* =====================================
  SUBMIT FORM
===================================== */
document.getElementById("orderForm").addEventListener("submit", function(e){
  e.preventDefault();

  const form = e.target;
  const data = new FormData(form);

  fetch("https://formsubmit.co/f7d2abf13d655ceba057d05d96ceb8a2", {
    method: "POST",
    body: data,
    headers: { "Accept": "application/json" }
  })
  .then(() => {

    /* DELIVERY MESSAGE */
    const delivery = document.querySelector("input[name='delivery']:checked")?.value;
    const msg =
      "Thank you for your order. Your order will be delivered within " +
      (delivery === "email" ? "18 hours." : "3 days.");

    document.getElementById("thankYouMsg").innerText = msg;

    /* CLOSE PAYMENT POPUP, OPEN THANK YOU */
    document.getElementById("paymentPopup").style.display = "none";
    document.getElementById("thankYou").style.display = "block";

    form.reset();
  })
  .catch(() => {
    alert("Network error. Please try again.");
  });
});


document.addEventListener("click", e => {
  if (e.target.id === "continueShopping") {
    document.getElementById("Cart")?.classList.remove("open");
  }
});

/* =====================================
   CLOSE CART WHEN CLICKING OUTSIDE
===================================== */
document.addEventListener("click", e => {
  const cartEl = document.getElementById("Cart");
  if (!cartEl || !cartEl.classList.contains("open")) return;

  if (e.target.closest("#Cart")) return;
  if (e.target.closest(".cart-icon")) return;
  if (e.target.closest(".remove-item")) return;

  cartEl.classList.remove("open");
});
/* =====================================
   WHATSAPP MESSAGE
===================================== */
function buildWhatsAppMessage() {
  let msg = "🧒 *Kids Books Catalogue – New Order*\n\n";
  msg += "*List of Books:*\n";

  let index = 1;
  let total = 0;

  cart.items.forEach(item => {
    msg += `${index}. ${item.title}\n`;
    total += item.price;
    index++;
  });

  if (cart.delivery === "courier") {
    msg += "\nDelivery: Courier";
    total += 17;
  } else {
    msg += "\nDelivery: Email";
  }

  msg += `\n\n*Total:* RM${total}\n`;
  msg += "\nPayment done as per screenshot attached. Please proceed with delivery";

  return encodeURIComponent(msg);
}
