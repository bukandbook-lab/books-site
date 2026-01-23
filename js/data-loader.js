/* =====================================
   GLOBAL BOOK DATA LOADER (RUN ONCE)
===================================== */

window.ALL_BOOKS = {};
window.BOOK_REGISTRY = {};

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
