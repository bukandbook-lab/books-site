/* =====================================
   CART STATE (SINGLE SOURCE OF TRUTH)
===================================== */
const cart = {
  items: new Map(),
  delivery: "email",
  deliveryDetails: "",   // ✅ ADD THIS
  agreed: false,
  orderId: ""            // ✅ for Order ID
};
/* =====================================
   DEFINE FOR GOOGLE FORM INPUT
===================================== */
const FORM = {
  orderId: "input.c19rb",
  books:   "input.bclce",
  total:   "input.xlt6rh",
  method:  "input.7uscpf",
  delivery:"input.6xxsnc"
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
    updateDeliveryField();
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

    <div class="total"><b>TOTAL: RM${total}</b></div><br>
   
    <div class="delivery-details">
     <b>Delivery Details</b><br>
        <textarea
          id="deliveryDetails"
          rows="3"
          required
          placeholder="Enter email address"
          style="width:100%; margin-top:6px;"
        ></textarea>
   </div>

    <label class="terms">
      <input type="checkbox" id="agreeTerms" ${cart.agreed ? "checked" : ""}>
      Please read Terms and Conditions under READ ME FIRST before payment.
    </label><br>

    <div class="cart-actions">
      <button id="continueShopping">CONTINUE SHOPPING</button>
      <button id="clickToPay" ${cart.items.size === 0 ? "disabled" : ""}>
        CLICK TO PAY
      </button>
    </div>
  `;

  updatePayButton();
  updateDeliveryField();

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

   // 🔥 FORCE-CAPTURE delivery details (fixes disappearing textarea)
const deliveryInput = document.getElementById("deliveryDetails");
if (deliveryInput) {
  cart.deliveryDetails = deliveryInput.value.trim();
}

   
  if (!cart.orderId) {
  cart.orderId = generateOrderId();
   }


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

payText.innerHTML = `
  Please bank in <b>RM${total}</b> to:<br><br>
  <b>Account Number:</b><br>
  1234567890 (Maybank)<br><br>

  Once payment is made, choose how you want to submit your order below 👇
`;
  document.getElementById("paymentPopup").style.display="block";



const cartEl = document.getElementById("Cart");
if (cartEl) cartEl.classList.remove("open");

const deliveryField = document.getElementById("deliveryDetails");
if (!deliveryField || !deliveryField.value.trim()) {
  alert("Please enter delivery details.");
  return;
}

if (cart.delivery === "email") {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(deliveryField.value.trim())) {
    alert("Please enter a valid email address.");
    return;
  }
}

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
  let msg = `🛒 *NEW ORDER*\n\n`;

  msg += `📦 *Order ID:* ${cart.orderId}\n\n`;

  msg += `📚 *List of Books Ordered:*\n`;
  let i = 1;
  cart.items.forEach(item => {
    msg += `${i}. ${item.title} (RM${item.price})\n`;
    i++;
  });

  let total = 0;
  cart.items.forEach(i => total += i.price);
  if (cart.delivery === "courier") total += 17;

  msg += `\n💰 *Total:* RM${total}\n`;
  msg += `🚚 *Delivery Method:* ${cart.delivery.toUpperCase()}\n`;

  msg += `📝 *Delivery Details:*\n${cart.deliveryDetails || "Not provided"}\n\n`;

  msg += `📸 *Payment Screenshot:* (attached below)\n`;

  return encodeURIComponent(msg);
}

/* =====================================
   INPUT DELIVERY CHANGED ACCORDINGLY
===================================== */

function updateDeliveryField() {
  const delivery = cart.delivery;
  const field = document.getElementById("deliveryDetails");
  if (!field) return;

  if (delivery === "email") {
    field.placeholder = "Enter email address";
    field.value = "";
    field.setAttribute("type", "email");
  } else {
    field.placeholder = "Enter full address, name & phone number";
    field.value = "";
    field.removeAttribute("type");
  }
}
/* =====================================
   CAPTURE TEXTAREA INPUT
===================================== */
document.addEventListener("input", e => {
  if (e.target.id === "deliveryDetails") {
    cart.deliveryDetails = e.target.value.trim();
  }
});

/* =====================================
   WHATSAPP AND TELEGRAM CALL BUTTON
===================================== */
function openWhatsAppOrder() {
  const url = "https://wa.me/601113127911?text=" + buildWhatsAppMessage();
  window.open(url, "_blank");
}

function openTelegramOrder() {
  const msg = buildWhatsAppMessage();
  const url = "https://t.me/share/url?url=&text=" + msg;
  window.open(url, "_blank");
}

/* =====================================
   GOOGLE FORM
===================================== */
document.addEventListener("click", e => {
  if (e.target.id === "submitGoogleForm") {
    window.open(buildGoogleFormURL(), "_blank");
  }
});

function buildGoogleFormURL() {
  let books = [];
  let total = 0;

  cart.items.forEach(item => {
    books.push(`${item.title} (RM${item.price})`);
    total += item.price;
  });

  if (cart.delivery === "courier") total += 17;

  const base = "https://docs.google.com/forms/d/e/1FAIpQLSd6LUWZbLaj4qtmSLT1tKeKL5kqFeVuuvf6lk3uq2sy6aChmA/viewform?";

  const params = new URLSearchParams({
    [FORM.orderId]: cart.orderId,
    [FORM.books]: books.join(" | "),
    [FORM.total]: `RM${total}`,
    [FORM.method]: cart.delivery,
    [FORM.delivery]: cart.deliveryDetails
  });

  return base + params.toString();
}



/* =====================================
   AUTO-GENERATE ORDER ID
===================================== */
function generateOrderId() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);

  return `ORD-${y}${m}${d}-${rand}`;
}
