document.addEventListener("DOMContentLoaded", () => {

  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tabcontent");

  function hideAll() {
    contents.forEach(c => c.style.display = "none");
  }

  function deactivateTabs() {
    tabs.forEach(t => t.classList.remove("active"));
  }

  function openTab(tabId, btn) {
    hideAll();
    deactivateTabs();
    
  // ⛔ EXIT SEARCH MODE
  const searchGrid = document.getElementById("searchResults");
  if (searchGrid) searchGrid.remove();

  const searchInput = document.getElementById("bookSearch");
  if (searchInput) searchInput.value = "";


    const panel = document.getElementById(tabId);
    if (!panel) return;

    panel.style.display = "block";
    btn?.classList.add("active");

    // render books from data source
    BOOKS_READY.then(() => loadBooks(tabId));

    
  }

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      openTab(btn.dataset.tab, btn);

    });
  });

  // Default tab
  const defaultBtn =
    document.querySelector('.tab-btn[data-tab="BeginningReader"]');

  defaultBtn && openTab(defaultBtn.dataset.tab, defaultBtn);
});
