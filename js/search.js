document.addEventListener("DOMContentLoaded", () => {

  const searchInput = document.getElementById("bookSearch");
  if (!searchInput) return;

  // Helper: show/hide a tab
  function showTab(tabId) {
    document.querySelectorAll(".tabcontent").forEach(tab => {
      tab.style.display = tab.id === tabId ? "block" : "none";
    });

    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
  }

  // Track which tabs have loaded books
  const loadedTabs = {};

  // Search handler
  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase().trim();
    let firstTabWithResults = null;

    // Loop through all books in BOOK_REGISTRY
    for (const bookId in window.BOOK_REGISTRY) {
      const book = BOOK_REGISTRY[bookId];
      if (!book || !book.tab) continue; // each book object must have a .tab property

      // Load tab if not loaded yet
      if (!loadedTabs[book.tab]) {
        if (typeof loadBooks === "function") loadBooks(book.tab);
        loadedTabs[book.tab] = true;
      }

      // Find the book's DOM element
      const bookEl = document.querySelector(
        `.tabcontent#${book.tab} [data-book-id="${bookId}"]`
      );

      if (!bookEl) continue;

      const match = book.title.toLowerCase().includes(keyword);

      bookEl.style.display = match ? "" : "none";

      // Mark tab as having results
      if (match && !firstTabWithResults) firstTabWithResults = book.tab;
    }

    // Show the first tab that has results
    if (firstTabWithResults) showTab(firstTabWithResults);

    // If search is empty, restore default tab
    if (keyword === "") {
      const defaultBtn =
        document.querySelector('.tab-btn[data-tab="BeginningReader"]') ||
        document.querySelector(".tab-btn");
      if (defaultBtn) showTab(defaultBtn.dataset.tab);
    }
  });

  // CLEAR SEARCH BUTTON
  document.getElementById("clearSearch")?.addEventListener("click", () => {
    searchInput.value = "";

    // Restore all books visible
    document.querySelectorAll(".book-thumb").forEach(book => {
      book.style.display = "";
    });

    // Restore default tab
    const defaultBtn =
      document.querySelector('.tab-btn[data-tab="BeginningReader"]') ||
      document.querySelector(".tab-btn");
    if (defaultBtn) {
      document.querySelectorAll(".tabcontent").forEach(tab => {
        tab.style.display = tab.id === defaultBtn.dataset.tab ? "block" : "none";
      });

      document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn === defaultBtn);
      });
    }
  });

});
