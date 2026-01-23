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
    if (!panel) return;

    panel.style.display = "block";
    if (btn) btn.classList.add("active");

    // 🔑 Only book tabs
    if (BOOK_SOURCES[tabId]) {
      BOOKS_READY.then(() => loadBooks(tabId));
    }
  }

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      openTab(btn.dataset.tab, btn);
    });
  });

  // Default tab
  const defaultBtn =
    document.querySelector('.tab-btn[data-tab="BeginningReader"]');

  if (defaultBtn) {
    openTab(defaultBtn.dataset.tab, defaultBtn);
  }
});
