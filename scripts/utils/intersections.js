import * as THREE from "three";
import { planetsData } from "../planetsData.js";

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function collectClickableTargets() {
  const targets = [];

  for (const name in planetsData) {
    const planet = planetsData[name];
    if (planet.mesh?.body) {
      targets.push({ id: name, mesh: planet.mesh.body, data: planet });
    }

    if (planet.satellites) {
      for (const satName in planet.satellites) {
        const satellite = planet.satellites[satName];
        if (satellite.mesh?.body && satellite.infoId) {
          targets.push({
            id: satellite.infoId,
            mesh: satellite.mesh.body,
            data: satellite,
          });
        }
      }
    }
  }

  return targets;
}

const UI_SELECTORS =
  "#planet-panel, #speed-menu, #object-menu, .planet-panel, .speed-menu, .object-menu";

function isUiTarget(target) {
  return target instanceof Element && target.closest(UI_SELECTORS);
}

function castRay(event, camera) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
}

export function checkHover(event, camera, extraMeshes = []) {
  if (isUiTarget(event.target)) return false;

  castRay(event, camera);

  const targets = collectClickableTargets();
  const meshes = [...targets.map((t) => t.mesh), ...extraMeshes];
  const intersects = raycaster.intersectObjects(meshes);

  return intersects.length > 0;
}

export function checkIntersection(
  event,
  camera,
  settings,
  onTargetClick,
  onEmptyClick,
  extraTargets = [],
) {
  if (isUiTarget(event.target)) return;

  castRay(event, camera);

  if (extraTargets.length > 0) {
    const extraMeshes = extraTargets.map((t) => t.mesh);
    const extraHits = raycaster.intersectObjects(extraMeshes);
    if (extraHits.length > 0) {
      const hit = extraTargets.find((t) => t.mesh === extraHits[0].object);
      if (hit) {
        hit.onHit();
        return;
      }
    }
  }

  const targets = collectClickableTargets();
  const meshes = targets.map((t) => t.mesh);
  const intersects = raycaster.intersectObjects(meshes);

  if (intersects.length > 0) {
    const clickedMesh = intersects[0].object;
    const target = targets.find((t) => t.mesh === clickedMesh);
    if (target) onTargetClick(target.id, target.data);
  } else if (settings.isFocused) {
    onEmptyClick();
  }
}
