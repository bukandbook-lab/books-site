/* =====================================
   GLOBAL BOOK DATA LOADER (RUN ONCE)
===================================== */

window.ALL_BOOKS = {};
window.BOOK_REGISTRY = {};
window.ORDERED_BOOKS_BY_CATEGORY = {};

/* =========================================================
   BOOK DATA SOURCES
========================================================= */
const BOOK_SOURCES = [
  {
    key: "BeginningReader",
    url: "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/BeginningReaderData.json"
  },
  {
    key: "ChapterBook",
    url: "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/ChapterBookData.json"
  },
  {
    key: "PictureBook",
    url: "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/PictureBookData.json"
  },
  {
    key: "Novel",
    url: "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/NovelData.json"
  },
  {
    key: "Islamic",
    url: "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/islamicdata.json"
  },
  {
    key: "Melayu",
    url: "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/MelayuData.json"
  },
  {
    key: "Jawi",
    url: "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/jawidata.json"
  },
  {
    key: "Comic",
    url: "https://raw.githubusercontent.com/bukandbook-lab/books-site/main/data/comicdata.json"
  },
];
/* ==============================
   YOUTUBE LINK NORMALIZER FOR DATA HAS THAT YOUTUBE ID
================================ */
function normalizeYouTubeEmbed(input) {
  if (!input) return null;

  const raw = input.trim();
  if (raw === "#VALUE!" || raw === "N/A") return null;

  let videoId = null;

  // 1️⃣ Already just an ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
    videoId = raw;
  }

  // 2️⃣ youtube.com/watch?v=
  else if (raw.includes("watch?v=")) {
    videoId = new URL(raw).searchParams.get("v");
  }

  // 3️⃣ youtu.be/ID
  else if (raw.includes("youtu.be/")) {
    videoId = raw.split("youtu.be/")[1].split(/[?&]/)[0];
  }

  // 4️⃣ youtube.com/shorts/ID
  else if (raw.includes("/shorts/")) {
    videoId = raw.split("/shorts/")[1].split(/[?&]/)[0];
  }

  if (!videoId) return null;

  return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}

/* ==============================
   YOUTUBE LINK NORMALIZER FOR DATA HAS THAT YOUTUBE LINK
================================ */

function toYouTubeEmbed(url) {
  if (!url || typeof url !== "string") return null;

  const clean = url.trim();

  if (
    clean === "" ||
    clean === "#VALUE!" ||
    clean.toUpperCase() === "N/A"
  ) return null;

  let videoId = null;

  try {
    const u = new URL(clean);

    // ▶ Normal YouTube
    if (u.hostname.includes("youtube.com")) {
      // watch?v=ID
      if (u.searchParams.get("v")) {
        videoId = u.searchParams.get("v");
      }

      // shorts/ID
      else if (u.pathname.startsWith("/shorts/")) {
        videoId = u.pathname.split("/shorts/")[1];
      }

      // embed/ID (already embed)
      else if (u.pathname.startsWith("/embed/")) {
        videoId = u.pathname.split("/embed/")[1];
      }
    }

    // ▶ youtu.be short link
    if (u.hostname.includes("youtu.be")) {
      videoId = u.pathname.slice(1);
    }

  } catch (e) {
    return null;
  }

  if (!videoId) return null;

  // strip anything extra
  videoId = videoId.split(/[?&/]/)[0];

  return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}

/* =========================================================
   LOAD ALL BOOK DATA
========================================================= */
window.CATEGORY_ORDER = [];
window.BOOKS_READY = Promise.all(
  BOOK_SOURCES.map((source, index) =>
    fetch(source.url)
      .then(res => res.json())
      .then(data => {

        const category = source.key;
        const categoryIndex = index + 1; // 👈 CATEGORY NUMBER

        CATEGORY_ORDER.push(category);
        ALL_BOOKS[category] = data;
        ORDERED_BOOKS_BY_CATEGORY[category] = [];

        data.forEach(book => {
          const id = book.id || book.ID || book["Book ID"];
          if (!id) return;

          ORDERED_BOOKS_BY_CATEGORY[category].push(id);
           
const video = normalizeYouTubeEmbed(
  book["Youtube ID"] || book["YT Link"] || ""
);

const videoAlt = normalizeYouTubeEmbed(
  book["YT Alternative"] || ""
);




          BOOK_REGISTRY[id] = {
            id,
            category,
            categoryIndex, // 
            title: book.title || book["Book Title"] || "Untitled",
            img: book.image || book.Link || "",
            price: Number(book.price || book["Price"] || 0),
            SetQtty: book.qtty || book["No. of Books"] || 0,
            SetTotal: Number( book["Set Total"] || 0),

              video,       // ✅ normalized embed URL
              videoAlt,    // ✅ optional fallback
            
             Author: book["Author"] || "",
             Status: book["Status"] || "",
             MissingTitle: book["Missing Title"] || "",
             Series: book["Series"] || "",
            
     // 🔑 FIXED TAG NORMALIZATION
tags: typeof book["Tag"] === "string"
  ? book["Tag"]
      .split(",")
      .map(t => t.trim())
      .filter(Boolean)
  : Array.isArray(book["Tag"])
    ? book["Tag"]
    : []

          };
        });
      })
  )
);

