// inject footer
function loadFooter(path) {
  fetch(path)
    .then(r => r.text())
    .then(html => {
      const mount = document.getElementById("footer");
      if (!mount) return;
      mount.innerHTML = html;

      // hide "site playlist" link on the site playlist page
      const isPlaylist = /\/site-playlist(?:\.html)?$/.test(location.pathname);
      if (isPlaylist) {
        const playlistLink = Array.from(
          document.querySelectorAll('.footer-right .footer-link')
        ).find(el => (el.textContent || '').trim().toLowerCase() === 'site playlist');
        if (playlistLink) playlistLink.style.display = 'none';
      }

      // === Theme toggle ===
      function applyTheme(theme) {
        if (theme === "dark") {
          document.documentElement.classList.add("dark-mode");
          localStorage.setItem("theme", "dark");
          const t = document.getElementById("theme-toggle");
          if (t) t.textContent = "light";
        } else {
          document.documentElement.classList.remove("dark-mode");
          localStorage.setItem("theme", "light");
          const t = document.getElementById("theme-toggle");
          if (t) t.textContent = "dark";
        }
      }
      applyTheme(localStorage.getItem("theme") || "light");

      const themeToggle = document.getElementById("theme-toggle");
      if (themeToggle) {
        themeToggle.addEventListener("click", () => {
          const next = document.documentElement.classList.contains("dark-mode") ? "light" : "dark";
          applyTheme(next);
          setTimeout(adjustFooterMode, 0); // re-evaluate after layout settles
        });
      }

      // === Footer mode: fixed for short pages, static for long pages ===
      function adjustFooterMode() {
        const footer = document.querySelector(".site-footer");
        if (!footer) return;

        const pageHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;

        if (pageHeight > viewportHeight) {
          // long page → footer at bottom of document flow
          footer.classList.remove("fixed");
          footer.classList.add("static");
        } else {
          // short page → footer fixed to the screen bottom
          footer.classList.remove("static");
          footer.classList.add("fixed");
        }
      }

      // === Email dropdown ===
      const emailToggle   = document.getElementById("email-toggle");
      const emailDropdown = document.getElementById("email-dropdown");
      const copyBtn       = document.getElementById("copy-btn");
      const emailAddr     = document.getElementById("email-address");

      if (emailToggle && emailDropdown) {
        emailToggle.addEventListener("click", () => {
          emailDropdown.classList.toggle("show");
          // dropdown might change page height → re-evaluate
          setTimeout(adjustFooterMode, 320);
        });
      }

      if (copyBtn && emailAddr) {
        copyBtn.addEventListener("click", () => {
          navigator.clipboard.writeText(emailAddr.textContent).then(() => {
            const oldText = copyBtn.textContent;
            copyBtn.textContent = "copied!";
            setTimeout(() => (copyBtn.textContent = oldText), 1500);
          });
        });
      }

      // === Phone dropdown ===
      const phoneToggle   = document.getElementById("phone-toggle");
      const phoneDropdown = document.getElementById("phone-dropdown");
      const phoneCopyBtn  = document.getElementById("phone-copy-btn");
      const phoneNumber   = document.getElementById("phone-number");

      if (phoneToggle && phoneDropdown) {
        phoneToggle.addEventListener("click", () => {
          phoneDropdown.classList.toggle("show");
          setTimeout(adjustFooterMode, 320);
        });
      }

      if (phoneCopyBtn && phoneNumber) {
        phoneCopyBtn.addEventListener("click", () => {
          navigator.clipboard.writeText(phoneNumber.textContent).then(() => {
            const oldText = phoneCopyBtn.textContent;
            phoneCopyBtn.textContent = "copied!";
            setTimeout(() => (phoneCopyBtn.textContent = oldText), 1500);
          });
        });
      }

      // run once on load + on resize
      adjustFooterMode();
      window.addEventListener("resize", adjustFooterMode);
    });
}
