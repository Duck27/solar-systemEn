import * as THREE from "three";

export const settings = {
  /** Выбор пользователя в меню: 1 | 1000 | 100000 */
  menuSpeedMultiplier: 1_000,
  /** Текущий множитель (меняется камерой и меню); 1 = реальное время */
  speedMultiplier: 1_000,
  /** Пауза при наведении на планету в режиме обзора */
  hoverPaused: false,
  isFocused: false,
};

/** dt в секундах симуляции за кадр */
export function getSimulationDelta(clock) {
  if (settings.hoverPaused) return 0;
  return clock.getDelta() * settings.speedMultiplier;
}

export const defaultCameraPos = new THREE.Vector3(60, 20, 40);
export const defaultTarget = new THREE.Vector3(0, 0, 0);

/** Максимальный радиус обзора — не дальше стартовой позиции камеры */
export const overviewMaxDistance =
  defaultCameraPos.distanceTo(defaultTarget) * 1.02;

/** Ускорение для обзора пояса — ~1 сим. сутки за секунду */
export const beltViewSpeedMultiplier = 86400;
