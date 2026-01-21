document.addEventListener("DOMContentLoaded", () => {

  const searchInput = document.getElementById("bookSearch");
  if (!searchInput) return;

  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabIds = [...tabButtons].map(btn => btn.dataset.tab);

  const loadedTabs = {};

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

  function ensureTabLoaded(tabId) {
    if (!loadedTabs[tabId]) {
      loadBooks(tabId);
      loadedTabs[tabId] = true;
    }
  }

  function showTab(tabId) {
    document.querySelectorAll(".tabcontent").forEach(tab => {
      tab.style.display = tab.id === tabId ? "block" : "none";
    });

    tabButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
  }

  function resetAllBooks() {
    document.querySelectorAll(".book-thumb").forEach(book => {
      book.style.display = "";
    });
  }

  /* ------------------------------
     GLOBAL SEARCH
  ------------------------------ */

  searchInput.addEventListener("input", () => {
    const keyword = normalize(searchInput.value);

    // If search cleared → reset and return to home tab
    if (!keyword) {
      resetAllBooks();
      showTab("BeginningReader");
      return;
    }

    let firstTabWithMatch = null;

    tabIds.forEach(tabId => {
      ensureTabLoaded(tabId);

      const tab = document.getElementById(tabId);
      if (!tab) return;

      let hasMatch = false;

      tab.querySelectorAll(".book-thumb").forEach(bookEl => {

        // 🔑 ALWAYS read book-id from popup-trigger (authoritative)
        const bookId =
          bookEl.querySelector(".popup-trigger")?.dataset.bookId;

        const book = BOOK_REGISTRY[bookId];
        if (!book || !book.title) {
          bookEl.style.display = "none";
          return;
        }

        const title = normalize(book.title);
        const match = title.includes(keyword);

        bookEl.style.display = match ? "" : "none";

        if (match) hasMatch = true;
      });

      if (hasMatch && !firstTabWithMatch) {
        firstTabWithMatch = tabId;
      }
    });

    if (firstTabWithMatch) {
      showTab(firstTabWithMatch);
    }
  });

});
