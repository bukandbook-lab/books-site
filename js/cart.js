/* =====================================
   CART STATE (SINGLE SOURCE OF TRUTH)
===================================== */
let lastScrollY = 0;

const cart = {
  items: new Map(),
  delivery: "email",
  deliveryDetails: "",
  agreed: false,
  orderId: ""
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

  /* ==========================
     REQUEST BOOK PRICE BOX
  ========================== */
  const requestBox = e.target.closest(".request-price-box");
  if (requestBox) {
    e.preventDefault();
    e.stopPropagation();

    const bookId = requestBox.dataset.bookId;
    addToCart(bookId, requestBox);
    return; // 🚫 STOP HERE
  }

  /* ==========================
     NORMAL GRID / POPUP CART
  ========================== */
  const normalBox = e.target.closest(".price-box");
  if (!normalBox) return;

  // ignore request ones (safety)
  if (normalBox.classList.contains("request-price-box")) return;

  e.preventDefault();
  e.stopPropagation();

  const bookId = normalBox.dataset.bookId;
  addToCart(bookId);
});

/* ===================================
   ADD TO CART FUNCTION
===================================== */
function addToCart(bookId, sourceEl = null) {
  const id = String(bookId);
  let book = BOOK_REGISTRY[id];

// 🔥 CUSTOM REQUEST BOOK / SERIES (based on user radio)
if (!book && sourceEl) {
  const rawTitle = sourceEl.dataset.title?.trim();

  if (!rawTitle) {
    alert("Please enter a book title first 😊");
    return;
  }

// 🔑 READ USER CHOICE HERE
const row = sourceEl.closest(".req-book-row");
const requestType = row?.dataset.requestType;

if (!requestType) {
  alert("Please choose Book or Series first 😊");
  return;
}

const label =
  requestType === "series"
    ? "Request for Series"
    : "Request for Book";

book = {
  id,
  title: `${label} : ${rawTitle}` +
         (sourceEl.dataset.author ? ` by ${sourceEl.dataset.author}` : "") +
         (sourceEl.dataset.specific ? ` - ${sourceEl.dataset.specific}` : ""),
  price: Number(sourceEl.dataset.price || 1),
};

}

  if (!book) return;

cart.items.set(id, {
  id: book.id,
  title: book.title,
  price: Number(book.price),
  setQtty: Number(book.SetQtty || 1),
});


  renderCart();
  syncCartIcons();
  openCart?.();

}


/* =====================================
   OPEN / CLOSE CART
===================================== */
function openCart() {
  scrollY = window.scrollY;

  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";

  document.getElementById("Cart").classList.add("open");
}

function closeCart() {
  document.getElementById("Cart").classList.remove("open");

  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";

  window.scrollTo(0, scrollY);
}


  // 🔑 restore scroll AFTER cart closes
  requestAnimationFrame(() => {
    window.scrollTo({ top: lastScrollY, behavior: "instant" });
  });



document.addEventListener("click", e => {
  if (e.target.id === "continueShopping") closeCart();
  if (e.target.closest("#Cart .close-popup")) closeCart();
});

document.addEventListener("click", e => {
  const cartBox = document.getElementById("Cart");
  if (!cartBox || !cartBox.classList.contains("open")) return;

  // ❌ clicked inside cart → ignore
  if (e.target.closest("#Cart")) return;

  // ❌ clicked on cart-trigger → ignore
  if (
    e.target.closest(".price-box") ||
    e.target.closest(".cart-icon")
  ) return;

  // ✅ clicked outside → close cart
  closeCart();
});

/* =====================================
   REMOVE ITEM (KEEP CART OPEN)
===================================== */
document.addEventListener("click", e => {
  const btn = e.target.closest(".remove-item");
  if (!btn) return;

  e.stopPropagation();
  cart.items.delete(btn.dataset.bookId);
  renderCart();
  syncCartIcons();
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
   CLICK-TO-PAY BUTTON VISUAL STATE ONLY
===================================== */
function updatePayButton() {
  const btn = document.getElementById("clickToPay");
  if (!btn) return;

  btn.classList.toggle(
    "active",
    cart.items.size > 0 && cart.agreed
  );
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
             ? ` (${item.setQtty} ${item.setQtty === 1 ? "book" : "books"})`
             : ``}
        </span>


        <span class="price-right">
          <span>RM${item.price.toFixed(2)}</span>
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
   <span class="close-popup" alt="Close">X</span><br/>
   <img width="310px" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEizaRTKOl-aY1N1Yow8inrZ3ckmIY8829lxqWEXWWW82MhQazqWvSMg3Q7zvWvciJva0TsROrTv-J7UaGClKaCI3AIw22hMDkQzjyU0HK4GoK3dVvjJ74YT6NY7JK9DXvGQXsdZgKMtmED9PRyFzPLkB3tI-dAlkPeczh2Oxx7J4qFCOLVdY5CKF27N_eQW/s1600/Header%203.jpg"/>
   <br/><span class="CartTitle">CART</span>
    ${itemsHTML || "<p>No item selected</p>"}

    
    <div class="cart-fee">
      <span><b>SUBTOTAL</b></span>
      <span><b>RM${totals.booksSubtotal.toFixed(2)}</b></span>
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
   </div>
   
${cart.delivery === "courier" ? `
  <br><div class="cart-fee">
    <span>Shipping Fee</span>
    <span>RM${totals.shippingFee.toFixed(2)}</span>
  </div>
  <div class="cart-fee">
    <span>Thumb Drive Charge</span>
    <span>RM${totals.thumbFee.toFixed(2)}</span>
  </div>
` : ""}

<hr>

     <div class="total-row">
        <span><b>GRAND TOTAL</b></span>
        <span><b>RM${totals.grandTotal.toFixed(2)}</b></span>
     </div><br>

    <label class="terms">
      <input type="checkbox" id="agreeTerms" ${cart.agreed ? "checked" : ""}>
      By clicking to pay, I have read and agreed to the <span id="openTerms" class="terms-link">Terms and Conditions.</span>
    </label><br>
    
<div id="termsBox" class="terms-box hidden">
  <b>TERMS AND CONDITIONS</b>
  <button type="button" class="terms-close" id="closeTerms">✕</button>

  <div class="terms-content">
    <p>
      • No physical book and ONLY digital copy will be delivered.<br>
      • <b>Payment is for our cataloging and delivery service.</b> Only proceed to ‘Click to Pay’ if you accept it.<br>
      • Digital copy might be in .pdf, .epub or other file type.<br>
      • Buyer might need to install E-book Reader first.<br>
      • There is no guarantee the condition of the e-books is perfect. But all e-books are readable.<br>
      • Book images and videos are for illustration purposes only; actual book condition and content may vary by edition or print.<br>
      • Order will ONLY be processed with payment proof and complete delivery details.<br>
      • Delivery timelines may vary.<br>
      • No guarantee for specific outcomes, results, or satisfaction.<br>
      • No refund. Pay at your own risk. You can try buy 1 book first.<br>
      • Special requests may take longer to process.<br>
      • Additional terms apply.<br>
      • More explanation about Terms and Conditions can be found in MAIN section.<br>
    </p>
  </div>
</div>

  <div class="cart-actions">
  <button id="continueShopping">CONTINUE SHOPPING</button>
  <button id="clickToPay">CLICK TO PAY</button>
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
  Please bank in <b>RM${total.toFixed(2)}</b> to:<br><br>
  <b>Account Number:</b><br>
  1234567890 (Maybank)<br><br>

  Once payment is made, choose how you want to submit your order below 👇
`;


// 🔓 OPEN PAYMENT POPUP
const paymentPopup = document.getElementById("paymentPopup");

if (paymentPopup) {
  paymentPopup.style.display = "flex"; // 🔑 REQUIRED
  requestAnimationFrame(() => {
    paymentPopup.classList.add("show"); // animation
  });
}


});


/* =====================================
   STANDARDIZED ORDER DATA
===================================== */
function buildOrderData() {
  const totals = calculateTotals();

  let bookLines = [];
  let i = 1;

  cart.items.forEach(item => {
    let line = `${i}. ${item.title}`;
    if (item.setQtty > 0 && item.price !== 1) {
      line += ` (${item.setQtty} books)`;
    }
    line += ` [RM${item.price.toFixed(2)}]`;
    bookLines.push(line);
    i++;
  });

  return {
    orderId: cart.orderId,
    booksText: bookLines.join("\n"),
    delivery: cart.delivery.toUpperCase(),
    deliveryDetails: cart.deliveryDetails || "Not provided",
    totals
  };
}

/* =====================================
   WHATSAPP MESSAGE
===================================== */
function openWhatsAppOrder() {
  if (!cart.orderId) cart.orderId = generateOrderId();

  // Auto-send Telegram
  sendOrderToTelegram();

  showThankYou();

  const url =
    "https://wa.me/601113127911?text=" +
    encodeURIComponent(buildWhatsAppMessage());

  window.open(url, "_blank");
}

function buildWhatsAppMessage() {
  const data = buildOrderData();
  const t = data.totals;

  let msg = `🛒 *NEW ORDER*\n\n`;
  msg += `📦 *Order ID:* ${data.orderId}\n\n`;
  msg += `📚 *List of Books:*\n${data.booksText}\n\n`;

  msg += `💵 *Payment Breakdown*\n`;
  msg += `📚 Subtotal: RM${t.booksSubtotal.toFixed(2)}\n`;

  if (cart.delivery === "courier") {
    msg += `🚚 Shipping: RM${t.shippingFee.toFixed(2)}\n`;
    msg += `💾 Thumb Drive: RM${t.thumbFee.toFixed(2)}\n`;
  }

  msg += `\n💰 *TOTAL: RM${t.grandTotal.toFixed(2)}*\n\n`;
  msg += `🚚 *Delivery Method:* ${data.delivery}\n`;
  msg += `📝 *Delivery Details:*\n${data.deliveryDetails}\n\n`;
  msg += `📸 *Payment Screenshot:* (attach below)`;

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
    field.placeholder = "Enter name, full address & phone number";
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
   GOOGLE FORM
===================================== */
function buildGoogleFormURL() {
  const data = buildOrderData();
  const t = data.totals;

  const base =
    "https://docs.google.com/forms/d/e/1FAIpQLSd6LUWZbLaj4qtmSLT1tKeKL5kqFeVuuvf6lk3uq2sy6aChmA/viewform?usp=pp_url&";

  const params = new URLSearchParams({
    [FORM.orderId]: data.orderId,
    [FORM.books]:
      data.booksText,
    [FORM.total]:
`Subtotal: RM${t.booksSubtotal.toFixed(2)}
Shipping: RM${t.shippingFee.toFixed(2)}
Thumb Drive: RM${t.thumbFee.toFixed(2)}
-----------------
TOTAL: RM${t.grandTotal.toFixed(2)}`,
    [FORM.method]: cart.delivery,
    [FORM.delivery]: data.deliveryDetails
  });

  return base + params.toString();
}

/* =====================================
   GOOGLE FORM BUTTON HANDLER
===================================== */
const submitGoogleBtn = document.getElementById("submitGoogleForm");

if (submitGoogleBtn) {
  submitGoogleBtn.addEventListener("click", () => {
    showThankYou();

    if (!cart.orderId) {
      cart.orderId = generateOrderId();
    }

    const url = buildGoogleFormURL();
    window.open(url, "_blank");
  });
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
    booksSubtotal += item.price; // ✅ NUMBER
  });

  const shippingFee = cart.delivery === "courier" ? SHIPPING_FEE : 0;
  const thumbFee = cart.delivery === "courier" ? THUMB_DRIVE_FEE : 0;

  return {
    booksSubtotal,
    shippingFee,
    thumbFee,
    grandTotal: booksSubtotal + shippingFee + thumbFee
  };
}


/* =====================================
  SEND TELEGRAM MESSAGE
===================================== */

function sendOrderToTelegram() {
  if (cart.items.size === 0) return;

  if (!cart.orderId) cart.orderId = generateOrderId();

  const GAS_URL =
    "https://script.google.com/macros/s/AKfycbweTm7EFKqTFfWbVE85NJ4UEupxJ_m9QfVb7wk3eaWqm-8fDVFOXK27mgYo5YhciSOI/exec";

  fetch(GAS_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: buildTelegramMessage()
    })
  });
}

function buildTelegramMessage() {
  const data = buildOrderData();
  const t = data.totals;

  let msg = `🛒 *NEW ORDER*\n\n`;
  msg += `🆔 *Order ID:* ${data.orderId}\n\n`;
  msg += `📚 *List of Books:*\n${data.booksText}\n\n`;

  msg += `💵 *Payment Breakdown*\n`;
  msg += `📚 Subtotal: RM${t.booksSubtotal.toFixed(2)}\n`;

  if (cart.delivery === "courier") {
    msg += `🚚 Shipping: RM${t.shippingFee.toFixed(2)}\n`;
    msg += `💾 Thumb Drive: RM${t.thumbFee.toFixed(2)}\n`;
  }

  msg += `\n💰 *TOTAL: RM${t.grandTotal.toFixed(2)}*\n\n`;
  msg += `📦 *Delivery Method:* ${data.delivery}\n`;
  msg += `📝 *Delivery Details:*\n${data.deliveryDetails}`;

  return msg;
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
    const id = icon.dataset.bookId;
    const inCart = cart.items.has(id);

    icon.src = inCart ? CHECK_ICON : CART_ICON;
    icon.classList.toggle("in-cart", inCart);
  });
}

/* =====================================
  RESET CART
===================================== */

function resetCart() {
  cart.items.clear();
  cart.delivery = "email";
  cart.deliveryDetails = "";
  cart.agreed = false;
  cart.orderId = "";

  renderCart();
  syncCartIcons();

  // Close cart UI if open
  document.getElementById("Cart")?.classList.remove("open");
}

/* =====================================
  CART TERMS AND CONDITIONS
===================================== */
document.addEventListener("click", e => {
  if (e.target.id === "openTerms") {
    document.getElementById("termsBox")?.classList.remove("hidden");
  }

  if (e.target.id === "closeTerms") {
    document.getElementById("termsBox")?.classList.add("hidden");
  }
});

/* =====================================
   PAYMENT POPUP 
===================================== */
document.addEventListener("click", e => {
  const paymentPopup = document.getElementById("paymentPopup");
  if (!paymentPopup || paymentPopup.style.display !== "flex") return;

  // ❌ Close when X is clicked
if (paymentPopup) {
  const closeBtn = paymentPopup.querySelector(".close-popup");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      paymentPopup.style.display = "none";
    });
  }
}

  // ❌ Close when clicking outside content
  if (e.target === paymentPopup) {
    paymentPopup.style.display = "none";
  }
});



/* =====================================
   THANK YOU POPUP (DELIVERY-AWARE)
===================================== */
function showThankYou() {
  const paymentPopup = document.getElementById("paymentPopup");
  const thankYou = document.getElementById("thankYou");
  const thankYouMsg = document.getElementById("thankYouMsg");

  if (!thankYou) return;

  // Close payment popup
  if (paymentPopup) {
    paymentPopup.classList.remove("show");
    paymentPopup.style.display = "none";
  }

  const delivery =
    document.querySelector("input[name='delivery']:checked")?.value;

  const msg =
    "Thank you for your order. Please ensure payment proof has been submitted too.<br><br>Your order will be delivered within <b>" +
    (delivery === "email" ? "18 hours" : "3 days") +
    "</b>.";

  if (thankYouMsg) {
    thankYouMsg.innerHTML = msg;
  }

  // 🔥 SHOW THANK YOU POPUP PROPERLY
  thankYou.style.display = "flex";
  requestAnimationFrame(() => {
    thankYou.classList.add("show");
  });
   
  // 🔥 AUTO-CLEAR CART (DELAY = SAFE)
  setTimeout(() => {
    resetCart();
  }, 300);
}

/* =====================================
   THANK YOU POPUP – MASTER CLOSE HANDLER
===================================== */
document.addEventListener("click", e => {
  const thankYou = document.getElementById("thankYou");
  if (!thankYou || !thankYou.classList.contains("show")) return;

  if (
    e.target.closest("#thankYou .close-popup") ||
    !e.target.closest("#thankYou .popup-content")
  ) {
    thankYou.classList.remove("show");
    setTimeout(() => {
      thankYou.style.display = "none";
    }, 250);
  }
});


/* =====================================
   FOR PAYMENT POPUP
===================================== */
const paymentPopup = document.getElementById("paymentPopup");

if (paymentPopup) {
  const content = paymentPopup.querySelector(".popup-content");

  if (content) {
    content.addEventListener("click", e => {
      e.stopPropagation(); // ✅ keep popup open when clicking inside
    });
  }
}
