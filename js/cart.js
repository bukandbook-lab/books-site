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

const SHIPPING_FEE = 10;
const THUMB_DRIVE_FEE = 7;

/* =====================================
   DEFINE FOR GOOGLE FORM INPUT
===================================== */
const FORM = {
  orderId: "entry.2127120340",
  books:   "entry.1876655214",
  total:   "entry.621883004",
  method:  "entry.189390956",
  delivery:"entry.553879654",
};

/* =====================================
   ADD TO CART (GRID + POPUP)
===================================== */
document.addEventListener("click", e => {
  const icon =
    e.target.closest(".cart-icon[data-book-id]") ||
    e.target.closest(".price-box[data-book-id]");

  if (!icon) return;
   
  e.stopPropagation();   // 👈 add this
   
  const bookId = icon.dataset.bookId;
  if (!bookId) return;

  const book = BOOK_REGISTRY[bookId];
  if (!book) {
    console.error("Book not found in registry:", bookId);
    return;
  }

  cart.items.set(bookId, {
    title: book.title,
    price: Number(book.price),
    setQtty: Number(book.SetQtty || 0)
  });

  renderCart();
  syncCartIcons();   
  openCart();

  // auto-close popup if click came from popup
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
  syncCartIcons();
});
/* =====================================
   CLOSE CART WHEN X MARK IS CLICKED
===================================== */
document.addEventListener("click", e => {
  if (e.target.closest("#Cart .close-popup")) {
    document.getElementById("Cart")?.classList.remove("open");
  }
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
   TERMS CHECKBOX + PAY BUTTON STATE
===================================== */
document.addEventListener("change", e => {
  if (e.target.id === "agreeTerms") {
    cart.agreed = e.target.checked;
    updatePayButton();
  }
});


/* =====================================
   PAY BUTTON VISUAL STATE ONLY
===================================== */
function updatePayButton() {
  const payBtn = document.getElementById("clickToPay");
  if (!payBtn) return;

  const canPay = cart.items.size > 0 && cart.agreed;

  if (canPay) {
    payBtn.classList.add("active");
  } else {
    payBtn.classList.remove("active");
  }
}

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
        <span>
           ${index}. ${item.title}
           ${item.setQtty > 0 && item.price !== 1
           ? ` (${item.setQtty} books)`
           : ``}
        </span>

        <span class="price-right">
          <span>RM${item.price}</span>
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

  const totals = calculateTotals();
  
  box.innerHTML = `
   <span class="close-popup" alt="Close">X</span>
   <h3>CART</h3>
    ${itemsHTML || "<p>No item selected</p>"}

    
    <div class="cart-fee">
      <span><b>SUBTOTAL</b></span>
      <span><b>RM${totals.booksSubtotal}</b></span>
    </div>
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
    </div><br>

         <div class="delivery-details">
     <b>Delivery Details</b><br>
        <textarea
          id="deliveryDetails"
          rows="2"
          required
          placeholder="Enter email address"
          style="width:100%; margin-top:6px;"
        ></textarea>
   </div><br>
   
${cart.delivery === "courier" ? `
  <div class="cart-fee">
    <span>Shipping Fee</span>
    <span>RM${totals.shippingFee}</span>
  </div>
  <div class="cart-fee">
    <span>Thumb Drive Charge</span>
    <span>RM${totals.thumbFee}</span>
  </div>
` : ""}

<hr>

     <div class="total-row">
        <span><b>GRAND TOTAL</b></span>
        <span><b>RM${totals.grandTotal}</b></span>
     </div><br>

    <label class="terms">
      <input type="checkbox" id="agreeTerms" ${cart.agreed ? "checked" : ""}>
      By clicking to pay, I have read and agreed to the Terms and Conditions described in 'READ ME FIRST' section.
    </label><br>

    <div class="cart-actions">
      <button id="continueShopping">CONTINUE SHOPPING</button>
      <button id="clickToPay">
        CLICK TO PAY
      </button>
    </div>
  `;

  updatePayButton();
  updateDeliveryField();

}


/* =====================================
   CLICK TO PAY
===================================== */
document.addEventListener("click", e => {
  if (e.target.id !== "clickToPay") return;
  if (cart.items.size === 0) {
    alert("Your cart is empty.");
    return;
  }

  if (!cart.agreed) {
    alert("Please agree to the terms and conditions.");
    return;
  }

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

  // ✅ NOW SAFE TO PROCEED

  cart.deliveryDetails = deliveryField.value.trim();
   
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

    // 1️⃣ Send Telegram automatically
  sendOrderToTelegram();
   
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
if (
  e.target.closest(".cart-icon") ||
  e.target.closest(".price-box") ||
  e.target.id === "clickToPay"
) return;

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
    msg += `${i}. ${item.title}`;
      if (item.setQtty > 0 && item.price !== 1) {
        msg += ` (${item.setQtty} books)`;
        }
        msg += ` [RM${item.price}]\n`;
    i++;
  });

let total = 0;
cart.items.forEach(i => total += i.price);

if (cart.delivery === "courier") {
  msg += `\n🚚 *Courier Charges:*\n`;
  msg += `• Shipping Fee: RM${SHIPPING_FEE}\n`;
  msg += `• Thumb Drive: RM${THUMB_DRIVE_FEE}\n`;
  total += SHIPPING_FEE + THUMB_DRIVE_FEE;
}


  msg += `\n💰 *Total:* RM${total}\n`;
  msg += `🚚 *Delivery Method:* ${cart.delivery.toUpperCase()}\n`;

  msg += `📝 *Delivery Details:*\n${cart.deliveryDetails || "Not provided"}\n\n`;

  msg += `📸 *Payment Screenshot:* (attached below)\n`;

  return encodeURIComponent(msg);
}
/* =====================================
   TELEGRAM MESSAGE
===================================== */
function buildTelegramMessage() {
  let msg = `🛒 *NEW ORDER*\n\n`;

  msg += `🆔 *Order ID:* ${cart.orderId}\n\n`;

  msg += `📚 *Books Ordered:*\n`;
  let i = 1;
  let total = 0;

  cart.items.forEach(item => {
    msg += `${i}. ${item.title}`;
      if (item.setQtty > 0 && item.price !== 1) {
      msg += ` (${item.setQtty} books)`;
    }
    msg += ` [RM${item.price}]\n`;
    total += item.price;
    i++;
  });

  if (cart.delivery === "courier") {
    msg += `\n🚚 Shipping Fee: RM10`;
    msg += `\n💾 Thumb Drive: RM7`;
    total += 17;
  }

  msg += `\n\n💰 *TOTAL:* RM${total}\n`;
  msg += `📦 *Delivery Method:* ${cart.delivery.toUpperCase()}\n`;
  msg += `📝 *Delivery Details:*\n${cart.deliveryDetails}\n`;

  return msg;
}



/* =====================================
   INPUT DELIVERY CHANGED ACCORDINGLY
===================================== */

function updateDeliveryField() {
  const delivery = cart.delivery;
  const field = document.getElementById("deliveryDetails");
  if (!field) return;

  field.value = cart.deliveryDetails || ""; // ✅ keep value

  if (delivery === "email") {
    field.placeholder = "Enter email address";
    field.setAttribute("type", "email");
  } else {
    field.placeholder = "Enter full address, name & phone number";
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
   WHATSAPP CALL BUTTON
===================================== */
function openWhatsAppOrder() {
  if (!cart.orderId) {
    cart.orderId = generateOrderId();
  }

  // 1️⃣ Send Telegram automatically
  sendOrderToTelegram();

  // 2️⃣ Open WhatsApp
  const url =
    "https://wa.me/601113127911?text=" +
    buildWhatsAppMessage();

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
  const totals = calculateTotals();

  let books = [];
  let totals = 0;
  let i = 1;

  cart.items.forEach(item => {
  let line = `${i}. ${item.title}`;
      if (item.setQtty > 0 && item.price !== 1) {
        line += ` (${item.setQtty} books)`;
        }
      line += ` [RM${item.price}]`;
  books.push(line);
  SUBTOTAL: RM${totals.booksSubtotal};
  i++;
});

  let feeLines = "";

if (cart.delivery === "courier") {
  feeLines =
    `Shipping Fee: RM${SHIPPING_FEE}\n` +
    `Thumb Drive Charge: RM${THUMB_DRIVE_FEE}`;
  totals += SHIPPING_FEE + THUMB_DRIVE_FEE;
}


  const base = "https://docs.google.com/forms/d/e/1FAIpQLSd6LUWZbLaj4qtmSLT1tKeKL5kqFeVuuvf6lk3uq2sy6aChmA/viewform?usp=pp_url&";

  const params = new URLSearchParams({
    [FORM.orderId]: cart.orderId,
    [FORM.books]:
  books.join("\n") +
  (feeLines ? "\n\n" + feeLines : ""),
    [FORM.total]:
`Books: RM${totals.booksSubtotal}
Shipping: RM${totals.shippingFee}
Thumb Drive Charge: RM${totals.thumbFee}
-----------------
TOTAL: RM${totals.grandTotal}`,
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
/* =====================================
   SUB AND TOTAL CALCULATION
===================================== */
function calculateTotals() {
  let booksSubtotal = 0;

  cart.items.forEach(item => {
    booksSubtotal += item.price;
  });

  let shippingFee = 0;
  let thumbFee = 0;

  if (cart.delivery === "courier") {
    shippingFee = SHIPPING_FEE;
    thumbFee = THUMB_DRIVE_FEE;
  }

  const grandTotal = booksSubtotal + shippingFee + thumbFee;

  return {
    booksSubtotal,
    shippingFee,
    thumbFee,
    grandTotal
  };
}

/* =====================================
  SEND TELEGRAM MESSAGE
===================================== */

function sendOrderToTelegram() {
  if (cart.items.size === 0) {
    alert("Cart is empty. Cannot send order.");
    return;
  }

  if (!cart.orderId) {
    cart.orderId = generateOrderId();
  }

  if (!cart.deliveryDetails) {
    alert("Delivery details missing.");
    return;
  }

  const GAS_URL =
    "https://script.google.com/macros/s/AKfycbzgoBsTH0p0KYHaw9T6IgFn_Aepp_n1UoEe-zPW6A41xnZXnpzh4k1WykOi_A3SXzuK/exec";

  fetch(GAS_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: buildTelegramMessage()
    })
  });

  
}


/* =====================================
  AUTO SHOW/HIDE ARROWS
===================================== */
const tabs = document.getElementById("tabsContainer");
const arrowLeft = document.getElementById("tabArrowLeft");
const arrowRight = document.getElementById("tabArrowRight");

/* Update arrow visibility */
function updateTabArrows() {
  const maxScrollLeft = tabs.scrollWidth - tabs.clientWidth;

  arrowLeft.style.display = tabs.scrollLeft > 5 ? "block" : "none";
  arrowRight.style.display = tabs.scrollLeft < maxScrollLeft - 5 ? "block" : "none";
}

/* Arrow click scroll */
arrowLeft.addEventListener("click", () => {
  tabs.scrollBy({ left: -120, behavior: "smooth" });
});

arrowRight.addEventListener("click", () => {
  tabs.scrollBy({ left: 120, behavior: "smooth" });
});

/* Listen to scroll */
tabs.addEventListener("scroll", updateTabArrows);

/* Initial check */
window.addEventListener("load", updateTabArrows);
window.addEventListener("resize", updateTabArrows);

/* =====================================
  CART ICON TO CHECK MARK
===================================== */
function syncCartIcons() {
  document.querySelectorAll(".cart-icon[data-book-id]").forEach(icon => {
    const bookId = icon.dataset.bookId;
    if (cart.items.has(bookId)) {
      icon.src = CHECK_ICON;
      icon.classList.add("in-cart");
    } else {
      icon.src = CART_ICON;
      icon.classList.remove("in-cart");
    }
  });
}
