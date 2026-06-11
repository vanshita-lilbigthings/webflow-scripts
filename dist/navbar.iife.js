(function () {
  Webflow.push(function () {
    let e = document.querySelector(`.navbar`);
    e &&
      window.addEventListener(`scroll`, function () {
        window.scrollY > 50
          ? e.classList.add(`navbar--scrolled`)
          : e.classList.remove(`navbar--scrolled`);
      });
  });
})();
