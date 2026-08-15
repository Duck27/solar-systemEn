import { formatForHorizons } from "../time/simulationTime.js";
import { planetsData } from "../planetsData.js";
import { setOrbitAngle } from "../world/planets.js";

const HORIZONS_IDS = {
  mercury: "199",
  venus: "299",
  earth: "399",
  mars: "499",
  jupiter: "599",
  saturn: "699",
  uranus: "799",
  neptune: "899",
  moon: "301",
};

const PLANET_KEYS = [
  "mercury", "venus", "earth", "mars",
  "jupiter", "saturn", "uranus", "neptune",
];

const J2000_LONGITUDE = {
  mercury: 252.25,
  venus: 181.98,
  earth: 100.46,
  mars: 355.43,
  jupiter: 34.35,
  saturn: 50.08,
  uranus: 314.05,
  neptune: 304.35,
  moon: 218.32,
};

const DAILY_MOTION = {
  mercury: 4.0923,
  venus: 1.6021,
  earth: 0.9856,
  mars: 0.5240,
  jupiter: 0.0831,
  saturn: 0.0335,
  uranus: 0.0117,
  neptune: 0.0060,
  moon: 13.1764,
};

const J2000_EPOCH = Date.UTC(2000, 0, 1, 12, 0, 0);

const NASA_API = import.meta.env.DEV
  ? "/api/nasa/horizons.api"
  : "https://ssd.jpl.nasa.gov/api/horizons.api";

function parseVectors(resultText) {
  const soe = resultText.indexOf("$$SOE");
  const eoe = resultText.indexOf("$$EOE");
  if (soe === -1 || eoe === -1) return null;

  const block = resultText.slice(soe, eoe);
  const xMatch = block.match(/X\s*=\s*([-\d.E+]+)/);
  const yMatch = block.match(/Y\s*=\s*([-\d.E+]+)/);
  if (!xMatch || !yMatch) return null;

  const x = parseFloat(xMatch[1]);
  const y = parseFloat(yMatch[1]);
  return Math.atan2(y, x);
}

async function fetchHeliocentricLongitude(bodyId, date) {
  const time = encodeURIComponent(formatForHorizons(date));
  const start = time;
  const stop = encodeURIComponent(
    formatForHorizons(new Date(date.getTime() + 60_000))
  );

  const url =
    `${NASA_API}?format=json` +
    `&COMMAND='${bodyId}'` +
    `&EPHEM_TYPE=VECTORS` +
    `&CENTER='@sun'` +
    `&REF_PLANE='ECLIPTIC'` +
    `&START_TIME=${start}` +
    `&STOP_TIME=${stop}` +
    `&STEP_SIZE='1%20m'` +
    `&VEC_TABLE='2'`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`NASA API HTTP ${res.status}`);

  const data = await res.json();
  if (data.error) throw new Error(data.error);

  const angle = parseVectors(data.result);
  if (angle == null) throw new Error("Failed to parse NASA Horizons response");
  return angle;
}

async function fetchGeocentricLongitude(bodyId, centerId, date) {
  const time = encodeURIComponent(formatForHorizons(date));
  const stop = encodeURIComponent(
    formatForHorizons(new Date(date.getTime() + 60_000))
  );

  const url =
    `${NASA_API}?format=json` +
    `&COMMAND='${bodyId}'` +
    `&EPHEM_TYPE=VECTORS` +
    `&CENTER='${centerId}'` +
    `&REF_PLANE='ECLIPTIC'` +
    `&START_TIME=${time}` +
    `&STOP_TIME=${stop}` +
    `&STEP_SIZE='1%20m'` +
    `&VEC_TABLE='2'`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`NASA API HTTP ${res.status}`);

  const data = await res.json();
  if (data.error) throw new Error(data.error);

  const angle = parseVectors(data.result);
  if (angle == null) throw new Error("Failed to parse NASA Horizons response");
  return angle;
}

export function fallbackLongitude(key, date) {
  const days = (date.getTime() - J2000_EPOCH) / 86_400_000;
  const deg = J2000_LONGITUDE[key] + DAILY_MOTION[key] * days;
  return ((deg % 360) + 360) % 360 * (Math.PI / 180);
}

export async function fetchPlanetPositions(date) {
  const positions = {};
  let usedFallback = false;

  const tasks = PLANET_KEYS.map(async (key) => {
    try {
      positions[key] = await fetchHeliocentricLongitude(HORIZONS_IDS[key], date);
    } catch {
      positions[key] = fallbackLongitude(key, date);
      usedFallback = true;
    }
  });

  await Promise.all(tasks);

  try {
    positions.moon = await fetchGeocentricLongitude(
      HORIZONS_IDS.moon,
      HORIZONS_IDS.earth,
      date
    );
  } catch {
    positions.moon = fallbackLongitude("moon", date);
    usedFallback = true;
  }

  return { positions, usedFallback };
}

export function applyFallbackPositions(date) {
  const positions = {};
  for (const key of PLANET_KEYS) {
    positions[key] = fallbackLongitude(key, date);
  }
  positions.moon = fallbackLongitude("moon", date);
  applyPositionsToPlanets(positions);
}

export function applyPositionsToPlanets(positions) {
  for (const key of PLANET_KEYS) {
    if (positions[key] != null && planetsData[key]) {
      setOrbitAngle(planetsData[key], positions[key]);
    }
  }

  const earth = planetsData.earth;
  if (positions.moon != null && earth?.satellites?.moon) {
    setOrbitAngle(earth.satellites.moon, positions.moon);
  }
}
