/* =====================================
   GLOBAL SEARCH (TAB-SAFE)
===================================== */

document.addEventListener("input", e => {
  if (e.target.id !== "bookSearch") return;

  const keyword = e.target.value.toLowerCase().trim();

  document.querySelectorAll(".book-thumb").forEach(book => {
    const bookId =
      book.querySelector("[data-book-id]")?.dataset.bookId;

    const data = BOOK_REGISTRY[bookId];
    if (!data) return;

    const match = data.title.toLowerCase().includes(keyword);
    book.style.display = match ? "" : "none";
  });
});

/* =====================================
   CLEAR SEARCH
===================================== */

document.getElementById("clearSearch")?.addEventListener("click", () => {
  const input = document.getElementById("bookSearch");
  if (!input) return;

  input.value = "";

  document.querySelectorAll(".book-thumb")
    .forEach(book => (book.style.display = ""));
});
