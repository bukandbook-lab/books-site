document.addEventListener("DOMContentLoaded", () => {

  const searchInput = document.getElementById("bookSearch");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase().trim();

    // Filter ONLY books that exist in DOM (dynamic-safe)
    document.querySelectorAll(".book-thumb").forEach(book => {
      const idHolder = book.querySelector("[data-book-id]");
      if (!idHolder) return;

      const bookId = idHolder.dataset.bookId;
      const data = window.BOOK_REGISTRY?.[bookId];
      if (!data) return;

      const match = data.title.toLowerCase().includes(keyword);
      book.style.display = match ? "" : "none";
    });
  });

  // CLEAR SEARCH
  document.getElementById("clearSearch")?.addEventListener("click", () => {
    searchInput.value = "";
    document.querySelectorAll(".book-thumb")
      .forEach(book => (book.style.display = ""));
  });

});
