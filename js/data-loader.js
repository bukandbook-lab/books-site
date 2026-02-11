/* =====================================
   GLOBAL BOOK DATA LOADER (RUN ONCE)
===================================== */

window.ALL_BOOKS = {};
window.BOOK_REGISTRY = {};
window.ORDERED_BOOKS_BY_CATEGORY = {};

/* =========================================================
   GOOGLE APPS SCRIPT ENDPOINT
========================================================= */
const GAS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwZqiwSRfZQi4AYlN0SbzkJ2UjcIl00wOOOxuMMmApoI1TGr1U222RJ5GHI3_pqAH_C/exec";

/* =========================================================
   CATEGORY LIST (SHEET NAMES)
========================================================= */
const BOOK_SOURCES = [
  { key: "BeginningReader" },
  { key: "ChapterBook" },
  { key: "PictureBook" },
  { key: "Novel" },
  { key: "Islamic" },
  { key: "Melayu" },
  { key: "Jawi" },
  { key: "Comic" }
];

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

/* =========================================================
   LOAD ALL BOOK DATA FROM SPREADSHEET
========================================================= */

window.CATEGORY_ORDER = [];

window.BOOKS_READY = Promise.all(
  BOOK_SOURCES.map((source, index) =>
    fetch(`${GAS_ENDPOINT}?category=${source.key}`)
      .then(res => res.json())
      .then(data => {

        const category = source.key;
        const categoryIndex = index + 1;

        CATEGORY_ORDER.push(category);
        ALL_BOOKS[category] = data;
        ORDERED_BOOKS_BY_CATEGORY[category] = [];

        data.forEach(book => {

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
            categoryIndex,

            title: book.title || book["Book Title"] || "Untitled",
            img: book.image || book["Image"] || book["Link"] || "",
            price: Number(book.price || book["Price"] || 0),
            SetQtty: book.qtty || book["No. of Books"] || 0,
            SetTotal: Number(book["Set Total"] || 0),

            videoID,
            videoAltID,

            Author: book["Author"] || "",
            Status: book["Status"] || "",
            MissingTitle: book["Missing Title"] || "",
            Series: book["Series"] || "",

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

      })
  )
);
