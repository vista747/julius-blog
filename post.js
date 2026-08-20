const audio = document.getElementById("music");

if (audio) {
  audio.volume = 0.8;

  audio.play().catch(() => {
    document.body.addEventListener("click", () => audio.play(), { once: true });
  });

  const muteToggle = document.getElementById("mute-toggle");
  if (muteToggle) {
    muteToggle.addEventListener("click", () => {
      audio.muted = !audio.muted;
      muteToggle.textContent = audio.muted ? "unmute" : "mute";
    });
  }
}
