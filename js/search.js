/* =====================================
   GLOBAL BOOK SEARCH (ALL TABS)
===================================== */

document.addEventListener("input", e => {
  if (e.target.id !== "bookSearch") return;

  const keyword = e.target.value.toLowerCase().trim();

  document.querySelectorAll(".tabcontent").forEach(tab => {
    let hasMatch = false;

    tab.querySelectorAll(".book-thumb").forEach(book => {
      const bookId =
        book.querySelector("[data-book-id]")?.dataset.bookId;

      const data = BOOK_REGISTRY[bookId];
      if (!data) return;

      const match = data.title.toLowerCase().includes(keyword);

      book.style.display = match ? "" : "none";
      if (match) hasMatch = true;
    });

    // Show only tabs that have results
    tab.style.display = hasMatch || keyword === "" ? "block" : "none";
  });

  // deactivate active tab highlight
  document.querySelectorAll(".tablinks")
    .forEach(btn => btn.classList.remove("active"));
});

/* =====================================
   CLEAR SEARCH
===================================== */

document.getElementById("clearSearch")?.addEventListener("click", () => {
  const input = document.getElementById("bookSearch");
  if (!input) return;

  input.value = "";

  document.querySelectorAll(".tabcontent").forEach(tab => {
    tab.style.display = "none";
    tab.querySelectorAll(".book-thumb")
      .forEach(book => (book.style.display = ""));
  });

  // restore default tab
  document.querySelector(".tablinks")?.click();
});
