Webflow.push(function () {
  const bar = document.createElement('div');
  bar.style.cssText =
    'position:fixed;top:0;left:0;height:3px;background:#4353FF;z-index:9999;width:0%;transition:width 0.1s;';
  document.body.appendChild(bar);

  window.addEventListener('scroll', function () {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    bar.style.width = progress + '%';
  });
});
