fetch("/rss-head.html")
  .then(res => res.text())
  .then(html => {
    const gtag = `<!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-51Z344C42L"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);} 
    gtag('js', new Date());

    gtag('config', 'G-51Z344C42L');
  </script>`;

    // insert gtag first, then rss head
    document.head.insertAdjacentHTML("beforeend", gtag + html);
  });
