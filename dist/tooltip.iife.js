(function () {
  Webflow.push(function () {
    document.querySelectorAll(`[data-tooltip]`).forEach(function (e) {
      let t = document.createElement(`span`);
      ((t.className = `tooltip__bubble`),
        (t.textContent = e.getAttribute(`data-tooltip`)),
        e.classList.add(`tooltip`),
        e.appendChild(t),
        e.addEventListener(`mouseenter`, function () {
          t.classList.add(`tooltip__bubble--visible`);
        }),
        e.addEventListener(`mouseleave`, function () {
          t.classList.remove(`tooltip__bubble--visible`);
        }));
    });
  });
})();
