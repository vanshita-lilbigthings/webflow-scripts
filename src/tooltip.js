Webflow.push(function () {
  document.querySelectorAll('[data-tooltip]').forEach(function (el) {
    const tip = document.createElement('span');
    tip.className = 'tooltip__bubble';
    tip.textContent = el.getAttribute('data-tooltip');
    el.classList.add('tooltip');
    el.appendChild(tip);

    el.addEventListener('mouseenter', function () {
      tip.classList.add('tooltip__bubble--visible');
    });
    el.addEventListener('mouseleave', function () {
      tip.classList.remove('tooltip__bubble--visible');
    });
  });
});
