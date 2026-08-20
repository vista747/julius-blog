// homepage background loop with fade-in
const bgAudio = document.getElementById("bgLoop");
const TARGET_VOL = 0.8;
const FADE_MS = 1200;

function fadeIn(el, target = TARGET_VOL, durationMs = FADE_MS) {
  el.volume = 0;
  const steps = 30;
  const stepTime = durationMs / steps;
  let i = 0;
  const timer = setInterval(() => {
    i++;
    el.volume = Math.min(target, (target * i) / steps);
    if (i >= steps) clearInterval(timer);
  }, stepTime);
}

async function startAudio() {
  try {
    await bgAudio.play();
    fadeIn(bgAudio);
  } catch (e) {}
}

function addStartListeners() {
  window.addEventListener("pointerdown", startAudio, { once: true });
  window.addEventListener("keydown", startAudio, { once: true });
  window.addEventListener("touchstart", startAudio, { once: true });
}

window.addEventListener("load", () => {
  addStartListeners();
  startAudio();
});
