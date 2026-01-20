document.addEventListener("DOMContentLoaded", () => {

  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tabcontent");

  function hideAll() {
    contents.forEach(c => c.style.display = "none");
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

    panel.style.display = "block";
    if (btn) btn.classList.add("active");

    // 🔑 LOAD BOOKS FOR THIS TAB
    if (typeof loadBooks === "function") {
      loadBooks(target);
    }

    // 🔍 RESET SEARCH
    const search = document.getElementById("bookSearch");
    if (search) search.value = "";

    // 🎥 CLOSE MEDIA / POPUPS
    if (typeof stopAllVideos === "function") stopAllVideos();
    if (typeof closeBookPopup === "function") closeBookPopup();
  }

  /* =========================
     TAB CLICK HANDLER
  ========================= */
  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      openTab(target, btn);
    });
  });

  /* =========================
     DEFAULT TAB ON LOAD
  ========================= */
  const defaultBtn =
    document.querySelector('.tab-btn[data-tab="BeginningReader"]') ||
    tabs[0];

  if (defaultBtn) {
    openTab(defaultBtn.dataset.tab, defaultBtn);
  }

});
