document.addEventListener("DOMContentLoaded", () => {

  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tabcontent");

  function hideAll() {
    contents.forEach(c => c.style.display = "none");
  }

  function deactivateTabs() {
    tabs.forEach(t => t.classList.remove("active"));
  }

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;

      hideAll();
      deactivateTabs();

      const panel = document.getElementById(target);
      if (panel) panel.style.display = "block";

      btn.classList.add("active");

      // 🔑 LOAD DATA
      loadBooks(target);

      // close videos & popups when switching tabs
      if (typeof stopAllVideos === "function") stopAllVideos();
      if (typeof closeBookPopup === "function") closeBookPopup();
    });
  });

  // ✅ DEFAULT TAB (HOME)
  hideAll();
  const home = document.getElementById("BeginningReader");
  if (home) home.style.display = "block";

  const homeBtn = document.querySelector('.tab-btn[data-tab="BeginningReader"]');
  if (homeBtn) homeBtn.classList.add("active");

  // 🔥 THIS WAS MISSING
  loadBooks("BeginningReader");

});
