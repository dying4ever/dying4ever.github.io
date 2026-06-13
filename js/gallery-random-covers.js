const galleryCovers = [
  "/images/gallery/cover-01.webp",
  "/images/gallery/cover-02.webp",
  "/images/gallery/cover-03.webp",
  "/images/gallery/cover-04.webp",
  "/images/gallery/cover-05.webp",
  "/images/gallery/cover-06.webp",
  "/images/gallery/cover-07.webp",
  "/images/gallery/cover-08.webp",
  "/images/gallery/cover-09.webp",
  "/images/gallery/cover-10.webp",
  "/images/gallery/cover-11.webp",
  "/images/gallery/cover-12.webp",
  "/images/gallery/cover-13.webp",
  "/images/gallery/cover-14.webp",
  "/images/gallery/cover-15.webp",
  "/images/gallery/cover-16.webp",
  "/images/gallery/cover-17.webp",
  "/images/gallery/cover-18.webp",
  "/images/gallery/cover-19.webp"
];

function shuffle(values) {
  const result = values.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function randomCoverQueue(count) {
  const queue = [];
  while (queue.length < count) {
    queue.push(...shuffle(galleryCovers));
  }
  return queue.slice(0, count);
}

function applyGalleryCovers() {
  if (!galleryCovers.length) return;

  const targets = [
    ...document.querySelectorAll(".index.wrap .segments.sticky .cover img"),
    ...document.querySelectorAll(".index.wrap .cards > .item > .cover")
  ];
  if (!targets.length) return;

  const covers = randomCoverQueue(targets.length);
  targets.forEach((target, index) => {
    const cover = covers[index];
    if (target.tagName === "IMG") {
      target.src = cover;
      target.removeAttribute("srcset");
      target.dataset.galleryCover = "true";
      return;
    }

    target.style.backgroundImage = `url("${cover}")`;
    target.removeAttribute("data-background-image");
    target.dataset.galleryCover = "true";
  });
}

function scheduleGalleryCovers() {
  requestAnimationFrame(applyGalleryCovers);
}

document.addEventListener("DOMContentLoaded", scheduleGalleryCovers);
document.addEventListener("pjax:success", scheduleGalleryCovers);
document.addEventListener("pjax:complete", scheduleGalleryCovers);
