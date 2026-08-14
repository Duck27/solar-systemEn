let simulationDate = new Date();
let accumulatedSimMs = 0;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function initSimulationTime(date = new Date()) {
  simulationDate = new Date(date);
  accumulatedSimMs = 0;
}

export function advanceSimulationTime(dtSeconds) {
  if (dtSeconds === 0) return;
  accumulatedSimMs += dtSeconds * 1000;
  simulationDate = new Date(simulationDate.getTime() + dtSeconds * 1000);
}

export function getSimulationDate() {
  return new Date(simulationDate);
}

export function formatForHorizons(date) {
  const y = date.getFullYear();
  const mon = MONTHS[date.getMonth()];
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${mon}-${d} ${h}:${m}`;
}

export function formatDisplayDate(date) {
  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
