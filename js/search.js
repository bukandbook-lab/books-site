document.addEventListener("DOMContentLoaded", () => {

  const searchInput = document.getElementById("bookSearch");
  if (!searchInput) return;

  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabIds = [...tabButtons].map(btn => btn.dataset.tab);

  const loadedTabs = {};

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

  /* 🔍 GLOBAL SEARCH */
  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase().trim();
    let firstTabWithMatch = null;

    tabIds.forEach(tabId => {
      ensureTabLoaded(tabId);

      const tab = document.getElementById(tabId);
      if (!tab) return;

      let hasMatch = false;

      tab.querySelectorAll(".book-thumb").forEach(bookEl => {
        const bookId =
          bookEl.querySelector("[data-book-id]")?.dataset.bookId;

        const book = BOOK_REGISTRY[bookId];
        const title = book?.title?.toLowerCase() || "";

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

  /* ❌ CLEAR SEARCH */
  document.getElementById("clearSearch")?.addEventListener("click", () => {
    searchInput.value = "";

    document.querySelectorAll(".book-thumb").forEach(book => {
      book.style.display = "";
    });

    showTab("BeginningReader");
  });

 


});
