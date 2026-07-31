import {
  getSimulationDate,
  formatDisplayDate,
} from "../time/simulationTime.js";

let clockEl = null;
let lastDisplayedSecond = -1;

export function initSimulationClock() {
  clockEl = document.getElementById("simulation-clock");
  updateSimulationClock(true);
}

export function updateSimulationClock(force = false) {
  if (!clockEl) return;

  const date = getSimulationDate();
  const sec = Math.floor(date.getTime() / 1000);
  if (!force && sec === lastDisplayedSecond) return;

  lastDisplayedSecond = sec;
  clockEl.textContent = formatDisplayDate(date);
  clockEl.dateTime = date.toISOString();
}
