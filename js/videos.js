function stopAllVideos() {
  document.querySelectorAll(".video-box").forEach(v => {
    const iframe = v.querySelector("iframe");
    if (iframe) {
      iframe.contentWindow.postMessage(
        '{"event":"command","func":"stopVideo","args":""}',
        "*"
      );
    }
    v.style.display = "none";
  });

  document.querySelectorAll(".watch-video-btn").forEach(b => {
    b.innerText = "Watch Video";
  });
}

document.addEventListener("click", e => {
  const btn = e.target.closest(".watch-video-btn");
  if (!btn) return;

  const id = btn.dataset.id;
  const box = document.querySelector(`.video-box[data-id="${id}"]`);
  if (!box) return;

  const open = box.style.display === "block";

  stopAllVideos();

  if (!open) {
    box.innerHTML = `
      <iframe width="100%" height="260"
        src="https://www.youtube.com/embed/${box.dataset.youtube}?enablejsapi=1"
        frameborder="0"
        allow="accelerometer; autoplay; encrypted-media"
        allowfullscreen>
      </iframe>
    `;
    box.style.display = "block";
    btn.innerText = "Hide Video";
  }
});
