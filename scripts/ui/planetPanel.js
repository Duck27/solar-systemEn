import { planetInfo } from "../planetInfo.js";

let panel;
let nameEl;
let viewportEl;
let trackEl;
let dotsEl;
let prevBtn;
let nextBtn;

let currentId = null;
let currentSlide = 0;

function getViewportWidth() {
  const w = viewportEl.clientWidth;
  if (w > 0) return w;

  const style = getComputedStyle(panel);
  const pad =
    parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  return Math.max(panel.clientWidth - pad, 0);
}

function queueCarouselSync() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => syncCarouselLayout());
  });
}

function syncCarouselLayout() {
  const width = getViewportWidth();
  if (width <= 0) return;

  trackEl.style.setProperty("--slide-width", `${width}px`);
  goToSlide(currentSlide, false);
}

function formatSectionText(text) {
  return text
    .split(/\n\n+/)
    .map((p) => `<p class="planet-carousel__text">${p.trim()}</p>`)
    .join("");
}

function resetSlideScroll() {
  trackEl.querySelectorAll(".planet-carousel__content").forEach((el) => {
    el.scrollTop = 0;
  });
}

function goToSlide(index, animate = true) {
  const info = planetInfo[currentId];
  if (!info) return;

  const total = info.sections.length;
  currentSlide = ((index % total) + total) % total;

  const offset = currentSlide * getViewportWidth();

  if (!animate) {
    trackEl.style.transition = "none";
  }

  trackEl.style.transform = `translateX(-${offset}px)`;

  if (!animate) {
    trackEl.offsetHeight;
    trackEl.style.transition = "";
  }

  dotsEl.querySelectorAll(".planet-carousel__dot").forEach((dot, i) => {
    dot.classList.toggle("is-active", i === currentSlide);
  });

  resetSlideScroll();
}

function renderCarousel(id) {
  const info = planetInfo[id];
  if (!info) return;

  trackEl.innerHTML = info.sections
    .map(
      (section) => `
        <article class="planet-carousel__slide">
          <div class="planet-carousel__content">
            ${formatSectionText(section.text)}
          </div>
        </article>
      `,
    )
    .join("");

  dotsEl.innerHTML = info.sections
    .map(
      (_, i) =>
        `<button type="button" class="planet-carousel__dot${i === 0 ? " is-active" : ""}" data-index="${i}" aria-label="Секция ${i + 1}"></button>`,
    )
    .join("");

  dotsEl.querySelectorAll(".planet-carousel__dot").forEach((dot) => {
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      goToSlide(Number(dot.dataset.index));
    });
  });

  currentSlide = 0;
  trackEl.style.transform = "translateX(0)";
  queueCarouselSync();
}

export function initPlanetPanel() {
  panel = document.getElementById("planet-panel");
  nameEl = document.getElementById("planet-name");
  viewportEl = document.querySelector(".planet-carousel__viewport");
  trackEl = document.getElementById("carousel-track");
  dotsEl = document.getElementById("carousel-dots");
  prevBtn = document.getElementById("carousel-prev");
  nextBtn = document.getElementById("carousel-next");

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    goToSlide(currentSlide - 1);
  });

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    goToSlide(currentSlide + 1);
  });

  panel.addEventListener("click", (e) => e.stopPropagation());

  new ResizeObserver(() => {
    if (currentId) syncCarouselLayout();
  }).observe(viewportEl);

  panel.addEventListener("transitionend", (e) => {
    if (e.propertyName === "transform" && currentId) {
      syncCarouselLayout();
    }
  });

  window.addEventListener("resize", () => {
    if (currentId) queueCarouselSync();
  });
}

export function showPlanetPanel(id) {
  const info = planetInfo[id];
  if (!info) return;

  panel.dataset.theme = id;
  panel.classList.add("is-visible");

  if (currentId !== id) {
    currentId = id;
    nameEl.textContent = info.label;
    renderCarousel(id);
  } else {
    queueCarouselSync();
  }
}

export function hidePlanetPanel() {
  panel.classList.remove("is-visible");
  delete panel.dataset.theme;
  currentId = null;
  currentSlide = 0;
}
