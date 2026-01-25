/* =====================================
   GLOBAL BOOK DATA LOADER (RUN ONCE)
===================================== */

window.ALL_BOOKS = {};
window.BOOK_REGISTRY = {};
window.ORDERED_BOOKS_BY_CATEGORY = {};

/* =========================================================
   BOOK DATA SOURCES
========================================================= */
const BOOK_SOURCES = [
  {
    key: "BeginningReader",
    url: "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/BeginningReaderData.json"
  },
  {
    key: "ChapterBook",
    url: "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/ChapterBookData.json"
  },
  {
    key: "PictureBook",
    url: "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/PictureBookData.json"
  },
  {
    key: "Novel",
    url: "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/NovelData.json"
  },
  {
    key: "Islamic",
    url: "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/islamicdata.json"
  },
  {
    key: "Melayu",
    url: "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/MelayuData.json"
  },
  {
    key: "Jawi",
    url: "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/jawidata.json"
  },
  {
    key: "Comic",
    url: "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/comicdata.json"
  },
];

/* =========================================================
   LOAD ALL BOOK DATA
========================================================= */
window.CATEGORY_ORDER = [];
window.BOOKS_READY = Promise.all(
  BOOK_SOURCES.map((source, index) =>
    fetch(source.url)
      .then(res => res.json())
      .then(data => {

        const category = source.key;
        const categoryIndex = index + 1; // 👈 CATEGORY NUMBER

        CATEGORY_ORDER.push(category);
        ALL_BOOKS[category] = data;
        ORDERED_BOOKS_BY_CATEGORY[category] = [];

        data.forEach(book => {
          const id = book.id || book.ID || book["Book ID"];
          if (!id) return;

          ORDERED_BOOKS_BY_CATEGORY[category].push(id);

          BOOK_REGISTRY[id] = {
            id,
            category,
            categoryIndex, // ✅ HERE
            title: book.title || book["Book Title"] || "Untitled",
            img: book.image || book.Link || "",
            price: Number(book.price || book["Price"] || 0),
            SetQtty: book.qtty || book["No. of Books"] || 0,
            video: book["Youtube ID"] || null
          };
        });
      })
).then(() => {
  console.log("✅ All books loaded (global search + popup ready)");
}));

