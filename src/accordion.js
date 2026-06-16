Webflow.push(function () {
  document.querySelectorAll('[data-accordion]').forEach(function (accordion) {
    accordion
      .querySelectorAll('[data-accordion-trigger]')
      .forEach(function (trigger) {
        trigger.addEventListener('click', function () {
          const item = trigger.closest('[data-accordion-item]');
          const isOpen = item.classList.contains('is-open');
          accordion
            .querySelectorAll('[data-accordion-item]')
            .forEach(function (el) {
              el.classList.remove('is-open');
            });
          if (!isOpen) item.classList.add('is-open');
        });
      });
  });
});
