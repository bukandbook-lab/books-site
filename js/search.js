document.addEventListener("DOMContentLoaded", () => {

  const searchInput = document.getElementById("bookSearch");
  if (!searchInput) return;

  /* ------------------------------
     HELPERS
  ------------------------------ */

  function normalize(text = "") {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getActiveTabId() {
    const activeBtn = document.querySelector(".tab-btn.active");
    return activeBtn ? activeBtn.dataset.tab : null;
  }

  /* ------------------------------
     SEARCH (GLOBAL DATA, LOCAL VIEW)
  ------------------------------ */

  searchInput.addEventListener("input", () => {
    const keyword = normalize(searchInput.value);
    const activeTabId = getActiveTabId();

    if (!activeTabId) return;

    const activeTab = document.getElementById(activeTabId);
    if (!activeTab) return;

    activeTab.querySelectorAll(".book-thumb").forEach(bookEl => {

      // 🔑 Always get ID from popup-trigger
      const bookId =
        bookEl.querySelector(".popup-trigger")?.dataset.bookId;

      const book = BOOK_REGISTRY[bookId];

      // If book data missing, hide
      if (!book || !book.title) {
        bookEl.style.display = "none";
        return;
      }

      // Empty search → show all in active tab
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
