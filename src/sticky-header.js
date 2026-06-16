Webflow.push(function () {
  const header = document.querySelector('[data-sticky-header]');
  if (!header) return;

  const sentinel = document.createElement('div');
  document.body.prepend(sentinel);

  new IntersectionObserver(function (entries) {
    header.classList.toggle('sticky-header--stuck', !entries[0].isIntersecting);
  }).observe(sentinel);
});
