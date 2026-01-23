document.addEventListener("DOMContentLoaded", () => {

  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tabcontent");

  function hideAll() {
    contents.forEach(c => (c.style.display = "none"));
  }

  function deactivateTabs() {
    tabs.forEach(t => t.classList.remove("active"));
  }

  function openTab(tabId, btn) {
    hideAll();
    deactivateTabs();

    const panel = document.getElementById(tabId);
    if (!panel) {
      console.error("Tab not found:", tabId);
      return;
    }

    panel.style.display = "block";
    if (btn) btn.classList.add("active");

    // 🔑 ONLY load books if this tab has a data source
    if (BOOK_SOURCES[tabId]) {
      BOOKS_READY.then(() => {
        loadBooks(tabId);
      });
    }

    // 🔍 Reset search
    const search = document.getElementById("bookSearch");
    if (search) search.value = "";

    // 🎥 Cleanup
    if (typeof stopAllVideos === "function") stopAllVideos();
    if (typeof closeBookPopup === "function") closeBookPopup();
  }

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      openTab(btn.dataset.tab, btn);
    });
  });

  // DEFAULT TAB 
  const defaultBtn =
    document.querySelector('.tab-btn[data-tab="BeginningReader"]') ||
    tabs[0];

  if (defaultBtn) {
    openTab(defaultBtn.dataset.tab, defaultBtn);
  }
});
