const canvas = document.getElementById("particleCanvas");
const context = canvas.getContext("2d");
const timeMain = document.getElementById("timeMain");
const meridiem = document.getElementById("meridiem");
const hourLabel = document.getElementById("hourLabel");
const weekday = document.getElementById("weekday");
const secondNumber = document.getElementById("secondNumber");

const state = {
  particles: [],
  lastTime: 0,
  width: 0,
  height: 0,
};

const weekdays = [
  "\u661f\u671f\u65e5",
  "\u661f\u671f\u4e00",
  "\u661f\u671f\u4e8c",
  "\u661f\u671f\u4e09",
  "\u661f\u671f\u56db",
  "\u661f\u671f\u4e94",
  "\u661f\u671f\u516d",
];

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const isAfternoon = hours >= 12;
  const displayHour = hours % 12 || 12;

  timeMain.textContent = `${pad(displayHour)}:${pad(minutes)}`;
  meridiem.textContent = isAfternoon ? "\u4e0b" : "\u4e0a";
  hourLabel.textContent = "\u5348";
  weekday.textContent = weekdays[now.getDay()];
  secondNumber.textContent = pad(seconds);
}

function scheduleClockTick() {
  updateClock();
  const delay = 1000 - new Date().getMilliseconds();
  window.setTimeout(scheduleClockTick, delay);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createParticle(width, height, nearTitle = false) {
  const titleBandTop = height * 0.72;
  const titleBandBottom = height * 0.94;
  return {
    x: nearTitle ? randomBetween(width * 0.3, width * 0.7) : randomBetween(0, width),
    y: nearTitle ? randomBetween(titleBandTop, titleBandBottom) : randomBetween(0, height),
    r: nearTitle ? randomBetween(1.0, 2.5) : randomBetween(0.45, 1.4),
    vx: randomBetween(-0.03, 0.03),
    vy: randomBetween(-0.09, -0.02),
    alpha: nearTitle ? randomBetween(0.12, 0.32) : randomBetween(0.04, 0.14),
    twinkle: randomBetween(0.6, 1.8),
    phase: randomBetween(0, Math.PI * 2),
    hue: nearTitle ? randomBetween(186, 194) : randomBetween(188, 198),
  };
}

function resize() {
  const ratio = window.devicePixelRatio || 1;
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  canvas.width = Math.floor(state.width * ratio);
  canvas.height = Math.floor(state.height * ratio);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const total = Math.max(70, Math.floor((state.width * state.height) / 36000));
  state.particles = [];
  for (let i = 0; i < total; i += 1) {
    state.particles.push(createParticle(state.width, state.height, i < total * 0.45));
  }
}

function renderParticle(particle, time) {
  const flicker = 0.7 + Math.sin(time * 0.001 * particle.twinkle + particle.phase) * 0.3;
  const alpha = particle.alpha * flicker;
  const gradient = context.createRadialGradient(
    particle.x,
    particle.y,
    0,
    particle.x,
    particle.y,
    particle.r * 4
  );

  gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 86%, ${alpha})`);
  gradient.addColorStop(0.35, `hsla(${particle.hue}, 100%, 68%, ${alpha * 0.65})`);
  gradient.addColorStop(1, `hsla(${particle.hue}, 100%, 60%, 0)`);

  context.fillStyle = gradient;
  context.beginPath();
  context.arc(particle.x, particle.y, particle.r * 4, 0, Math.PI * 2);
  context.fill();
}

function updateParticle(particle, delta) {
  particle.x += particle.vx * delta;
  particle.y += particle.vy * delta;
  particle.x += Math.sin(performance.now() * 0.001 + particle.phase) * 0.02;

  if (particle.y < -20) {
    particle.y = state.height + randomBetween(4, 28);
    particle.x = randomBetween(0, state.width);
  }
  if (particle.x < -20) {
    particle.x = state.width + 20;
  }
  if (particle.x > state.width + 20) {
    particle.x = -20;
  }
}

function frame(time) {
  const delta = Math.min(32, time - state.lastTime || 16);
  state.lastTime = time;

  context.clearRect(0, 0, state.width, state.height);
  for (const particle of state.particles) {
    updateParticle(particle, delta);
    renderParticle(particle, time);
  }

  requestAnimationFrame(frame);
}

window.addEventListener("resize", resize);
resize();
scheduleClockTick();
requestAnimationFrame(frame);
