Webflow.push(function () {
  const navbar = document.querySelector('.navbar');

  if (!navbar) return;
  console.log(undefinedVariable)

  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  });
});
