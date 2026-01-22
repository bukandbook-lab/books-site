document.addEventListener("DOMContentLoaded", () => {

  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tabcontent");

  function hideAllTabs() {
    contents.forEach(c => c.style.display = "none");
  }

  function deactivateTabs() {
    tabs.forEach(t => t.classList.remove("active"));
  }

  function openTab(tabId, btn) {
    hideAllTabs();
    deactivateTabs();

    const panel = document.getElementById(tabId);
    if (!panel) return;

    panel.style.display = "block";
    if (btn) btn.classList.add("active");

    // 📚 Load books (from global cache)
    loadBooks(tabId);

    // 🔍 Reset search
    const search = document.getElementById("bookSearch");
    if (search) search.value = "";

    // 🔎 Hide search results
    const searchResults = document.getElementById("searchResults");
    if (searchResults) searchResults.style.display = "none";

    // 🎥 Close popups/media
    if (typeof stopAllVideos === "function") stopAllVideos();
    if (typeof closeBookPopup === "function") closeBookPopup();
  }

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      openTab(btn.dataset.tab, btn);
    });
  });

  // 🔑 Default tab
  const defaultBtn =
    document.querySelector('.tab-btn[data-tab="BeginningReader"]') || tabs[0];

  if (defaultBtn) {
    openTab(defaultBtn.dataset.tab, defaultBtn);
  }
});
