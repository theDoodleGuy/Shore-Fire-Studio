// Shore Fire Studio — storefront draft v0.1
(function () {
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    btn.textContent = open ? 'Close' : 'Menu';
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', false); btn.textContent = 'Menu'; }
  });

  // Package buttons preselect the form option
  var select = document.getElementById('package');
  document.querySelectorAll('[data-package]').forEach(function (a) {
    a.addEventListener('click', function () { select.value = a.dataset.package; });
  });

  // Draft form handling: no backend yet, so open the visitor's email app with the details.
  // TODO: swap for a form service (e.g. Netlify Forms / Formspree) before launch.
  var form = document.getElementById('quote');
  var msg = form.querySelector('.form-msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(form);
    if (!d.get('name') || !d.get('contact')) { msg.textContent = 'Just need your name and a way to reach you.'; return; }
    var body = ['Name: ' + d.get('name'), 'Business: ' + (d.get('business') || '-'), 'Contact: ' + d.get('contact'),
      'Interested in: ' + d.get('package'), '', d.get('message') || ''].join('\n');
    window.location.href = 'mailto:hello@shorefirestudio.com?subject=' + encodeURIComponent('Quote request: ' + d.get('package')) +
      '&body=' + encodeURIComponent(body);
    msg.textContent = 'Cheers — your email app should open with everything filled in.';
  });

  document.getElementById('yr').textContent = new Date().getFullYear();
})();
