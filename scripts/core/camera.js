import gsap from "gsap";
import * as THREE from "three";
import { settings, defaultCameraPos, defaultTarget, overviewMaxDistance, beltViewSpeedMultiplier } from "../settings.js";

export let isTweening = false;
export let selectedPlanet = null;

const _v = new THREE.Vector3();

// Фиксированная позиция обзора пояса астероидов (на пределе радиуса обзора)
const beltCamPos = new THREE.Vector3(40, 45, 55)
  .normalize()
  .multiplyScalar(overviewMaxDistance);
const beltTarget = new THREE.Vector3(0, 0, 0);

export function moveToPlanet(data, camera, controls) {
  selectedPlanet = data;
  settings.isFocused = false;
  isTweening = true;
  controls.enabled = false;

  const distance = data.mesh.size * 2;
  const startCamPos = camera.position.clone();
  const startTarget = controls.target.clone();

  gsap.to(settings, { speedMultiplier: 0, duration: 2, ease: "power2.out" });

  const tween = { p: 0 };
  gsap.to(tween, {
    p: 1,
    duration: 2,
    ease: "power2.inOut",
    onUpdate: () => {
      data.mesh.body.getWorldPosition(_v);
      const p = tween.p;
      controls.target.set(
        startTarget.x + (_v.x - startTarget.x) * p,
        startTarget.y + (_v.y - startTarget.y) * p,
        startTarget.z + (_v.z - startTarget.z) * p
      );
      camera.position.set(
        startCamPos.x + (_v.x + distance - startCamPos.x) * p,
        startCamPos.y + (_v.y + distance / 2 - startCamPos.y) * p,
        startCamPos.z + (_v.z + distance - startCamPos.z) * p
      );
      camera.lookAt(controls.target);
    },
    onComplete: () => {
      settings.isFocused = true;
      controls.maxDistance = Math.max(data.mesh.size * 25, 20);
      controls.enabled = true;
      requestAnimationFrame(() => { isTweening = false; });
    },
  });
}

export function moveToBelt(camera, controls) {
  selectedPlanet = null;
  settings.isFocused = false;
  isTweening = true;
  controls.enabled = false;

  const startCamPos = camera.position.clone();
  const startTarget = controls.target.clone();

  // Немного замедляем время — видно движение астероидов, но не слишком быстро
  gsap.to(settings, { speedMultiplier: beltViewSpeedMultiplier, duration: 2, ease: "power2.inOut" });

  const tween = { p: 0 };
  gsap.to(tween, {
    p: 1,
    duration: 2.2,
    ease: "power2.inOut",
    onUpdate: () => {
      camera.position.lerpVectors(startCamPos, beltCamPos, tween.p);
      controls.target.lerpVectors(startTarget, beltTarget, tween.p);
      camera.lookAt(controls.target);
    },
    onComplete: () => {
      camera.position.copy(beltCamPos);
      controls.target.copy(beltTarget);
      camera.lookAt(controls.target);
      controls.maxDistance = overviewMaxDistance;
      // isFocused = true, чтобы клик по пустому месту возвращал в обзор
      settings.isFocused = true;
      controls.enabled = true;
      requestAnimationFrame(() => { isTweening = false; });
    },
  });
}

export function returnToOverview(camera, controls) {
  selectedPlanet = null;
  settings.isFocused = false;
  isTweening = true;
  controls.enabled = false;

  const startCamPos = camera.position.clone();
  const startTarget = controls.target.clone();

  gsap.to(settings, { speedMultiplier: settings.menuSpeedMultiplier, duration: 2, ease: "power2.inOut" });

  const tween = { p: 0 };
  gsap.to(tween, {
    p: 1,
    duration: 2,
    ease: "power2.inOut",
    onUpdate: () => {
      camera.position.lerpVectors(startCamPos, defaultCameraPos, tween.p);
      controls.target.lerpVectors(startTarget, defaultTarget, tween.p);
      camera.lookAt(controls.target);
    },
    onComplete: () => {
      camera.position.copy(defaultCameraPos);
      controls.target.copy(defaultTarget);
      camera.lookAt(controls.target);
      controls.maxDistance = overviewMaxDistance;
      controls.enabled = true;
      requestAnimationFrame(() => { isTweening = false; });
    },
  });
}
