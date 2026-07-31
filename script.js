import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Импорты твоих модулей
import { planetsData, orbitSpeed } from "./scripts/planetsData.js";
import {
  getSimulationDelta,
  settings,
  overviewMaxDistance,
} from "./scripts/settings.js";
import { initSpeedMenu } from "./scripts/ui/speedMenu.js";
import { initRenderer, initComposer } from "./scripts/core/renderer.js";
import {
  createPlanet,
  updatePlanet,
  updateOrbitRingResolution,
} from "./scripts/world/planets.js";
import { initStars } from "./scripts/world/stars.js";
import { initAsteroidBelt } from "./scripts/world/asteroids.js";
import {
  checkIntersection,
  checkHover,
} from "./scripts/utils/intersections.js";
import {
  moveToPlanet,
  moveToBelt,
  returnToOverview,
  isTweening,
  selectedPlanet,
} from "./scripts/core/camera.js";
import {
  initPlanetPanel,
  showPlanetPanel,
  hidePlanetPanel,
} from "./scripts/ui/planetPanel.js";
import {
  initSimulationTime,
  advanceSimulationTime,
  getSimulationDate,
} from "./scripts/time/simulationTime.js";
import {
  fetchPlanetPositions,
  applyFallbackPositions,
  applyPositionsToPlanets,
} from "./scripts/nasa/horizons.js";
import {
  initSimulationClock,
  updateSimulationClock,
} from "./scripts/ui/simulationClock.js";

// --- Инициализация ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(60, 20, 40);

const renderer = initRenderer();
const { composer, bloomPass } = initComposer(renderer, scene, camera);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxDistance = overviewMaxDistance;
controls.minDistance = 3;

// Свет
const sunLight = new THREE.PointLight(0xffffff, 1500, 0, 2);
scene.add(sunLight, new THREE.AmbientLight(0xffffff, 0.35));

// Создание мира
for (const name in planetsData) {
  createPlanet(name, scene);
}
const starsLayers = initStars(scene);
const asteroidBelt = initAsteroidBelt(scene);

// --- UI ---
initPlanetPanel();
initSpeedMenu();

// --- Время и позиции планет ---
initSimulationTime(new Date());
initSimulationClock();
applyFallbackPositions(getSimulationDate());

fetchPlanetPositions(getSimulationDate())
  .then(({ positions }) => {
    applyPositionsToPlanets(positions);
  })
  .catch(() => {});

// --- Обработка кликов ---
window.addEventListener("click", (event) => {
  checkIntersection(
    event,
    camera,
    settings,
    (id, data) => {
      moveToPlanet(data, camera, controls);
      showPlanetPanel(id);
    },
    () => {
      returnToOverview(camera, controls);
      hidePlanetPanel();
    },
    // Пояс астероидов — дополнительный кликабельный объект
    [
      {
        mesh: asteroidBelt,
        onHit: () => {
          moveToBelt(camera, controls);
          showPlanetPanel("asteroidBelt");
        },
      },
    ],
  );
});

// --- Пауза при наведении на планету ---
window.addEventListener("pointermove", (event) => {
  if (settings.isFocused || isTweening) {
    settings.hoverPaused = false;
    document.body.style.cursor = "";
    return;
  }

  const hovered = checkHover(event, camera);
  settings.hoverPaused = hovered;
  document.body.style.cursor = hovered ? "pointer" : "";
});

// --- Loop ---
const clock = new THREE.Clock();
const _pPos = new THREE.Vector3();

function tick() {
  requestAnimationFrame(tick);

  if (!isTweening) controls.update();

  const dt = getSimulationDelta(clock);
  advanceSimulationTime(dt);
  updateSimulationClock();
  const elapsedTime = clock.getElapsedTime();

  // Обновление звезд
  starsLayers.forEach((layer) => {
    layer.material.uniforms.uTime.value = elapsedTime;
  });

  // Вращение пояса астероидов (~4.6 зем. лет — средний период пояса)
  asteroidBelt.rotation.y += orbitSpeed(4.6) * dt;

  // Обновление планет
  for (const name in planetsData) {
    if (planetsData[name].mesh?.body) {
      updatePlanet(planetsData[name], dt);
    }
  }

  // Слежение за планетой
  if (selectedPlanet && settings.isFocused && !isTweening) {
    selectedPlanet.mesh.body.getWorldPosition(_pPos);
    controls.target.copy(_pPos);
  }

  composer.render();
}
tick();

// --- Ресайз ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  updateOrbitRingResolution(window.innerWidth, window.innerHeight);
});
