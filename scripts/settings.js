import * as THREE from "three";

export const settings = {
  menuSpeedMultiplier: 1_000,
  speedMultiplier: 1_000,
  hoverPaused: false,
  isFocused: false,
};

export function getSimulationDelta(clock) {
  if (settings.hoverPaused) return 0;
  return clock.getDelta() * settings.speedMultiplier;
}

export const defaultCameraPos = new THREE.Vector3(60, 20, 40);
export const defaultTarget = new THREE.Vector3(0, 0, 0);

export const overviewMaxDistance =
  defaultCameraPos.distanceTo(defaultTarget) * 1.02;

export const beltViewSpeedMultiplier = 86400;
