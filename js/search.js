/* =====================================
   BOOK SEARCH (CURRENT TAB ONLY)
===================================== */

document.addEventListener("input", e => {
  if (e.target.id !== "bookSearch") return;

  const keyword = e.target.value.toLowerCase().trim();

  // find visible tab
  const activeTab = document.querySelector(".tabcontent[style*='block']");
  if (!activeTab) return;

  const books = activeTab.querySelectorAll(".book-thumb");

  books.forEach(book => {
    const bookId =
      book.querySelector("[data-book-id]")?.dataset.bookId;

    const data = BOOK_REGISTRY[bookId];
    if (!data) return;

    const match = data.title.toLowerCase().includes(keyword);
    book.style.display = match ? "" : "none";
  });
});

/* CLEAR SEARCH */
document.getElementById("clearSearch")?.addEventListener("click", () => {
  const input = document.getElementById("bookSearch");
  if (!input) return;

  input.value = "";

  const activeTab = document.querySelector(".tabcontent[style*='block']");
  if (!activeTab) return;

  activeTab
    .querySelectorAll(".book-thumb")
    .forEach(b => (b.style.display = ""));
});
