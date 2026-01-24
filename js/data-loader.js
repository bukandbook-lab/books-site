/* =====================================
   GLOBAL BOOK DATA LOADER (RUN ONCE)
===================================== */

window.ALL_BOOKS = {};
window.BOOK_REGISTRY = {};
window.ORDERED_BOOKS_BY_CATEGORY = {};

/* =========================================================
   BOOK DATA SOURCES
========================================================= */
const BOOK_SOURCES = {
  BeginningReader: "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/BeginningReaderData.json",
  ChapterBook:     "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/ChapterBookData.json",
  PictureBook:     "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/PictureBookData.json",
  Novel:           "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/NovelData.json",
  Islamic:         "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/islamicdata.json",
  Melayu:          "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/MelayuData.json",
  Jawi:            "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/jawidata.json",
  Comic:           "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/comicdata.json"
};

const CATEGORY_ORDER = [
  "BeginningReader",
  "ChapterBook",
  "PictureBook",
  "Novel",
  "Islamic",
  "Melayu",
  "Jawi",
  "Comic"
];


/* =========================================================
   LOAD ALL BOOK DATA
========================================================= */
window.BOOKS_READY = Promise.all(
  Object.entries(BOOK_SOURCES).map(([category, url]) =>
    fetch(url)
      .then(res => res.json())
      .then(data => {
        ALL_BOOKS[category] = data;

        // Build registry + ordered list
        ORDERED_BOOKS_BY_CATEGORY[category] = [];

        data.forEach(book => {
          const id = book.id || book.ID || book["Book ID"];
          if (!id) return;

          ORDERED_BOOKS_BY_CATEGORY[category].push(id);

          BOOK_REGISTRY[id] = {
            id,
            category, // ✅ CRITICAL
            title: book.title || book["Book Title"] || "Untitled",
            img: book.image || book.Link || "",
            price: Number(book.price || book["Price"] || 0),
            SetQtty: book.qtty || book["No. of Books"] || 0,
            video:
              book["Youtube ID"] ||
              book.youtube ||
              book.video ||
              null
          };
        });

        // sort books by ID inside category
        ORDERED_BOOKS_BY_CATEGORY[category].sort();
      })
  )
).then(() => {
  console.log("✅ All books loaded (global search + popup ready)");
});
