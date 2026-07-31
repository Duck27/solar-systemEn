import { settings } from "../settings.js";

const MODES = {
  realtime: { multiplier: 1, label: "Реальное время" },
  x1000: { multiplier: 1_000, label: "×1000" },
  x100000: { multiplier: 100_000, label: "×100 000" },
};

let activeMode = "x1000";

function setSpeedMode(mode) {
  if (!MODES[mode]) return;

  activeMode = mode;
  settings.menuSpeedMultiplier = MODES[mode].multiplier;

  if (!settings.isFocused && !settings.hoverPaused) {
    settings.speedMultiplier = settings.menuSpeedMultiplier;
  }

  for (const button of document.querySelectorAll("[data-speed-mode]")) {
    button.classList.toggle("is-active", button.dataset.speedMode === mode);
  }
}

export function initSpeedMenu() {
  const menu = document.getElementById("speed-menu");
  if (!menu) return;

  menu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-speed-mode]");
    if (!button) return;
    event.stopPropagation();
    setSpeedMode(button.dataset.speedMode);
  });

  setSpeedMode("x1000");
}
