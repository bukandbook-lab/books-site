/* =====================================
   GLOBAL BOOK DATA
===================================== */

window.ALL_BOOKS = {};
window.BOOK_REGISTRY = {};
window.ORDERED_BOOKS_BY_CATEGORY = {};
window.CATEGORY_LOADED = {};

/* =====================================
   LOAD SKELETON GRID IMMEDIATELY FIRST
===================================== */
window.addEventListener("DOMContentLoaded", () => {
  showSkeletonGrid("BeginningReader", 50);
});

/* =====================================
  SKELETON GRID  GENERATOR
===================================== */
function showSkeletonGrid(tabId, count = 50) {
  const tab = document.getElementById(tabId);
  if (!tab) return;

  const grid = tab.querySelector(".image-grid");
  if (!grid) return;

  grid.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const div = document.createElement("div");
    div.className = "book-thumb";

    div.innerHTML = `
      <div class="skeleton"></div>
    `;

    grid.appendChild(div);
  }
}
/* =====================================
   CONFIG
===================================== */

const GAS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzWLFzBC1yIdkc_oxIcccFokvORK9_8BNTLAexo_QfVjI4TMrUxwQb_ql8yE93cmWhY7w/exec";

const SECRET_KEY = "larilarilaju4578kali";


/* ==============================
   extract YouTube ID
================================ */
function extractYouTubeID(input) {
  if (!input) return null;

  const raw = input.toString().trim();
  if (raw === "#VALUE!" || raw === "N/A") return null;

  // Already pure ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
    return raw;
  }

  try {
    const url = new URL(raw);

    if (url.searchParams.get("v")) {
      return url.searchParams.get("v");
    }

    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "");
    }

    if (url.pathname.includes("/shorts/")) {
      return url.pathname.split("/shorts/")[1];
    }

  } catch (e) {
    return null;
  }

  return null;
}

/* =====================================
   LOAD SINGLE CATEGORY
===================================== */

function loadCategory(category, index) {

  if (CATEGORY_LOADED[category]) {
    return Promise.resolve();
  }

return fetch(
  `${GAS_ENDPOINT}?key=${SECRET_KEY}&category=${category}`,
  {
    method: "GET",
    credentials: "omit",
    redirect: "follow",
    cache: "no-store"
  }
)
    .then(res => res.json())
    .then(response => {

  // 🔑 Normalize response
  const books = Array.isArray(response)
    ? response
    : Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.books)
        ? response.books
        : [];

  if (!Array.isArray(books)) {
    throw new Error("Invalid GAS response shape");
  }

  ALL_BOOKS[category] = books;
  ORDERED_BOOKS_BY_CATEGORY[category] = [];
  CATEGORY_LOADED[category] = true;

  books.forEach(book => {

        const id = book.id || book.ID || book["Book ID"];
        if (!id) return;

        ORDERED_BOOKS_BY_CATEGORY[category].push(id);

            const videoID =
            extractYouTubeID(book["YT Link"]) ||
            extractYouTubeID(book["Youtube ID"]);

          const videoAltID =
            extractYouTubeID(book["YT Alternative"]);

          BOOK_REGISTRY[id] = {
            id,
            category,
            categoryIndex: index + 1,

            title: book.title || book["Book Title"] || "Untitled",
            img: book.image || book["Image"] || book["Link"] || "",
            price: Number(book.price || book["Price"] || 0),
            SetQtty: book.qtty || book["No. of Books"] || 0,
            SetTotal: Number(book["Set Total"] || 0),

            videoID,
            videoAltID,

            Author: book["Author"] || "",
            Status: book["Status"] || "",
            AvailableTitle: book["Available Title"] || "",
            MissingTitle: book["Missing Title"] || "",
            Series: book["Series"] || "",
            FileType: book["File Type"] || "",
            FileSize: book["File Size"] || "",

            tags: typeof book["Tag"] === "string"
              ? book["Tag"]
                  .split(",")
                  .map(t => t.trim())
                  .filter(Boolean)
              : Array.isArray(book["Tag"])
                ? book["Tag"]
                : []
        };


      });

    });
}

/* =====================================
   LOAD FIRST CATEGORY ONLY
===================================== */

window.BOOKS_READY = loadCategory("BeginningReader", 0);
