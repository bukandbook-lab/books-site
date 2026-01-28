const NON_BOOK_TABS = ["ReadMeFirst", "EPUBReader"];

function prettyCategory(text = "") {
  return text.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function loadBooks(tabId) {

  // ✅ NON-BOOK TAB → DO NOTHING
  if (NON_BOOK_TABS.includes(tabId)) {
    const seeMoreBox = document.getElementById("seeMoreContainer");
    if (seeMoreBox) seeMoreBox.style.display = "none";
    return;
  }

  currentVisible = 0;
  currentGrid = null;

  // hide See More first
  const seeMoreBox = document.getElementById("seeMoreContainer");
  if (seeMoreBox) seeMoreBox.style.display = "none";

  const container = document.getElementById(tabId);
  if (!container) return;

  const primaryBooks = ALL_BOOKS[tabId] || [];
const taggedBooks = [];

Object.keys(ALL_BOOKS).forEach(cat => {
  if (cat === tabId) return;

  ALL_BOOKS[cat].forEach(book => {
    const id = book.id || book.ID || book["Book ID"];
    const reg = BOOK_REGISTRY[id];

    if (
      reg &&
      Array.isArray(reg.tags) &&
      reg.tags.includes(tabId)
    ) {
      taggedBooks.push(reg);
    }
  });
});


  // 🔥 merge: primary first, tagged last
  const combinedBooks = [
    ...primaryBooks.map(b => ({ ...b, _source: "primary" })),
    ...taggedBooks.map(b => ({ ...b, _source: "tag" }))
  ];

  // guard
  if (!Array.isArray(combinedBooks) || combinedBooks.length === 0) {
    container.innerHTML = `<p style="padding:16px">No books found.</p>`;
    return;
  }

  // clear container
  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "image-grid";

  combinedBooks.forEach(book => {
    const id = book.id || book.ID || book["Book ID"];
    if (!id) return;

    const normalized = {
      id,
      title: book.title || book["Book Title"] || "Untitled",
      img: book.image || book.Link || book.img || "",
      price: Number(book.price || book["Price"] || 0),
      SetQtty: book.qtty || book["No. of Books"] || 0,
      video: book["Youtube ID"] || book.video || null
    };

    const priceLabel = isSetBook ? "/set" : "/book";
    const item = document.createElement("div");
    item.className = "book-thumb";

    // optional visual hint for tagged books
    if (book._source === "tag") {
      item.classList.add("tagged-book");
    }

    item.innerHTML = `
      <div class="skeleton"></div>
      <img
        src="${normalized.img}"
        class="grid-book-img popup-trigger"
        loading="lazy"
        data-book-id="${normalized.id}"
      >

      <div class="price-box"
        data-book-id="${normalized.id}"
        data-title="${normalized.title}"
        data-price="${normalized.price}"
        data-setqtty="${normalized.SetQtty}">
        &nbsp&nbspRM${normalized.price} ${priceLabel}
        <img class="cart-icon" src="${CART_ICON}" width="22">
      </div>
    `;

    grid.appendChild(item);
  });

container.appendChild(grid);

// 🔥 INIT SEE MORE AFTER RENDER
applySeeMore(grid);

// 🔥 RESET SCROLL SO FIRST BOOKS ARE VISIBLE
container.scrollTop = 0;
window.scrollTo({ top: 0, behavior: "instant" });


}


/* =====================================
   SEE MORE SYSTEM (FINAL)
===================================== */

const SEE_MORE_BATCH = 50;
let currentVisible = 0;
let currentGrid = null;

/* =====================================
   INIT SEE MORE FOR A GRID
===================================== */
function applySeeMore(grid) {
  if (!grid) return;

  const items = [...grid.querySelectorAll(".book-thumb")];
  const btnBox = document.getElementById("seeMoreContainer");

  currentGrid = grid;
  currentVisible = SEE_MORE_BATCH;

  // Hide/show books
  items.forEach((item, i) => {
    item.style.display = i < SEE_MORE_BATCH ? "" : "none";
  });

  // 🔑 SHOW ONLY IF NEEDED
  if (items.length > SEE_MORE_BATCH) {
    btnBox.style.display = "flex"; // center stays intact
  } else {
    btnBox.style.display = "none";
  }
  updateSeeMoreText(items.length);
}


/* =====================================
   UPDATE SEE MORE TEXT + VISIBILITY
===================================== */
function updateSeeMoreText(totalItems) {
  const btnBox = document.getElementById("seeMoreContainer");
  const btn = document.getElementById("seeMoreBtn");
  if (!btnBox || !btn) return;

  const remaining = totalItems - currentVisible;

  if (remaining <= 0) {
    btnBox.style.display = "none";
    return;
  }

  btnBox.style.display = "block";
  btn.textContent = `---------- See ${Math.min(SEE_MORE_BATCH, remaining)} more books ----------`;
}

 /* =====================================
   Move seeMoreContainer after the grid (ONLY during search)
===================================== */

  function moveSeeMoreAfter(element) {
  const box = document.getElementById("seeMoreContainer");
  if (!box || !element) return;
  element.after(box);
}
/* =====================================
   SEE MORE CLICK HANDLER
===================================== */
document.addEventListener("click", e => {
  if (e.target.id !== "seeMoreBtn") return;
  if (!currentGrid) return;

  const items = [...currentGrid.querySelectorAll(".book-thumb")];
  const nextVisible = currentVisible + SEE_MORE_BATCH;

  items.forEach((item, i) => {
    if (i < nextVisible) item.style.display = "";
  });

  currentVisible = nextVisible;

  updateSeeMoreText(items.length);
});
/* =====================================
   CLICK HANDLER FOR CATEGORY IN POPUP
===================================== */
document.addEventListener("click", e => {
  const cat = e.target.closest(".popup-category");
  if (!cat) return;

  const category = cat.dataset.category;
  if (!category) return;

  // 🔥 close popup with animation
  closeBookPopup();

  // 🔁 open tab AFTER popup animation
  setTimeout(() => {
    const btn = document.querySelector(
      `.tab-btn[data-tab="${category}"]`
    );
    btn?.click();
  }, 250);
});
