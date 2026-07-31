import * as THREE from "three";

const BELT_COUNT = 3000;
const INNER_RADIUS = 34; // чуть дальше Марса (r=30)
const OUTER_RADIUS = 43; // чуть ближе Юпитера (r=48)
const HEIGHT_SPREAD = 2.0; // разброс по Y, небольшой наклон пояса

export function initAsteroidBelt(scene) {
  // IcosahedronGeometry detail=0 → 20 граней, похоже на неровный камень
  const geometry = new THREE.IcosahedronGeometry(0.12, 0);
  const material = new THREE.MeshStandardMaterial({
    color: 0x7a7060,
    roughness: 0.95,
    metalness: 0.05,
  });

  const belt = new THREE.InstancedMesh(geometry, material, BELT_COUNT);
  belt.instanceMatrix.setUsage(THREE.StaticDrawUsage); // матрицы не изменятся

  const dummy = new THREE.Object3D();

  for (let i = 0; i < BELT_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    // Неравномерное распределение: немного гуще к центру пояса
    const t = Math.pow(Math.random(), 0.7);
    const radius = INNER_RADIUS + t * (OUTER_RADIUS - INNER_RADIUS);
    const y = (Math.random() - 0.5) * HEIGHT_SPREAD;

    dummy.position.set(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius
    );

    // Каждый астероид имеет уникальный хаотичный поворот
    dummy.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );

    // Случайный масштаб: большинство мелкие, единицы крупнее
    const scale = 0.3 + Math.pow(Math.random(), 3) * 2.5;
    dummy.scale.setScalar(scale);

    dummy.updateMatrix();
    belt.setMatrixAt(i, dummy.matrix);
  }

  belt.instanceMatrix.needsUpdate = true;
  scene.add(belt);

  return belt;
}
