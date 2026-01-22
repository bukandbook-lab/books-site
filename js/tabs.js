document.addEventListener("DOMContentLoaded", () => {

  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tabcontent");

  function hideAll() {
    contents.forEach(c => (c.style.display = "none"));
  }

  function deactivateTabs() {
    tabs.forEach(t => t.classList.remove("active"));
  }

  function openTab(target, btn) {
    hideAll();
    deactivateTabs();

    const panel = document.getElementById(target);
    if (!panel) {
      console.error("Tab not found:", target);
      return;
    }

    // ✅ SHOW PANEL FIRST
    panel.style.display = "block";
    if (btn) btn.classList.add("active");

    // ✅ THEN LOAD BOOKS
    BOOKS_READY.then(() => {
      loadBooks(target);
    });

    const search = document.getElementById("bookSearch");
    if (search) search.value = "";

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
    document.querySelector('.tab-btn[data-tab="BeginningReader"]') || tabs[0];

  if (defaultBtn) {
    BOOKS_READY.then(() => {
      openTab(defaultBtn.dataset.tab, defaultBtn);
    });
  }
});
