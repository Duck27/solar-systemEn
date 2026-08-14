import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
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
import {
  preloadPlanetTextures,
  applyAnisotropy,
} from "./scripts/assets/textureCache.js";

async function bootstrap() {
  const loadingEl = document.getElementById("loading-screen");

  await preloadPlanetTextures(planetsData, (loaded, total) => {
    if (loadingEl) {
      loadingEl.textContent = `Loading textures… ${loaded}/${total}`;
    }
  });

  if (loadingEl) loadingEl.classList.add("is-hidden");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(60, 20, 40);

  const renderer = initRenderer();
  applyAnisotropy(renderer);
  const { composer } = initComposer(renderer, scene, camera);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxDistance = overviewMaxDistance;
  controls.minDistance = 3;

  const sunLight = new THREE.PointLight(0xffffff, 1500, 0, 2);
  scene.add(sunLight, new THREE.AmbientLight(0xffffff, 0.35));

  for (const name in planetsData) {
    createPlanet(name, scene);
  }
  const starsLayers = initStars(scene);
  const asteroidBelt = initAsteroidBelt(scene);

  initPlanetPanel();
  initSpeedMenu();

  initSimulationTime(new Date());
  initSimulationClock();
  applyFallbackPositions(getSimulationDate());

  fetchPlanetPositions(getSimulationDate())
    .then(({ positions }) => {
      applyPositionsToPlanets(positions);
    })
    .catch(() => {});

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

  const clock = new THREE.Clock();
  const _pPos = new THREE.Vector3();

  function tick() {
    requestAnimationFrame(tick);

    if (!isTweening) controls.update();

    const dt = getSimulationDelta(clock);
    advanceSimulationTime(dt);
    updateSimulationClock();
    const elapsedTime = clock.getElapsedTime();

    starsLayers.forEach((layer) => {
      layer.material.uniforms.uTime.value = elapsedTime;
    });

    asteroidBelt.rotation.y += orbitSpeed(4.6) * dt;

    for (const name in planetsData) {
      if (planetsData[name].mesh?.body) {
        updatePlanet(planetsData[name], dt);
      }
    }

    if (selectedPlanet && settings.isFocused && !isTweening) {
      selectedPlanet.mesh.body.getWorldPosition(_pPos);
      controls.target.copy(_pPos);
    }

    composer.render();
  }
  tick();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    updateOrbitRingResolution(window.innerWidth, window.innerHeight);
  });
}

bootstrap();
