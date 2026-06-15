Webflow.push(function () {
  const modal = document.querySelector('.modal');
  const overlay = document.querySelector('.modal-overlay');

  if (!modal || !overlay) return;

  function openModal() {
    modal.classList.add('modal--open');
    overlay.classList.add('modal-overlay--visible');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('modal--open');
    overlay.classList.remove('modal-overlay--visible');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-modal-open]').forEach(function (trigger) {
    trigger.addEventListener('click', openModal);
  });

  document.querySelectorAll('[data-modal-close]').forEach(function (trigger) {
    trigger.addEventListener('click', closeModal);
  });

  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
});
