/* =====================================
   GLOBAL BOOK DATA LOADER (RUN ONCE)
===================================== */

window.ALL_BOOKS = {};
window.BOOK_REGISTRY = {};

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

window.BOOKS_READY = Promise.all(
  Object.entries(BOOK_SOURCES).map(([category, url]) =>
    fetch(url)
      .then(res => res.json())
      .then(data => {
        ALL_BOOKS[category] = data;

        data.forEach(book => {
          BOOK_REGISTRY[book.id] = {
            id: book.id || book.ID || book["Book ID"],
            title: book.title || book["Book Title"] || "Untitled",
            img: book.image || book.Link || "",
            price: Number(book.price || book["Price"] || 0),
            SetQtty: book.qtty || book["No. of Books"] || 0,
            video:         
               book["Youtube ID"] ||
               book.youtube ||
               book.video ||
               null,
           category: tabId
          };
        });
      })
  )
).then(() => {
  console.log("✅ All books loaded (global search + popup ready)");
});
