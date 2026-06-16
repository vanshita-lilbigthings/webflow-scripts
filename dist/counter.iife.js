(function () {
  Webflow.push(function () {
    document.querySelectorAll(`[data-counter]`).forEach(function (e) {
      let t = parseInt(e.getAttribute(`data-counter`), 10),
        n = parseInt(e.getAttribute(`data-counter-duration`) || `2000`, 10),
        r = performance.now();
      function i(a) {
        let o = Math.min((a - r) / n, 1);
        ((e.textContent = Math.floor(o * t)),
          o < 1 && requestAnimationFrame(i));
      }
      let a = new IntersectionObserver(function (e) {
        e[0].isIntersecting && (requestAnimationFrame(i), a.disconnect());
      });
      a.observe(e);
    });
  });
})();
