/** Текущая дата/время симуляции (начинается с локального времени пользователя) */
let simulationDate = new Date();

/** Накопленные миллисекунды симуляции (для точного учёта дробных минут) */
let accumulatedSimMs = 0;

const MONTHS = [
  "янв",
  "фев",
  "мар",
  "апр",
  "май",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
];

/** Инициализация — берём локальное время пользователя */
export function initSimulationTime(date = new Date()) {
  simulationDate = new Date(date);
  accumulatedSimMs = 0;
}

/** dt — секунды симуляции за кадр (из getSimulationDelta) */
export function advanceSimulationTime(dtSeconds) {
  if (dtSeconds === 0) return;
  accumulatedSimMs += dtSeconds * 1000;
  simulationDate = new Date(simulationDate.getTime() + dtSeconds * 1000);
}

export function getSimulationDate() {
  return new Date(simulationDate);
}

/** Формат для NASA Horizons: '2025-Jul-31 16:33' */
export function formatForHorizons(date) {
  const y = date.getFullYear();
  const mon = MONTHS[date.getMonth()];
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${mon}-${d} ${h}:${m}`;
}

/** Человекочитаемый формат для UI */
export function formatDisplayDate(date) {
  return date.toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
