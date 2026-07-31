const TWO_PI = 2 * Math.PI;
const SECONDS_PER_DAY = 86400;
const SECONDS_PER_YEAR = 365.25 * SECONDS_PER_DAY;

/** Угловая скорость орбиты Земли, рад/с (реальное время) */
export const EARTH_ORBIT_SPEED = TWO_PI / SECONDS_PER_YEAR;

/** Угловая скорость вращения Земли, рад/с */
const EARTH_ROTATION_SPEED = TWO_PI / (0.997 * SECONDS_PER_DAY);

/** ω = 2π/T; period в земных годах или сутках */
const orbitSpeed = (periodYears) => TWO_PI / (periodYears * SECONDS_PER_YEAR);
const rotationSpeed = (periodDays) => TWO_PI / (periodDays * SECONDS_PER_DAY);

const tex = (file) => `${import.meta.env.BASE_URL}${file}`;

export { orbitSpeed, rotationSpeed };

export const planetsData = {
  sun: {
    label: "Солнце",
    orbit: { speed: 0, angle: 0, radius: 0, line: null },
    mesh: {
      size: 5,
      rotationSpeed: rotationSpeed(25.05),
      texture: tex("img/sun.jpg"),
      isSun: true,
    },
  },
  mercury: {
    label: "Меркурий",
    orbit: { speed: orbitSpeed(0.240846), angle: 0, radius: 10, line: null },
    mesh: {
      size: 1,
      rotationSpeed: rotationSpeed(58.646),
      texture: tex("img/mercury.jpg"),
      tiltDeg: 0.03,
    },
  },
  venus: {
    label: "Венера",
    orbit: { speed: orbitSpeed(0.615198), angle: 0, radius: 14, line: null },
    mesh: {
      size: 2,
      // Ретроградное вращение (~243 зем. суток)
      rotationSpeed: -rotationSpeed(243.025),
      texture: tex("img/venus.jpg"),
      tiltDeg: 177.4,
    },
  },
  earth: {
    label: "Земля",
    orbit: { speed: EARTH_ORBIT_SPEED, angle: 0, radius: 22, line: null },
    mesh: {
      size: 2,
      rotationSpeed: rotationSpeed(0.997),
      texture: tex("img/earth.jpg"),
      tiltDeg: 23.44,
      clouds: tex("img/2k_earth_clouds.jpg"),
    },
    satellites: {
      moon: {
        infoId: "moon",
        label: "Луна",
        // Орбита ~27.3 суток; приливный захват — вращение = орбите
        orbit: {
          speed: orbitSpeed(27.322 / 365.25),
          angle: 0,
          radius: 4,
          line: null,
        },
        mesh: {
          size: 0.5,
          rotationSpeed: rotationSpeed(27.322),
          texture: tex("img/moon.jpg"),
          tiltDeg: 0,
        },
      },
    },
  },
  mars: {
    label: "Марс",
    orbit: { speed: orbitSpeed(1.880816), angle: 0, radius: 30, line: null },
    mesh: {
      size: 1.3,
      rotationSpeed: rotationSpeed(1.026),
      texture: tex("img/mars.jpg"),
      tiltDeg: 25.19,
    },
  },
  jupiter: {
    label: "Юпiter",
    orbit: { speed: orbitSpeed(11.862), angle: 0, radius: 48, line: null },
    mesh: {
      size: 4.5,
      rotationSpeed: rotationSpeed(0.414),
      texture: tex("img/jupiter.jpg"),
      tiltDeg: 3.13,
    },
  },
  saturn: {
    label: "Сатурн",
    orbit: { speed: orbitSpeed(29.457), angle: 0, radius: 66, line: null },
    mesh: {
      size: 3.8,
      rotationSpeed: rotationSpeed(0.444),
      texture: tex("img/saturn.jpg"),
      tiltDeg: 26.73,
    },
  },
  uranus: {
    label: "Уран",
    orbit: { speed: orbitSpeed(84.011), angle: 0, radius: 84, line: null },
    mesh: {
      size: 2.8,
      // Ретроградное вращение (~0.72 суток)
      rotationSpeed: -rotationSpeed(0.718),
      texture: tex("img/uranus.jpg"),
      tiltDeg: 97.77,
    },
  },
  neptune: {
    label: "Нептун",
    orbit: { speed: orbitSpeed(164.791), angle: 0, radius: 100, line: null },
    mesh: {
      size: 2.6,
      rotationSpeed: rotationSpeed(0.671),
      texture: tex("img/neptune.jpg"),
      tiltDeg: 28.32,
    },
  },
};
