// inject footer
function loadFooter(path) {
  fetch(path)
    .then(r => r.text())
    .then(html => {
      const mount = document.getElementById("footer");
      mount.innerHTML = html;

      // === Theme toggle ===
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

      // === Email dropdown ===
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
    });
}
