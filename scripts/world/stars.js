import * as THREE from "three";
import { starVertexShader, starFragmentShader } from "../shaders.js";

export function createStarTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;

  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);

  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
  gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, 32, 32);

  return new THREE.CanvasTexture(canvas);
}

export function createStars(count, distance, size, texture) {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const phases = [];

  for (let i = 0; i < count; i++) {
    const theta = Math.acos(THREE.MathUtils.randFloatSpread(2));
    const phi = THREE.MathUtils.randFloatSpread(Math.PI * 2);

    vertices.push(
      distance * Math.sin(theta) * Math.cos(phi),
      distance * Math.sin(theta) * Math.sin(phi),
      distance * Math.cos(theta)
    );

    phases.push(Math.random() * Math.PI * 2);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setAttribute("phase", new THREE.Float32BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: size * window.devicePixelRatio },
      uTexture: { value: texture },
    },
    vertexShader: starVertexShader,
    fragmentShader: starFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });

  return new THREE.Points(geometry, material);
}

export function initStars(scene) {
  const starTexture = createStarTexture();

  const layer1 = createStars(4000, 600, 4, starTexture);
  const layer2 = createStars(1000, 500, 5, starTexture);

  scene.add(layer1, layer2);

  return [layer1, layer2];
}
