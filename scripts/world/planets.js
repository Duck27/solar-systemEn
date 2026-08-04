import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { planetsData } from "../planetsData.js";
import { getCachedTexture } from "../assets/textureCache.js";

const ORBIT_SEGMENTS = 256;
const orbitLineMaterials = [];

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

function createProceduralRingTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");

  for (let y = 0; y < canvas.height; y++) {
    const t = y / canvas.height;
    let alpha = 0.55 + Math.sin(t * 120) * 0.12 + Math.sin(t * 37) * 0.08;

    if (t > 0.5 && t < 0.58) alpha *= 0.08;
    if (Math.sin(t * 200) > 0.92) alpha *= 0.35;

    if (t < 0.06) alpha *= t / 0.06;
    if (t > 0.94) alpha *= (1 - t) / 0.06;

    const lightness = 58 + t * 22 + Math.sin(t * 90) * 8;
    ctx.fillStyle = `hsla(38, 42%, ${lightness}%, ${Math.min(1, Math.max(0, alpha))})`;
    ctx.fillRect(0, y, canvas.width, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createPlanetRings(planetSize, config) {
  const inner = planetSize * config.innerScale;
  const outer = planetSize * config.outerScale;
  const geometry = new THREE.RingGeometry(inner, outer, 128);

  const material = new THREE.MeshBasicMaterial({
    map: createProceduralRingTexture(),
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    opacity: config.opacity ?? 0.93,
  });

  const rings = new THREE.Mesh(geometry, material);
  rings.rotation.x = -Math.PI / 2;
  rings.renderOrder = 2;
  return rings;
}

function createBodyMaterial(data) {
  const texture = data.mesh.texture ? getCachedTexture(data.mesh.texture) : null;
  const fallback = data.mesh.fallbackColor ?? 0x888888;

  if (data.mesh.isSun) {
    return new THREE.MeshBasicMaterial({
      map: texture,
      color: fallback,
    });
  }

  return new THREE.MeshStandardMaterial({
    map: texture,
    color: fallback,
  });
}

function applyAxialTilt(object, tiltDeg, tiltLonDeg = 0) {
  const tilt = THREE.MathUtils.degToRad(tiltDeg);
  const lon = THREE.MathUtils.degToRad(tiltLonDeg);
  const dirX = Math.sin(lon);
  const dirZ = Math.cos(lon);
  const axis = new THREE.Vector3(dirZ, 0, -dirX).normalize();
  object.quaternion.setFromAxisAngle(axis, tilt);
}

function applyHeliocentricTransform(data) {
  const angle = data.orbit.angle;
  const radius = data.orbit.radius;
  data.orbit.pivot.position.set(
    Math.cos(angle) * radius,
    0,
    Math.sin(angle) * radius,
  );
}

function applySatelliteTransform(data) {
  if (!data.orbit.pivot) return;
  data.orbit.pivot.position.set(0, 0, 0);
  data.orbit.pivot.rotation.y = data.orbit.angle;
}

export function createPlanet(name, scene) {
  const data = planetsData[name];
  if (!data.mesh) return;

  const segments = data.mesh.size > 1 ? 64 : 32;
  const geometry = new THREE.SphereGeometry(data.mesh.size, segments, segments);
  const planetMesh = new THREE.Mesh(geometry, createBodyMaterial(data));

  const orbitPivot = new THREE.Object3D();
  scene.add(orbitPivot);

  const spinPivot = new THREE.Object3D();
  orbitPivot.add(spinPivot);

  if (data.mesh.tiltDeg != null) {
    applyAxialTilt(spinPivot, data.mesh.tiltDeg, data.mesh.tiltLonDeg ?? 0);
  }

  spinPivot.add(planetMesh);

  if (data.mesh.rings) {
    const rings = createPlanetRings(data.mesh.size, data.mesh.rings);
    planetMesh.add(rings);
  }

  if (data.mesh.clouds) {
    const cloudTex = getCachedTexture(data.mesh.clouds);
    const cloudGeo = new THREE.SphereGeometry(
      data.mesh.size + 0.05,
      segments,
      segments,
    );
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      alphaMap: cloudTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.9,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    spinPivot.add(cloudMesh);
    data.mesh.cloudBody = cloudMesh;
  }

  if (!data.mesh.isSun) {
    data.orbit.line = createOrbitRing(data.orbit.radius, 0x87cefa, 0.5);
    scene.add(data.orbit.line);
  }

  data.mesh.body = planetMesh;
  data.orbit.pivot = orbitPivot;
  setOrbitAngle(data, data.orbit.angle);

  if (data.satellites) {
    for (const satelliteName in data.satellites) {
      const satellite = data.satellites[satelliteName];
      const satSegments = satellite.mesh.size > 1 ? 64 : 32;
      const geo = new THREE.SphereGeometry(
        satellite.mesh.size,
        satSegments,
        satSegments,
      );

      const tex = satellite.mesh.texture
        ? getCachedTexture(satellite.mesh.texture)
        : null;
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        color: satellite.mesh.fallbackColor ?? 0x888888,
      });
      const satelliteMesh = new THREE.Mesh(geo, mat);

      const satPivot = new THREE.Object3D();
      spinPivot.add(satPivot);

      satellite.orbit.line = createOrbitRing(
        satellite.orbit.radius,
        0x336688,
        0.45,
      );
      spinPivot.add(satellite.orbit.line);

      satelliteMesh.position.set(satellite.orbit.radius, 0, 0);
      satPivot.add(satelliteMesh);

      satellite.mesh.body = satelliteMesh;
      satellite.orbit.pivot = satPivot;
      setOrbitAngle(satellite, satellite.orbit.angle);
    }
  }
}

export function setOrbitAngle(data, angleRadians) {
  data.orbit.angle = angleRadians;
  if (data.orbit.heliocentric) {
    applyHeliocentricTransform(data);
  } else {
    applySatelliteTransform(data);
  }
}

export function updatePlanet(data, dt) {
  data.orbit.angle += data.orbit.speed * dt;
  if (data.orbit.heliocentric) {
    applyHeliocentricTransform(data);
  }
  data.mesh.body.rotation.y += data.mesh.rotationSpeed * dt;

  if (data.mesh.cloudBody) {
    data.mesh.cloudBody.rotation.y += data.mesh.rotationSpeed * 1.15 * dt;
  }

  if (data.satellites) {
    for (const key in data.satellites) {
      const sat = data.satellites[key];
      sat.orbit.angle += sat.orbit.speed * dt;
      applySatelliteTransform(sat);
      sat.mesh.body.rotation.y += sat.mesh.rotationSpeed * dt;
    }
  }
}
