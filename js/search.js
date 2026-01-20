document.addEventListener("DOMContentLoaded", () => {

  const searchInput = document.getElementById("bookSearch");
  if (!searchInput) return;

  // ------------------------
  // 1️⃣ Preload all tab JSON data
  // ------------------------
  const BOOK_JSON_URLS = {
    BeginningReader: "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/BeginningReaderData.json",
    ChapterBook:     "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/ChapterBookData.json",
    PictureBook:     "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/PictureBookData.json",
    Novel:           "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/NovelData.json",
    Islamic:         "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/islamicdata.json",
    Melayu:          "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/MelayuData.json",
    Jawi:            "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/jawidata.json",
    Comic:           "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/comicdata.json"
  };

  const ALL_BOOKS = {};  // will store { tabName: [book objects] }

  // Fetch all JSONs in parallel
  const fetchPromises = Object.entries(BOOK_JSON_URLS).map(([tab, url]) => {
    return fetch(url)
      .then(res => res.json())
      .then(data => { ALL_BOOKS[tab] = data; })
      .catch(err => { console.error("Failed to load", tab, err); ALL_BOOKS[tab] = []; });
  });

  // ------------------------
  // 2️⃣ Render books into tab
  // ------------------------
  function renderBooks(tab, books) {
    const container = document.getElementById(tab);
    if (!container) return;

    // Clear current books
    container.innerHTML = "";

    books.forEach(book => {
      // Use your existing renderBookHTML logic or build dynamically
      const div = document.createElement("div");
      div.className = "book-thumb";
      div.innerHTML = `
        <div class="price-box" data-book-id="${book.id}">
          <img src="${book.img}" width="120" />
          <div class="title">${book.title}</div>
          <div class="price">RM${book.price}</div>
        </div>
      `;
      container.appendChild(div);
    });
  }

  // ------------------------
  // 3️⃣ Search function
  // ------------------------
  function searchBooks(keyword) {
    let firstTabWithResults = null;

    Object.keys(ALL_BOOKS).forEach(tab => {
      const books = ALL_BOOKS[tab].filter(book =>
        book.title.toLowerCase().includes(keyword.toLowerCase())
      );

      renderBooks(tab, books);

      if (books.length && !firstTabWithResults) firstTabWithResults = tab;
    });

    // Show the first tab with results
    if (firstTabWithResults) openTab(firstTabWithResults);
  }

  // ------------------------
  // 4️⃣ Open tab helper
  // ------------------------
  function openTab(tabId) {
    document.querySelectorAll(".tabcontent").forEach(tab => {
      tab.style.display = tab.id === tabId ? "block" : "none";
    });

    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
  }

  // ------------------------
  // 5️⃣ Handle search input
  // ------------------------
  fetchPromises.then(() => {
    searchInput.addEventListener("input", () => {
      const keyword = searchInput.value.trim();
      if (keyword === "") {
        // Restore default tab
        const defaultBtn = document.querySelector('.tab-btn[data-tab="BeginningReader"]') || document.querySelector(".tab-btn");
        if (defaultBtn) openTab(defaultBtn.dataset.tab);

        // Render all books normally
        Object.keys(ALL_BOOKS).forEach(tab => renderBooks(tab, ALL_BOOKS[tab]));
      } else {
        searchBooks(keyword);
      }
    });

    // Clear button (if exists)
    document.getElementById("clearSearch")?.addEventListener("click", () => {
      searchInput.value = "";

      // Restore all books
      Object.keys(ALL_BOOKS).forEach(tab => renderBooks(tab, ALL_BOOKS[tab]));

      // Restore default tab
      const defaultBtn = document.querySelector('.tab-btn[data-tab="BeginningReader"]') || document.querySelector(".tab-btn");
      if (defaultBtn) openTab(defaultBtn.dataset.tab);
    });
  });

});
