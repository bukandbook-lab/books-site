document.addEventListener("DOMContentLoaded", () => {

  const searchInput = document.getElementById("bookSearch");
  if (!searchInput) return;

  let lastActiveTabId = null;

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

  function hideAllTabs() {
    document.querySelectorAll(".tabcontent").forEach(tab => {
      tab.style.display = "none";
    });
  }

  function showTab(tabId) {
    document.querySelectorAll(".tabcontent").forEach(tab => {
      tab.style.display = tab.id === tabId ? "block" : "none";
    });

    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
  }

  function getSearchContainer() {
    let container = document.getElementById("searchResults");
    if (!container) {
      container = document.createElement("div");
      container.id = "searchResults";
      container.className = "search-grid";
      document.body.appendChild(container);
    }
    return container;
  }

  /* ------------------------------
     SEARCH LOGIC
  ------------------------------ */

  searchInput.addEventListener("input", () => {
    const keyword = normalize(searchInput.value);

    // Save last active tab ONCE
    if (!lastActiveTabId) {
      lastActiveTabId = getActiveTabId();
    }

    // If search cleared → restore tabs
    if (!keyword) {
      const container = document.getElementById("searchResults");
      if (container) container.style.display = "none";

      if (lastActiveTabId) {
        showTab(lastActiveTabId);
      }
      return;
    }

    // Hide tabs and show search container
    hideAllTabs();

    const container = getSearchContainer();
    container.style.display = "grid";
    container.innerHTML = "";

    Object.entries(BOOK_REGISTRY).forEach(([bookId, book]) => {

      if (!book || !book.title) return;

      const title = normalize(book.title);
      if (!title.includes(keyword)) return;

      const div = document.createElement("div");
      div.className = "book-thumb";

      div.innerHTML = `
        <img
          class="grid-book-img popup-trigger"
          src="${book.img || ""}"
          data-book-id="${bookId}"
        >

        <div class="book-id">${bookId}</div>

        <img
          class="cart-icon"
          src="YOUR_CART_ICON_URL_HERE"
          data-book-id="${bookId}"
        >
      `;

      container.appendChild(div);
    });
  });

});
