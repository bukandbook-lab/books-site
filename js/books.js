const NON_BOOK_TABS = ["ReadMeFirst", "RequestBook"];

function prettyCategory(text = "") {
  return text.replace(/([a-z])([A-Z])/g, "$1 $2");
}

/* =====================================
   LAZY RENDER (SCROLL OPTIMIZED)
===================================== */

function lazyRender(container, books) {

  const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {

        const el = entry.target;
        const book = JSON.parse(el.dataset.book);

        renderBookCard(el, book);

        observer.unobserve(el);
      }

    });

  }, {
    rootMargin: "300px"
  });

  books.forEach(book => {

    const placeholder = document.createElement("div");
    placeholder.className = "book-thumb";
    placeholder.dataset.book = JSON.stringify(book);

    container.appendChild(placeholder);
    observer.observe(placeholder);

  });

}

/* =====================================
   Extract Card HTML into renderBookCard()
===================================== */
function renderBookCard(item, book) {

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

  const isSetBook = normalized.SetQtty > 1;
  const priceLabel = isSetBook ? "/set" : "/book";

  if (book._source === "tag") {
    item.classList.add("tagged-book");
  }

  item.innerHTML = `
    <div class="skeleton"></div>
    <div class="book-bg" data-bg="${normalized.img}"></div>
    <img
      src="${normalized.img}"
      class="grid-book-img popup-trigger"
      loading="lazy"
      data-book-id="${normalized.id}"
      decoding="async"
      fetchpriority="high"
    >
    <div class="price-box"
      data-book-id="${normalized.id}"
      data-title="${normalized.title}"
      data-price="${Number(normalized.price).toFixed(2)}"
      data-setqtty="${normalized.SetQtty || 1}"
    >
      &nbsp&nbspRM${Number(normalized.price).toFixed(2)}${priceLabel}
      <img data-book-id="${normalized.id}" src="${CART_ICON}" class="cart-icon">
    </div>
  `;

  progressiveImageLoad(item);
}


/* =====================================
   LOAD BOOKS
===================================== */

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
  hideSeeMore();

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

  window.CURRENT_GRID_BOOK_IDS = combinedBooks.map(b =>
  b.id || b.ID || b["Book ID"]
  );
  
  // guard
  if (!Array.isArray(combinedBooks) || combinedBooks.length === 0) {
    container.innerHTML = `<p style="padding:16px">No books found.</p>`;
    return;
  }

  // clear container
  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "image-grid";

container.appendChild(grid);

// 🔥 LAZY RENDER INSTEAD OF INSTANT RENDER
lazyRender(grid, combinedBooks);

// 🔥 INIT SEE MORE AFTER RENDER
applySeeMore(grid);

// 🔥 RESET SCROLL
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
   bind seeMore to ONE grid at a time
===================================== */
function bindSeeMoreToGrid(grid) {
  const box = document.getElementById("seeMoreContainer");
  if (!box || !grid) return;

  box.dataset.boundTo = grid.id || "";
  box.style.display = "block";
  grid.after(box);
}

/* =====================================
   HIDE SEE MORE
===================================== */
function hideSeeMore() {
  const box = document.getElementById("seeMoreContainer");
  if (!box) return;

  box.style.display = "none";
  //delete box.dataset.boundTo;
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

  const value = cat.dataset.category;
  if (!value) return;

  // 🔥 close popup with animation
  closeBookPopup();

  // 🔁 open tab AFTER popup animation
  setTimeout(() => {

    // 🔍 If tab exists → open tab
    const btn = document.querySelector(
      `.tab-btn[data-tab="${value}"]`
    );

    if (btn) {
      btn.click();
      return;
    }

    // 🔎 If no tab → fallback to search
    const searchInput = document.getElementById("bookSearch");
    if (!searchInput) return;

    searchInput.value = value;
    searchInput.dispatchEvent(new Event("input"));

  }, 250);
});
/* =====================================
   CLICK HANDLER FOR AUTHOR IN POPUP
===================================== */
document.addEventListener("click", e => {
  const authorEl = e.target.closest(".popup-author");
  if (!authorEl) return;

  console.log("AUTHOR CLICKED", authorEl.dataset.author);

  const author = authorEl.dataset.author;
  if (!author) return;

  closeBookPopup();

  setTimeout(() => {
    const searchInput = document.getElementById("bookSearch");
    if (!searchInput) return;

    searchInput.value = author;

    searchInput.focus();
    searchInput.dispatchEvent(new Event("input"));
    searchInput.dispatchEvent(new KeyboardEvent("keyup"));

  }, 250);

});


/* =====================================
   CLICK HANDLER FOR SERIES IN POPUP
===================================== */
document.addEventListener("click", e => {
  const seriesEl = e.target.closest(".popup-series");
  if (!seriesEl) return;

  const series = seriesEl.dataset.series;
  if (!series) return;

  closeBookPopup();

  setTimeout(() => {
    const searchInput = document.getElementById("bookSearch");
    if (!searchInput) return;

    searchInput.value = series;

    searchInput.focus();
    searchInput.dispatchEvent(new Event("input"));
    searchInput.dispatchEvent(new KeyboardEvent("keyup"));

  }, 250);

});
/* =====================================
   load background AFTER image loads
===================================== */

function progressiveImageLoad(container) {
  const img = container.querySelector(".grid-book-img");
  const bg = container.querySelector(".book-bg");

  if (!img || !bg) return;

  // when front image is ready
  img.addEventListener("load", () => {
    const bgUrl = bg.dataset.bg;
    if (!bgUrl) return;

    const preload = new Image();
    preload.src = bgUrl;

    preload.onload = () => {
      bg.style.backgroundImage = `url('${bgUrl}')`;
      bg.classList.add("loaded");
    };
  });
}

