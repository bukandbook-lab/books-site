document.addEventListener("DOMContentLoaded", () => {

  const searchInput = document.getElementById("bookSearch");
  if (!searchInput) return;

  let lastActiveTab = null;

  function normalize(text = "") {
    return text.toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function getActiveTab() {
    const btn = document.querySelector(".tab-btn.active");
    return btn ? btn.dataset.tab : null;
  }

  function hideAllTabs() {
    document.querySelectorAll(".tabcontent").forEach(t => {
      t.style.display = "none";
    });
  }

  function showTab(tabId) {
    document.getElementById(tabId).style.display = "block";
  }

  function getSearchContainer() {
    let c = document.getElementById("searchResults");
    if (!c) {
      c = document.createElement("div");
      c.id = "searchResults";
      c.className = "image-grid";
      document.body.appendChild(c);
    }
    return c;
  }

  searchInput.addEventListener("input", () => {
    const keyword = normalize(searchInput.value);

    if (!lastActiveTab) lastActiveTab = getActiveTab();

    if (!keyword) {
      const sc = document.getElementById("searchResults");
      if (sc) sc.style.display = "none";
      if (lastActiveTab) showTab(lastActiveTab);
      return;
    }

    hideAllTabs();

    const container = getSearchContainer();
    container.innerHTML = "";
    container.style.display = "grid";

    Object.values(BOOK_REGISTRY).forEach(book => {
      if (!normalize(book.title).includes(keyword)) return;

      const div = document.createElement("div");
      div.className = "book-thumb";

      div.innerHTML = `
        <img
          src="${book.img}"
          class="grid-book-img popup-trigger"
          data-book-id="${book.id}"
        >
        <img
          src="${CART_ICON}"
          class="cart-icon"
          data-book-id="${book.id}"
        >
      `;

      container.appendChild(div);
    });

    syncCartIcons();
  });

});
