import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { planetsData } from "../planetsData.js";

const textureLoader = new THREE.TextureLoader();

const ORBIT_SEGMENTS = 256;
const orbitLineMaterials = [];

// Line2 рисует линию с постоянной толщиной в экранных пикселях — орбита не
// исчезает при остром наклоне и на дальних дистанциях (в отличие от TorusGeometry
// и плоских RingGeometry / LineLoop).
function createOrbitRing(radius, color = 0x4488cc, opacity = 0.6) {
  const positions = [];
  for (let i = 0; i <= ORBIT_SEGMENTS; i++) {
    const angle = (i / ORBIT_SEGMENTS) * Math.PI * 2;
    positions.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  }

  const geometry = new LineGeometry();
  geometry.setPositions(positions);

  const material = new LineMaterial({
    color,
    linewidth: 1.4,
    worldUnits: false,
    transparent: true,
    opacity,
    depthWrite: false,
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
  });
  orbitLineMaterials.push(material);

  const ring = new Line2(geometry, material);
  ring.computeLineDistances();
  ring.frustumCulled = false;
  ring.renderOrder = 1;
  return ring;
}

export function updateOrbitRingResolution(width, height) {
  const resolution = new THREE.Vector2(width, height);
  for (const material of orbitLineMaterials) {
    material.resolution.copy(resolution);
  }
}

export function createPlanet(name, scene) {
  const data = planetsData[name];
  if (!data.mesh) return;

  // Чем крупнее планета — тем более детальная сфера
  const segments = data.mesh.size > 1 ? 64 : 32;
  const geometry = new THREE.SphereGeometry(data.mesh.size, segments, segments);

  const texture = data.mesh.texture
    ? textureLoader.load(data.mesh.texture)
    : null;
  if (texture) texture.colorSpace = THREE.SRGBColorSpace;

  const material = data.mesh.isSun
    ? new THREE.MeshBasicMaterial({ map: texture })
    : new THREE.MeshStandardMaterial({ map: texture });

  const planetMesh = new THREE.Mesh(geometry, material);

  const orbitPivot = new THREE.Object3D();
  scene.add(orbitPivot);

  const tiltPivot = new THREE.Object3D();
  tiltPivot.position.set(data.orbit.radius, 0, 0);
  orbitPivot.add(tiltPivot);

  if (data.mesh.tiltDeg != null) {
    tiltPivot.rotation.z = -THREE.MathUtils.degToRad(data.mesh.tiltDeg);
  }

  tiltPivot.add(planetMesh);

  // Облачный слой (если задан в данных планеты)
  if (data.mesh.clouds) {
    const cloudTex = textureLoader.load(data.mesh.clouds);
    cloudTex.colorSpace = THREE.SRGBColorSpace;

    const cloudGeo = new THREE.SphereGeometry(
      data.mesh.size + 0.05,
      segments,
      segments,
    );
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      alphaMap: cloudTex, // чёрные области = прозрачные, белые = облака
      transparent: true,
      depthWrite: false,
      opacity: 0.9,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    tiltPivot.add(cloudMesh);
    data.mesh.cloudBody = cloudMesh;
  }

  if (!data.mesh.isSun) {
    data.orbit.line = createOrbitRing(data.orbit.radius, 0x87cefa, 0.5);
    scene.add(data.orbit.line);
  }

  data.mesh.body = planetMesh;
  data.orbit.pivot = orbitPivot;

  if (data.satellites) {
    for (const satelliteName in data.satellites) {
      const satellite = data.satellites[satelliteName];
      const segments = satellite.mesh.size > 1 ? 64 : 32;
      const geo = new THREE.SphereGeometry(
        satellite.mesh.size,
        segments,
        segments,
      );

      const tex = satellite.mesh.texture
        ? textureLoader.load(satellite.mesh.texture)
        : null;
      if (tex) tex.colorSpace = THREE.SRGBColorSpace;

      const mat = new THREE.MeshStandardMaterial({ map: tex });
      const satelliteMesh = new THREE.Mesh(geo, mat);

      // Пивот орбиты спутника вокруг планеты
      const satPivot = new THREE.Object3D();
      tiltPivot.add(satPivot);

      // Кольцо орбиты спутника (видно вокруг планеты)
      satellite.orbit.line = createOrbitRing(
        satellite.orbit.radius,
        0x336688,
        0.45,
      );
      satPivot.add(satellite.orbit.line);

      satelliteMesh.position.set(satellite.orbit.radius, 0, 0);
      satPivot.add(satelliteMesh);

      satellite.mesh.body = satelliteMesh;
      satellite.orbit.pivot = satPivot;
    }
  }
}

export function setOrbitAngle(data, angleRadians) {
  data.orbit.angle = angleRadians;
  if (data.orbit.pivot) {
    data.orbit.pivot.rotation.y = angleRadians;
  }
}

export function updatePlanet(data, dt) {
  data.orbit.angle += data.orbit.speed * dt;
  data.orbit.pivot.rotation.y = data.orbit.angle;
  data.mesh.body.rotation.y += data.mesh.rotationSpeed * dt;

  // Облака вращаются чуть быстрее поверхности
  if (data.mesh.cloudBody) {
    data.mesh.cloudBody.rotation.y += data.mesh.rotationSpeed * 1.15 * dt;
  }

  // Обновляем спутники, если они есть
  if (data.satellites) {
    for (const key in data.satellites) {
      const sat = data.satellites[key];
      sat.orbit.angle += sat.orbit.speed * dt;
      sat.orbit.pivot.rotation.y = sat.orbit.angle;
      sat.mesh.body.rotation.y += sat.mesh.rotationSpeed * dt;
    }
  }
}
