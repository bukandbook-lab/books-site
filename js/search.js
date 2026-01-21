document.addEventListener("DOMContentLoaded", () => {

  const searchInput = document.getElementById("bookSearch");
  if (!searchInput) return;

  /* ------------------------------
     HELPER
  ------------------------------ */
  function normalize(text = "") {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* ------------------------------
     GLOBAL SEARCH (NO TAB LOGIC)
  ------------------------------ */
  searchInput.addEventListener("input", () => {
    const keyword = normalize(searchInput.value);

    document.querySelectorAll(".book-thumb").forEach(bookEl => {

      // 🔑 Always read ID from popup-trigger
      const bookId =
        bookEl.querySelector(".popup-trigger")?.dataset.bookId;

      const book = BOOK_REGISTRY[bookId];

      // Hide if book data missing
      if (!book || !book.title) {
        bookEl.style.display = "none";
        return;
      }

      // If search empty → show everything
      if (!keyword) {
        bookEl.style.display = "";
        return;
      }

      const title = normalize(book.title);
      const match = title.includes(keyword);

      bookEl.style.display = match ? "" : "none";
    });
  });

});
