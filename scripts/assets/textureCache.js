import * as THREE from "three";

const cache = new Map();
const loader = new THREE.TextureLoader();

const MAX_TEXTURE_SIZE = 1024;

function downscaleTexture(texture) {
  const img = texture.image;
  if (!img?.width || !img?.height) return texture;

  const maxDim = Math.max(img.width, img.height);
  if (maxDim <= MAX_TEXTURE_SIZE) return texture;

  const scale = MAX_TEXTURE_SIZE / maxDim;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);

  texture.image = canvas;
  texture.needsUpdate = true;
  return texture;
}

function prepareTexture(texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return downscaleTexture(texture);
}

export function collectTextureUrls(planetsData) {
  const urls = new Set();

  for (const name in planetsData) {
    const data = planetsData[name];
    if (data.mesh?.texture) urls.add(data.mesh.texture);
    if (data.mesh?.clouds) urls.add(data.mesh.clouds);

    if (data.satellites) {
      for (const key in data.satellites) {
        const sat = data.satellites[key];
        if (sat.mesh?.texture) urls.add(sat.mesh.texture);
      }
    }
  }

  return [...urls];
}

async function loadOne(url) {
  if (cache.has(url)) return cache.get(url);
  const texture = prepareTexture(await loader.loadAsync(url));
  cache.set(url, texture);
  return texture;
}

/** Параллельная предзагрузка; Солнце — первым */
export async function preloadPlanetTextures(planetsData, onProgress) {
  const urls = collectTextureUrls(planetsData);
  const sunUrl = planetsData.sun?.mesh?.texture;
  let loaded = 0;

  const report = () => onProgress?.(++loaded, urls.length);

  if (sunUrl) {
    await loadOne(sunUrl);
    report();
  }

  const rest = urls.filter((url) => url !== sunUrl);
  await Promise.all(rest.map((url) => loadOne(url).then(report)));
}

export function getCachedTexture(url) {
  return cache.get(url) ?? null;
}

export function applyAnisotropy(renderer) {
  const max = renderer.capabilities.getMaxAnisotropy();
  for (const texture of cache.values()) {
    texture.anisotropy = max;
  }
}
