
function renderRequestForm(type) {
  const box = document.getElementById("requestForm");
  if (!box) return;

  if (type === "single") {
    box.innerHTML = `
      <input id="reqTitle" placeholder="Book title">
      <input id="reqAuthor" placeholder="Author (optional)">

      <div class="price-box" data-mode="single">
        RM1 / book
        <img class="cart-icon">
      </div>
    `;
  }

  if (type === "multiple") {
    box.innerHTML = `
      <input type="number" id="reqCount" min="1" value="1">
      <div id="multiTitles"></div>
      <input id="reqAuthor" placeholder="Author (optional)">

      <div class="price-box" data-mode="multiple">
        RM1 / book
        <img class="cart-icon">
      </div>
    `;
    updateMultiInputs(1);
  }

  if (type === "series") {
    box.innerHTML = `
      <input id="reqSeries" placeholder="Series name">
      <input id="reqAuthor" placeholder="Author (optional)">

      <div class="price-box" data-mode="series">
        RM4 / set
        <img class="cart-icon">
      </div>
    `;
  }
}
