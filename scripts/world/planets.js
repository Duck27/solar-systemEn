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

export function createPlanet(name, scene) {
  const data = planetsData[name];
  if (!data.mesh) return;

  const segments = data.mesh.size > 1 ? 64 : 32;
  const geometry = new THREE.SphereGeometry(data.mesh.size, segments, segments);
  const planetMesh = new THREE.Mesh(geometry, createBodyMaterial(data));

  const orbitPivot = new THREE.Object3D();
  scene.add(orbitPivot);

  const tiltPivot = new THREE.Object3D();
  tiltPivot.position.set(data.orbit.radius, 0, 0);
  orbitPivot.add(tiltPivot);

  if (data.mesh.tiltDeg != null) {
    tiltPivot.rotation.z = -THREE.MathUtils.degToRad(data.mesh.tiltDeg);
  }

  tiltPivot.add(planetMesh);

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
      tiltPivot.add(satPivot);

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

  if (data.mesh.cloudBody) {
    data.mesh.cloudBody.rotation.y += data.mesh.rotationSpeed * 1.15 * dt;
  }

  if (data.satellites) {
    for (const key in data.satellites) {
      const sat = data.satellites[key];
      sat.orbit.angle += sat.orbit.speed * dt;
      sat.orbit.pivot.rotation.y = sat.orbit.angle;
      sat.mesh.body.rotation.y += sat.mesh.rotationSpeed * dt;
    }
  }
}
