function updateClock() {
  const now = new Date();
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const month   = now.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
  const day     = now.getDate();
  const year    = now.getFullYear();
  const hours   = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const formatted =
    `${weekday}, ${month} ${day}, ${year} — ${hours}:${minutes}:${seconds}`;
  document.getElementById("live-clock").textContent = formatted;
}

if (document.getElementById("live-clock")) {
  updateClock();
  setInterval(updateClock, 1000);
}
