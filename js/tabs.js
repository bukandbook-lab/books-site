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

      document.getElementById(target).style.display = "block";
      btn.classList.add("active");
      
  loadBooks(target); // 🔥 THIS IS THE KEY

      // close videos & popups when switching tabs
      stopAllVideos();
      closeComicPopup();
    });
  });

  // ✅ DEFAULT TAB (HOME)
  hideAll();
  document.getElementById("BeginningReader").style.display = "block";
  document.querySelector('.tab-btn[data-tab="BeginningReader"]').classList.add("active");
});
