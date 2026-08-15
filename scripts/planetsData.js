const TWO_PI = 2 * Math.PI;
const SECONDS_PER_DAY = 86400;
const SECONDS_PER_YEAR = 365.25 * SECONDS_PER_DAY;

export const EARTH_ORBIT_SPEED = TWO_PI / SECONDS_PER_YEAR;

const EARTH_ROTATION_SPEED = TWO_PI / (0.997 * SECONDS_PER_DAY);

const orbitSpeed = (periodYears) => TWO_PI / (periodYears * SECONDS_PER_YEAR);
const rotationSpeed = (periodDays) => TWO_PI / (periodDays * SECONDS_PER_DAY);

const tex = (file) => `${import.meta.env.BASE_URL}${file}`;

export { orbitSpeed, rotationSpeed };

export const planetsData = {
  sun: {
    orbit: { speed: 0, angle: 0, radius: 0, line: null, heliocentric: true },
    mesh: {
      size: 5,
      rotationSpeed: rotationSpeed(25.05),
      texture: tex("img/sun.jpg"),
      fallbackColor: 0xffcc44,
      isSun: true,
    },
  },
  mercury: {
    orbit: {
      speed: orbitSpeed(0.240846),
      angle: 0,
      radius: 10,
      line: null,
      heliocentric: true,
    },
    mesh: {
      size: 1,
      rotationSpeed: rotationSpeed(58.646),
      texture: tex("img/mercury.jpg"),
      fallbackColor: 0x8c8c8c,
      tiltDeg: 0.03,
      tiltLonDeg: 48,
    },
  },
  venus: {
    orbit: {
      speed: orbitSpeed(0.615198),
      angle: 0,
      radius: 14,
      line: null,
      heliocentric: true,
    },
    mesh: {
      size: 2,
      rotationSpeed: -rotationSpeed(243.025),
      texture: tex("img/venus.jpg"),
      fallbackColor: 0xc4a035,
      tiltDeg: 177.4,
      tiltLonDeg: 90,
    },
  },
  earth: {
    orbit: {
      speed: EARTH_ORBIT_SPEED,
      angle: 0,
      radius: 22,
      line: null,
      heliocentric: true,
    },
    mesh: {
      size: 2,
      rotationSpeed: rotationSpeed(0.997),
      texture: tex("img/earth.jpg"),
      fallbackColor: 0x2a6a9a,
      tiltDeg: 23.44,
      tiltLonDeg: 0,
      clouds: tex("img/2k_earth_clouds.jpg"),
    },
    satellites: {
      moon: {
        infoId: "moon",
        orbit: {
          speed: orbitSpeed(27.322 / 365.25),
          angle: 0,
          radius: 4,
          line: null,
        },
        mesh: {
          size: 0.5,
          rotationSpeed: rotationSpeed(27.322),
          tidallyLocked: true,
          texture: tex("img/moon.jpg"),
          fallbackColor: 0xaaaaaa,
          tiltDeg: 6.68,
          tiltLonDeg: 0,
        },
      },
    },
  },
  mars: {
    orbit: {
      speed: orbitSpeed(1.880816),
      angle: 0,
      radius: 30,
      line: null,
      heliocentric: true,
    },
    mesh: {
      size: 1.3,
      rotationSpeed: rotationSpeed(1.026),
      texture: tex("img/mars.jpg"),
      fallbackColor: 0xb55239,
      tiltDeg: 25.19,
      tiltLonDeg: 35,
    },
  },
  jupiter: {
    orbit: {
      speed: orbitSpeed(11.862),
      angle: 0,
      radius: 48,
      line: null,
      heliocentric: true,
    },
    mesh: {
      size: 4.5,
      rotationSpeed: rotationSpeed(0.414),
      texture: tex("img/jupiter.jpg"),
      fallbackColor: 0xc4956a,
      tiltDeg: 3.13,
      tiltLonDeg: 120,
    },
  },
  saturn: {
    orbit: {
      speed: orbitSpeed(29.457),
      angle: 0,
      radius: 66,
      line: null,
      heliocentric: true,
    },
    mesh: {
      size: 3.8,
      rotationSpeed: rotationSpeed(0.444),
      texture: tex("img/saturn.jpg"),
      fallbackColor: 0xd4c4a0,
      tiltDeg: 26.73,
      tiltLonDeg: 200,
      rings: { innerScale: 1.35, outerScale: 2.45 },
    },
  },
  uranus: {
    orbit: {
      speed: orbitSpeed(84.011),
      angle: 0,
      radius: 84,
      line: null,
      heliocentric: true,
    },
    mesh: {
      size: 2.8,
      rotationSpeed: -rotationSpeed(0.718),
      texture: tex("img/uranus.jpg"),
      fallbackColor: 0x7ec8d8,
      tiltDeg: 97.77,
      tiltLonDeg: 250,
    },
  },
  neptune: {
    orbit: {
      speed: orbitSpeed(164.791),
      angle: 0,
      radius: 100,
      line: null,
      heliocentric: true,
    },
    mesh: {
      size: 2.6,
      rotationSpeed: rotationSpeed(0.671),
      texture: tex("img/neptune.jpg"),
      fallbackColor: 0x3a5cad,
      tiltDeg: 28.32,
      tiltLonDeg: 290,
    },
  },
};
