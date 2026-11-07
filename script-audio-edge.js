const timeMain = document.getElementById("timeMain");
const meridiem = document.getElementById("meridiem");
const hourLabel = document.getElementById("hourLabel");
const weekday = document.getElementById("weekday");
const secondNumber = document.getElementById("secondNumber");
const audioLeft = document.getElementById("audioLeft");
const audioRight = document.getElementById("audioRight");

const state = {
  bars: [],
  audio: {
    lastUpdate: 0,
    spectrum: [],
  },
  settings: {
    sensitivity: 1,
  },
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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

function getAudioSample(audioArray, side, normalized) {
  const length = audioArray.length;
  if (!length) {
    return 0;
  }

  if (length >= 128) {
    const half = Math.floor(length / 2);
    const base = side === "right" ? half : 0;
    const index = base + Math.floor(normalized * Math.max(0, half - 1));
    return clamp(audioArray[index] || 0, 0, 1);
  }

  const index = Math.floor(normalized * Math.max(0, length - 1));
  return clamp(audioArray[index] || 0, 0, 1);
}

function createBarElement(side) {
  const wrapper = document.createElement("div");
  wrapper.className = `audio-row audio-row-${side}`;

  const fill = document.createElement("div");
  fill.className = "audio-fill";

  const accent = document.createElement("div");
  accent.className = "audio-accent";

  fill.appendChild(accent);
  wrapper.appendChild(fill);

  return { wrapper, fill };
}

function rebuildBars() {
  if (!audioLeft || !audioRight) {
    return;
  }

  audioLeft.textContent = "";
  audioRight.textContent = "";
  state.bars = [];

  const countPerSide = window.innerWidth < 900 ? 28 : 38;
  for (let i = 0; i < countPerSide; i += 1) {
    const leftBar = createBarElement("left");
    audioLeft.appendChild(leftBar.wrapper);
    state.bars.push({
      side: "left",
      fill: leftBar.fill,
      display: 0,
      glow: 0,
    });
  }

  for (let i = 0; i < countPerSide; i += 1) {
    const rightBar = createBarElement("right");
    audioRight.appendChild(rightBar.wrapper);
    state.bars.push({
      side: "right",
      fill: rightBar.fill,
      display: 0,
      glow: 0,
    });
  }

  state.audio.spectrum = new Array(state.bars.length).fill(0);
}

function wallpaperAudioListener(audioArray) {
  if (!audioArray || typeof audioArray.length !== "number" || audioArray.length === 0) {
    return;
  }

  state.audio.lastUpdate = performance.now();
  if (!state.bars.length) {
    return;
  }

  const halfCount = Math.max(1, Math.floor(state.bars.length / 2));
  const nextSpectrum = new Array(state.bars.length).fill(0);

  for (let i = 0; i < state.bars.length; i += 1) {
    const localIndex = i % halfCount;
    const normalized = halfCount <= 1 ? 0 : localIndex / (halfCount - 1);
    const side = i < halfCount ? "left" : "right";
    const sample = getAudioSample(audioArray, side, normalized);
    nextSpectrum[i] = clamp(Math.pow(sample, 0.82) * 1.05 * state.settings.sensitivity, 0, 1);
  }

  state.audio.spectrum = nextSpectrum;
}

function renderBars() {
  const active = performance.now() - state.audio.lastUpdate < 220;

  for (let i = 0; i < state.bars.length; i += 1) {
    const target = active ? state.audio.spectrum[i] || 0 : 0;
    const bar = state.bars[i];
    bar.display = bar.display * 0.8 + target * 0.2;
    bar.glow = Math.max(bar.glow * 0.88, bar.display);

    const width = bar.display * 100;
    bar.fill.style.width = `${width}%`;
    bar.fill.style.opacity = width > 0.4 ? `${0.12 + bar.display * 0.88}` : "0";
  }

  requestAnimationFrame(renderBars);
}

window.addEventListener("resize", rebuildBars);
rebuildBars();
scheduleClockTick();

if (typeof window.wallpaperRegisterAudioListener === "function") {
  window.wallpaperRegisterAudioListener(wallpaperAudioListener);
}

requestAnimationFrame(renderBars);

window.wallpaperPropertyListener = {
  applyUserProperties(properties) {
    if (properties && properties.sensitivity) {
      const raw = properties.sensitivity.value;
      const value = typeof raw === "number" ? raw : Number(raw);
      if (!Number.isNaN(value)) {
        state.settings.sensitivity = clamp(value / 100, 0.2, 2.2);
      }
    }
  },
};
