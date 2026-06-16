(function () {
  Webflow.push(function () {
    let e = document.querySelector(`[data-sticky-header]`);
    if (!e) return;
    let t = document.createElement(`div`);
    (document.body.prepend(t),
      new IntersectionObserver(function (t) {
        e.classList.toggle(`sticky-header--stuck`, !t[0].isIntersecting);
      }).observe(t));
  });
})();
