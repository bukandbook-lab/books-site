document.addEventListener("DOMContentLoaded", () => {

  updateCartBadge(); 
  
  window.CATEGORY_ORDER = [...document.querySelectorAll(".tab-btn")]
  .map(btn => btn.dataset.tab)
  .filter(tab => !["ReadMeFirst", "RequestBook"].includes(tab));

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
/* =====================================
  Sequential Loading
===================================== */
window.BOOKS_READY.then(async () => {

  console.log("BeginningReader loaded. Sequential preload...");

  for (const cat of CATEGORY_ORDER) {

    if (cat === "BeginningReader") continue;
    if (CATEGORY_LOADED[cat]) continue;

    try {
      await loadCategory(cat);
      console.log(cat, "preloaded");
    } catch (err) {
      console.warn("Failed loading", cat);
    }

  }

});
/* =====================================
  AUTO SHOW/HIDE ARROWS
===================================== */
const tabs = document.getElementById("tabsContainer");
const arrowLeft = document.getElementById("tabArrowLeft");
const arrowRight = document.getElementById("tabArrowRight");

/* Update arrow visibility */
function updateTabArrows() {
  const maxScrollLeft = tabs.scrollWidth - tabs.clientWidth;

  arrowLeft.style.display = tabs.scrollLeft > 5 ? "block" : "none";
  arrowRight.style.display = tabs.scrollLeft < maxScrollLeft - 5 ? "block" : "none";
}

/* Arrow click scroll */
arrowLeft.addEventListener("click", () => {
  tabs.scrollBy({ left: -120, behavior: "smooth" });
});

arrowRight.addEventListener("click", () => {
  tabs.scrollBy({ left: 120, behavior: "smooth" });
});

/* Listen to scroll */
tabs.addEventListener("scroll", updateTabArrows);

/* Initial check */
window.addEventListener("load", updateTabArrows);
window.addEventListener("resize", updateTabArrows);


