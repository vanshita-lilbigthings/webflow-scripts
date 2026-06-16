Webflow.push(function () {
  document.querySelectorAll('[data-counter]').forEach(function (el) {
    const target = parseInt(el.getAttribute('data-counter'), 10);
    const duration = parseInt(
      el.getAttribute('data-counter-duration') || '2000',
      10
    );
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(progress * target);
      if (progress < 1) requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(step);
        observer.disconnect();
      }
    });

    observer.observe(el);
  });
});
