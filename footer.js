function loadFooter(path) {
  fetch(path)
    .then(r => r.text())
    .then(html => {
      const mount = document.getElementById("footer");
      mount.innerHTML = html;
      const isPlaylist = /\/site-playlist(?:\.html)?$/.test(location.pathname);
      if (isPlaylist) {
        const playlistLink = Array.from(
          document.querySelectorAll('.footer-right .footer-link')
        ).find(el => (el.textContent || '').trim().toLowerCase() === 'site playlist');
        if (playlistLink) playlistLink.style.display = 'none';
      }
      function applyTheme(theme) {
        if (theme === "dark") {
          document.documentElement.classList.add("dark-mode");
          localStorage.setItem("theme", "dark");
          document.getElementById("theme-toggle").textContent = "light";
        } else {
          document.documentElement.classList.remove("dark-mode");
          localStorage.setItem("theme", "light");
          document.getElementById("theme-toggle").textContent = "dark";
        }
      }
      applyTheme(localStorage.getItem("theme") || "light");

      document.getElementById("theme-toggle").addEventListener("click", () => {
        const next = document.documentElement.classList.contains("dark-mode") ? "light" : "dark";
        applyTheme(next);
      });
      const emailToggle = document.getElementById("email-toggle");
      const emailDropdown = document.getElementById("email-dropdown");
      const copyBtn = document.getElementById("copy-btn");
      const emailAddr = document.getElementById("email-address");
      emailToggle.addEventListener("click", () => {
        emailDropdown.classList.toggle("show");
      });
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(emailAddr.textContent).then(() => {
          const oldText = copyBtn.textContent;
          copyBtn.textContent = "copied!";
          setTimeout(() => (copyBtn.textContent = oldText), 1500);
        });
      });
      const phoneToggle = document.getElementById("phone-toggle");
      const phoneDropdown = document.getElementById("phone-dropdown");
      const phoneCopyBtn = document.getElementById("phone-copy-btn");
      const phoneNumber = document.getElementById("phone-number");
      phoneToggle.addEventListener("click", () => {
        phoneDropdown.classList.toggle("show");
      });
      phoneCopyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(phoneNumber.textContent).then(() => {
          const oldText = phoneCopyBtn.textContent;
          phoneCopyBtn.textContent = "copied!";
          setTimeout(() => (phoneCopyBtn.textContent = oldText), 1500);
        });
      });
    });
}