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
  hideSeeMore();

  // ⛔ EXIT SEARCH MODE
  const searchGrid = document.getElementById("searchResults");
  if (searchGrid) searchGrid.remove();

  const searchInput = document.getElementById("bookSearch");
  if (searchInput) searchInput.value = "";

  // ✅ HIDE "NO SEARCH RESULT" MESSAGE
  const box = window.getNoSearchResultBox?.();
  if (box) box.classList.add("hidden");

  const panel = document.getElementById(tabId);
  if (!panel) return;

  panel.style.display = "block";
  btn?.classList.add("active");

  // 🔥 LOAD CATEGORY ONLY WHEN CLICKED
  const categoryIndex = [...tabs].findIndex(t => t.dataset.tab === tabId);

  loadCategory(tabId, categoryIndex)
    .then(() => {
      loadBooks(tabId); // your existing renderer
    });
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
