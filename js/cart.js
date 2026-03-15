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
   
   const img = normalBox
     .closest(".book-thumb")
     ?.querySelector(".grid-book-img");
   
   if (img) flyToCart(img);
   
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
if (!row) return;

const requestType =
  row.querySelector('input[type="radio"][value="series"]:checked')
    ? "series"
    : "book";

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
  series: book.Series || "",
});


   renderCart();
   syncCartIcons();
   updateCartBadge();
   showToast("Added to Cart ✓");

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
     e.target.closest(".cart-icon") ||
     e.target.closest("#headerCartBtn")
   ) return;

  // ✅ clicked outside → close cart
  closeCart();
});
/* =====================================
   FUNCTION TO UPDATE CART BADGE
===================================== */
function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;

  const count = cart.items.size;

  if (!count) {
    badge.textContent = "";
    badge.style.display = "none";   // 🔥 force hide
    return;
  }

  badge.textContent = count;
  badge.style.display = "flex";     // 🔥 force show

// 🔥 shake + bump animation trigger
  badge.classList.add("bump");
  const headerIcon = document.getElementById("headerCartBtn");
  headerIcon?.classList.add("shake");

  setTimeout(() => {
    badge.classList.remove("bump");
    headerIcon?.classList.remove("shake");
  }, 400);
}
/* =====================================
   OPEN CART ONLY FROM HEADER ICON
===================================== */
document.addEventListener("click", e => {
  const btn = e.target.closest("#headerCartBtn");
  if (!btn) return;

  if (cart.items.size === 0) {
    showToast("Your cart is empty 😊");
    return;
  }

  openCart();
});
/* =====================================
   Flying To Cart Animation
===================================== */
function flyToCart(imgElement) {
  const cartIcon = document.getElementById("headerCartBtn");
  if (!imgElement || !cartIcon) return;

  const imgRect = imgElement.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  const clone = imgElement.cloneNode(true);

  clone.style.position = "fixed";
  clone.style.left = imgRect.left + "px";
  clone.style.top = imgRect.top + "px";
  clone.style.width = imgRect.width + "px";
  clone.style.height = imgRect.height + "px";
  clone.style.transition =
    "all 0.8s cubic-bezier(.2,1.2,.4,1)";
  clone.style.zIndex = "9999";
  clone.style.pointerEvents = "none";

  document.body.appendChild(clone);

  requestAnimationFrame(() => {
    clone.style.left = cartRect.left + 10 + "px";
    clone.style.top = cartRect.top + 10 + "px";
    clone.style.width = "18px";
    clone.style.height = "18px";
    clone.style.opacity = "0.6";
    clone.style.transform = "scale(0.6)";
  });

  setTimeout(() => clone.remove(), 800);
}
/* =====================================
   FUNCTION FOR ADDED TO CART SHOW TOAST
===================================== */
function showToast(message) {
  const toast = document.getElementById("cartToast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toast._timer);

  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}
/* =====================================
   CLICK HANDLER TO SHOW CART CLEARED
===================================== */
document.addEventListener("click", e => {
  if (e.target.id !== "clearCartBtn") return;

  if (cart.items.size === 0) return;

  cart.items.clear();
   
  renderCart();
  updateCartBadge();
  syncCartIcons?.();

  showToast("Cart cleared 🗑️");
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
   updateCartBadge();
   syncCartIcons?.();
   showToast("Removed from cart ❌");

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

   const deliveryLabel =
  cart.delivery === "email"
    ? "Gmail"
    : "Delivery Details";
   
  let total = 0;
  let index = 1;
  let itemsHTML = "";

  cart.items.forEach((item, id) => {
    total += item.price;

    itemsHTML += `
      <div class="cart-row">
        <span>
           ${index}. ${item.series ? `${item.series} - ` : ""}${item.title}
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
   <span class="CartTitle">CART</span>  
    ${itemsHTML || "<p>No items selected</p>"}
   <div style="text-align:right;">
   <button id="clearCartBtn" class="clear-cart-btn">CLEAR CART</button></div>

    
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
        Gmail
      </label><br>

      <label>
        <input type="radio" name="delivery" value="courier"
          ${cart.delivery === "courier" ? "checked" : ""}>
        Courier
      </label>
    </div><br>

         <div class="delivery-details">
           <b>${deliveryLabel}</b><br>
           <textarea
             id="deliveryDetails"
             rows="2"
             required
             placeholder="${
               cart.delivery === "email"
                 ? "Enter your Gmail (example@gmail.com)"
                 : "Enter your name, full address & phone number"
             }"
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
  const email = deliveryField.value.trim().toLowerCase();
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (!gmailRegex.test(email)) {
    alert("Only Gmail is accepted. Please enter a valid Gmail address.");
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

renderInvoice();
   
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
  booksText: bookLines.join("\n"),   // Telegram-friendly
  booksRaw: [...cart.items.values()], // FULL DATA WITH SERIES
  delivery: cart.delivery,
  deliveryDetails: cart.deliveryDetails || "Not provided",
  paymentProofUrl: cart.paymentProofUrl || "",
  totals
};

}

/* =====================================
   INPUT DELIVERY CHANGED ACCORDINGLY
===================================== */

function updateDeliveryField() {
  const delivery = cart.delivery;
  const field = document.getElementById("deliveryDetails");
  if (!field) return;

  field.value = cart.deliveryDetails || ""; // ✅ keep value
 field.value = field.value.trim().toLowerCase();

  if (delivery === "email") {
    field.placeholder = "Enter your Gmail (example@gmail.com)";
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
  updateCartBadge();

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
  INVOICE TERMS AND CONDITIONS
===================================== */
document.addEventListener("click", e => {
  if (e.target.id === "invoiceOpenTerms") {
    document.getElementById("invoiceTermsBox")?.classList.remove("hidden");
  }

  if (e.target.id === "invoicecloseTerms") {
    document.getElementById("invoiceTermsBox")?.classList.add("hidden");
  }
});

/* =====================================
    INVOICE IN PAYMENT POPUP 
===================================== */
function renderInvoice() {

  if (cart.items.size === 0) {
    alert("Cart is empty!");
    return;
  }

  const invoiceLabel =
  cart.delivery === "email"
    ? "Gmail"
    : "Delivery Details";
   
  const totals = calculateTotals();
   
  const hasQty = [...cart.items.values()].some(
  item => item.setQtty && item.setQtty > 1
  );

  const totalColumns =
  2 +           // Index + Title (Series merged here)
  (hasQty ? 1 : 0) +
  1;            // Price

   // Columns before price column
   const mergeColumns = totalColumns - 1;
   let booksHtml = "";
   let index = 1;
   
   cart.items.forEach((item) => {
   
     booksHtml += `<tr>`;
   
     // Index
     booksHtml += `<td style="text-align:center;">${index}</td>`;
   
      // Title (Series merged)
      const titleText = item.series
        ? `<b>${item.series}</b> - ${item.title}`
        : item.title;
      
      booksHtml += `<td>${titleText}</td>`;
   
     // Quantity column (only if needed)
     if (hasQty) {
       booksHtml += `<td style="text-align:center;">
         ${item.setQtty && item.setQtty > 1 ? item.setQtty : ""}
       </td>`;
     }
   
     // Price
     booksHtml += `
       <td style="text-align:right;">
         RM${item.price.toFixed(2)}
       </td>
     `;
   
     booksHtml += `</tr>`;
   
     index++;
   });

         let headerHtml = `
      <tr>
        <th style="width:3%">No.</th>
        <th style="width:82%">Title</th>
      `;
           
      if (hasQty) {
        headerHtml += `<th style="width:5%">Qtty</th>`;
      }
      
      headerHtml += `
        <th style="width:10%">Price</th>
      </tr>
      `; 

      // ADD TOTAL ROWS AFTER LOOP
      booksHtml += `
      <tr>
        <td colspan="${mergeColumns}" style="text-align:right; font-weight:bold;">
          Subtotal
        </td>
        <td style="text-align:right; font-weight:bold;">
          RM${totals.booksSubtotal.toFixed(2)}
        </td>
      </tr>
      `;
      
      if (cart.delivery === "courier") {
        booksHtml += `
        <tr>
          <td colspan="${mergeColumns}" style="text-align:right;">
            Shipping Fee
          </td>
          <td style="text-align:right;">
            RM${totals.shippingFee.toFixed(2)}
          </td>
        </tr>
        <tr>
          <td colspan="${mergeColumns}" style="text-align:right;">
            Thumb Drive Charge
          </td>
          <td style="text-align:right;">
            RM${totals.thumbFee.toFixed(2)}
          </td>
        </tr>
        `;
      }
      
      booksHtml += `
      <tr>
        <td colspan="${mergeColumns}" style="text-align:right; font-weight:bold;">
          GRAND TOTAL
        </td>
        <td style="text-align:right; font-weight:bold;">
          RM${totals.grandTotal.toFixed(2)}
        </td>
      </tr>
      `;
    
    const invoiceHTML = `
    <img src="${CLOSE_ICON}" class="close-popup" alt="Close"><br/>
    <div style="text-align:left;">

     <table border="1" width="100%" cellpadding="6" cellspacing="0">
        <thead>
          ${headerHtml}
        </thead>
        <tbody>
          ${booksHtml}
        </tbody>
      </table>
      <br>

      <div>
         <strong>${invoiceLabel}:</strong> ${cart.deliveryDetails}
      </div>

      <br>
      <div>
        <label style="font-size:14px;"><b><u>STEP 2 >> Upload Payment Proof</u></b></label><br>
        Please bank in <b>RM${totals.grandTotal.toFixed(2)}</b> to account number 121312144555355 (Boost).<br>
        <input type="file" id="paymentProof" accept="image/*,.pdf">
      </div>
      
      <br>
     
      <!-- TERMS SECTION -->
      <div class="invoice-terms">
        <label>
          <input type="checkbox" id="invoiceAgreeTerms" checked>
          I have read and agreed with the 
          <span id="invoiceOpenTerms" style="color:blue; cursor:pointer;">
            Terms and Conditions
          </span>.
        </label>
    
        <div id="invoiceTermsBox" class="invoice-terms-box hidden" style="margin-top:10px;">
              <div class="invoice-terms-header">
                <b>TERMS AND CONDITIONS</b>
                <button type="button" id="invoicecloseTerms">✕</button>
              </div>
          
             <p>
               • No physical book and ONLY digital copy will be delivered.<br>
               • <b>Payment is for our cataloging and delivery service.</b> Only proceed to ‘Submit Order’ if you accept it.<br>
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
      
      <br>
      
      <div style="display:flex; gap:10px;">
        <button id="backToCart">BACK TO EDIT</button>
        <button id="submitInvoiceOrder">SUBMIT ORDER</button>
      </div>

  `;

  document.getElementById("invoiceContent").innerHTML = invoiceHTML;
  window.lastInvoiceHTML = invoiceHTML;

  updateInvoiceButtons();
}
/* =====================================
  active state for submit order in invoice
===================================== */
function updateInvoiceButtons() {
  const submitBtn = document.getElementById("submitInvoiceOrder");

  if (!submitBtn) return;

  // Conditions for being active
  const hasItems = cart.items.size > 0;
  const agreed = cart.agreed; // checkbox checked
  const deliveryDetails = cart.deliveryDetails && cart.deliveryDetails.trim() !== "";
  const paymentReady = cart.paymentProofUrl === "ready";

  const isActive = hasItems && agreed && deliveryDetails && paymentReady;

  submitBtn.classList.toggle("active", isActive);
}
/* =====================================
   mark paymentProofUrl = "ready"
===================================== */

document.addEventListener("change", function(e) {
  if (e.target.id !== "paymentProof") return;

  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(event) {
    const base64 = event.target.result.split(",")[1];

    cart.fileBase64 = base64;
    cart.fileName = file.name;
    cart.fileType = file.type;

    // ✅ Mark as uploaded
    cart.paymentProofUrl = "ready";
    updateInvoiceButtons();
    console.log("Payment proof stored.");
  };

  reader.readAsDataURL(file);
});


/* =====================================
   Submit Invoice to Google Script
===================================== */
document.addEventListener("click", async e => {
  const target = e.target;

  // Submit order
  if (target.id === "submitInvoiceOrder") {
    e.preventDefault();
    console.log("Submit clicked"); // test

   const invoiceAgree = document.getElementById("invoiceAgreeTerms");
     
      if (!invoiceAgree || !invoiceAgree.checked) {
        alert("Please agree to the Terms and Conditions.");
        return;
      }
     
    if (!cart.paymentProofUrl) {
      alert("Please upload payment proof.");
      return;
    }

  showThankYou();

  const totals = calculateTotals();

  const payload = {
    action: "submitOrder",
    orderId: cart.orderId,
    booksText: buildOrderData().booksText,
    totalAmount: totals.grandTotal,
    deliveryMethod: cart.delivery,
    deliveryDetails: cart.deliveryDetails,
    fileBase64: cart.fileBase64,   // store this during upload
    fileName: cart.fileName,
    fileType: cart.fileType
  };

  await fetch("https://script.google.com/macros/s/AKfycbxk9gejQmn0oPDSHNdKblnBiA3XaqQ9yxqXuAJDTZZLqdNdFAr_Q4jJ2oftcMK3OVlk/exec", {
  method: "POST",
  body: JSON.stringify(payload),
  mode: "no-cors"

});

    return;
  }

  // Back button
  if (target.id === "backToCart") {
    e.preventDefault();
    document.getElementById("paymentPopup").style.display = "none";
    openCart();
    return;
  }

  // Close icon inside popup
  if (target.closest("#paymentPopup .close-popup")) {
    e.preventDefault();
    document.getElementById("paymentPopup").style.display = "none";
    return;
  }

  // Close thank you popup
  const thankYou = document.getElementById("thankYou");
  if (thankYou?.classList.contains("show") &&
      (target.closest("#thankYou .close-popup") || !target.closest("#thankYou .popup-content"))) {
    thankYou.classList.remove("show");
    setTimeout(() => { thankYou.style.display = "none"; }, 250);
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
    const orderId = cart.orderId;

const msg =
`Thank you for your order - <b style="font-size:18px">Order ID: ${orderId}</b>.<br><br>
Once payment is verified, your order will be ${
  delivery === "email"
    ? "emailed within 1 hour.<br>Please check <b>SPAM</b> folder if no email received."
    : "delivered within 4 days."
}.<br><br>
Please keep this <b>Order ID: ${orderId}</b> as your reference.`;

if (thankYouMsg) {
  thankYouMsg.innerHTML = `
    ${msg}

    <div style="margin-top:16px;">
      <button id="printInvoiceBtn" style="margin-right:8px;">
        🖨 Print Invoice
      </button>

      <button id="downloadInvoicePDF">
        ⬇ Download Invoice PDF
      </button>
    </div>
  `;
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
   Print Icon Click Handler
===================================== */
document.addEventListener("click", e => {

  if (e.target.id === "printInvoiceBtn") {
    renderInvoicePrint();
  }

});
/* =====================================
   renderInvoicePrint() Function
===================================== */
async function renderInvoicePrint() {

  let proofHTML = "";

  if (paymentProofBlob) {

    const url = URL.createObjectURL(paymentProofBlob);

    if (paymentProofBlob.type.includes("image")) {

      proofHTML = `
      <br><br>
      <b>Payment Proof</b><br>
      <img src="${url}" style="max-width:100%; margin-top:10px;">
      `;

    } else if (paymentProofBlob.type.includes("pdf")) {

      proofHTML = `
      <br><br>
      <b>Payment Proof</b><br>
      <iframe src="${url}" style="width:100%; height:600px;"></iframe>
      `;

    }

  }

  const html = `
  <html>
  <head>
    <title>ORDER</title>

   <br><br><b>Order ID: ${cart.orderId}</b><br><br>


    <style>
      body{
        font-family: Arial;
        padding:20px;
      }

      table{
        border-collapse: collapse;
      }

      table, th, td{
        border:1px solid #000;
      }

      th, td{
        padding:6px;
      }

      @media print{
        button{
          display:none;
        }
      }
    </style>

  </head>

  <body>

  ${window.lastInvoiceHTML || ""}

  ${proofHTML}

  <script>
    window.onload = function(){
      window.print();
    }
  <\/script>

  </body>
  </html>
  `;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
}


/* =====================================
   PDF Download Script
===================================== */
document.addEventListener("click", async e => {

  if (e.target.id !== "downloadInvoicePDF") return;

  let proofHTML = "";

  if (paymentProofBlob) {

    const url = URL.createObjectURL(paymentProofBlob);

    if (paymentProofBlob.type.includes("image")) {

      proofHTML = `
      <div style="margin-top:20px">
        <b>Payment Proof</b><br>
        <img src="${url}" style="max-width:100%">
      </div>
      `;

    }

    if (paymentProofBlob.type.includes("pdf")) {

      proofHTML = `
      <div style="margin-top:20px">
        <b>Payment Proof</b><br>
        <p>Payment proof attached (PDF).</p>
      </div>
      `;

    }
  }

  const container = document.createElement("div");

  container.innerHTML = `
  <div style="font-family:Arial; padding:20px;">
    ${window.lastInvoiceHTML || ""}
    ${proofHTML}
  </div>
  `;

  const opt = {
    margin: 0.5,
    filename: `Order-${cart.orderId}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
  };

  html2pdf().set(opt).from(container).save();

});
