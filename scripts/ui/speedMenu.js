import { settings } from "../settings.js";

const MODES = {
  realtime: { multiplier: 1 },
  x1000: { multiplier: 1_000 },
  x100000: { multiplier: 100_000 },
};

let activeMode = "x1000";

function applySpeed(multiplier) {
  settings.menuSpeedMultiplier = multiplier;

  if (!settings.isFocused && !settings.hoverPaused) {
    settings.speedMultiplier = multiplier;
  }
}

function formatMultiplier(value) {
  return String(value);
}

function parseCustomInput(raw) {
  const trimmed = String(raw).trim().replace(",", ".");
  if (!trimmed) return null;

  const value = Number(trimmed);
  if (!Number.isFinite(value)) return null;
  return value;
}

function updatePresetButtons(mode) {
  for (const button of document.querySelectorAll("[data-speed-mode]")) {
    button.classList.toggle("is-active", button.dataset.speedMode === mode);
  }
}

function syncCustomInput(multiplier) {
  const input = document.getElementById("speed-custom");
  if (input && document.activeElement !== input) {
    input.value = formatMultiplier(multiplier);
  }
}

function setSpeedMode(mode) {
  if (!MODES[mode]) return;

  activeMode = mode;
  applySpeed(MODES[mode].multiplier);
  updatePresetButtons(mode);
  syncCustomInput(MODES[mode].multiplier);
}

function setCustomSpeed(multiplier) {
  activeMode = "custom";
  applySpeed(multiplier);
  updatePresetButtons(null);
  syncCustomInput(multiplier);
}

export function initSpeedMenu() {
  const menu = document.getElementById("speed-menu");
  if (!menu) return;

  const input = document.getElementById("speed-custom");

  menu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-speed-mode]");
    if (button) {
      event.stopPropagation();
      setSpeedMode(button.dataset.speedMode);
      return;
    }

    if (event.target.closest("#speed-reverse")) {
      event.stopPropagation();
      setCustomSpeed(-settings.menuSpeedMultiplier);
    }
  });

  if (input) {
    const commitCustom = () => {
      const value = parseCustomInput(input.value);
      if (value === null) {
        syncCustomInput(settings.menuSpeedMultiplier);
        return;
      }
      setCustomSpeed(value);
    };

    input.addEventListener("keydown", (event) => {
      event.stopPropagation();
      if (event.key === "Enter") {
        event.preventDefault();
        commitCustom();
        input.blur();
      }
    });

    input.addEventListener("blur", commitCustom);
    input.addEventListener("click", (event) => event.stopPropagation());
    input.addEventListener("wheel", (event) => event.preventDefault(), {
      passive: false,
    });
  }

  setSpeedMode("x1000");
}
