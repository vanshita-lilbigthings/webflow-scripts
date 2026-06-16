(function () {
  Webflow.push(function () {
    let e = document.querySelector(`.modal`),
      t = document.querySelector(`.modal-overlay`);
    if (!e || !t) return;
    function n() {
      (e.classList.add(`modal--open`),
        t.classList.add(`modal-overlay--visible`),
        (document.body.style.overflow = `hidden`));
    }
    function r() {
      (e.classList.remove(`modal--open`),
        t.classList.remove(`modal-overlay--visible`),
        (document.body.style.overflow = ``));
    }
    (document.querySelectorAll(`[data-modal-open]`).forEach(function (e) {
      e.addEventListener(`click`, n);
    }),
      document.querySelectorAll(`[data-modal-close]`).forEach(function (e) {
        e.addEventListener(`click`, r);
      }),
      t.addEventListener(`click`, r),
      document.addEventListener(`keydown`, function (e) {
        e.key === `Escape` && r();
      }));
  });
})();
