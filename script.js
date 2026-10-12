(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var PHONE = '27640948066', EMAIL = 'desentralprojects@gmail.com';

  /* header, active link, back to top */
  var header = $('#header'), topBtn = $('#top');
  var secs = $$('main section[id]'), links = $$('.menu a[href^="#"]:not(.menu-cta)');
  function onScroll() {
    var y = window.scrollY, cur = secs[0].id;
    header.classList.toggle('solid', y > 40);
    topBtn.classList.toggle('show', y > 700);
    secs.forEach(function (s) { if (s.offsetTop - 140 <= y) cur = s.id; });
    if (cur === 'why' || cur === 'sectors') cur = 'services';
    if (cur === 'quote') cur = 'contact';
    links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + cur); });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  topBtn.addEventListener('click', function () { scrollTo({ top: 0, behavior: 'smooth' }); });
  $('#yr').textContent = new Date().getFullYear();

  /* mobile menu */
  var menu = $('#menu'), burger = $('#burger');
  function setMenu(open) {
    menu.classList.toggle('open', open); burger.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  $$('.menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  addEventListener('resize', function () { if (innerWidth > 860 && menu.classList.contains('open')) setMenu(false); });

  /* scroll reveal with stagger */
  var rv = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12 });
    rv.forEach(function (el) {
      var sib = $$('.reveal', el.parentNode), i = sib.indexOf(el);
      el.style.transitionDelay = (i % 4) * 90 + 'ms'; io.observe(el);
    });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  /* gallery filter + lightbox */
  $$('.filters button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.filters button').forEach(function (x) { x.classList.toggle('on', x === b); });
      $$('.g').forEach(function (g) { g.classList.toggle('hide', b.dataset.f !== 'all' && g.dataset.cat !== b.dataset.f); });
    });
  });
  var lb = $('#lb'), lbi = $('#lbi'), lbc = $('#lbc'), idx = 0, opener = null;
  var vis = function () { return $$('.g:not(.hide)'); };
  function show(n) {
    var v = vis(); if (!v.length) return; idx = (n + v.length) % v.length;
    var im = $('img', v[idx]); lbi.src = im.currentSrc || im.src; lbi.alt = im.alt; lbc.textContent = im.alt;
  }
  function openLb(b) { opener = b; lb.hidden = false; document.body.style.overflow = 'hidden'; show(vis().indexOf(b)); $('#lbx').focus(); }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ''; if (opener) opener.focus(); }
  $$('.g').forEach(function (b) { b.addEventListener('click', function () { openLb(b); }); });
  $('#lbx').addEventListener('click', closeLb);
  $('#lbp').addEventListener('click', function () { show(idx - 1); });
  $('#lbn').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.hidden) {
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'Tab') { var f = $$('button', lb); var i = f.indexOf(document.activeElement); e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); }
    } else if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false);
  });

  /* service cards preselect the form */
  $$('[data-svc]').forEach(function (a) {
    a.addEventListener('click', function () { $('#fsvc').value = a.dataset.svc; });
  });

  /* quote form: validate, then hand off to WhatsApp or email (no server) */
  var form = $('#form'), status = $('#status');
  var MSG = { name: 'Enter your full name.', phone: 'Enter a valid phone number.', email: 'Enter a valid email address.', service: 'Choose a service.', type: 'Choose a project type.', location: 'Enter the project location.', description: 'Describe the project (at least 10 characters).' };
  function check(el) {
    var w = el.closest('.f'), ok = el.checkValidity();
    w.classList.toggle('bad', !ok); el.setAttribute('aria-invalid', !ok);
    $('.err', w).textContent = ok ? '' : (el.value ? MSG[el.name] : 'This field is required.');
    return ok;
  }
  $$('input,select,textarea', form).forEach(function (el) {
    el.addEventListener('blur', function () { check(el); });
    el.addEventListener('input', function () { if (el.closest('.f').classList.contains('bad')) check(el); });
  });
  function body(d) {
    return 'Hello Desentral Projects & Civil Works, I would like a quote.\n\nName: ' + d.name + '\nPhone: ' + d.phone +
      (d.email ? '\nEmail: ' + d.email : '') + '\nService: ' + d.service + '\nProject type: ' + d.type +
      '\nLocation: ' + d.location + '\nDescription: ' + d.description;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = $$('input,select,textarea', form).filter(function (el) { return !check(el); });
    status.hidden = false;
    if (bad.length) {
      status.className = 'status no'; status.textContent = 'Please correct the ' + bad.length + ' highlighted field' + (bad.length > 1 ? 's' : '') + ' and submit again.'; bad[0].focus(); return;
    }
    var d = {}; new FormData(form).forEach(function (v, k) { d[k] = String(v).trim(); });
    var wa = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(body(d));
    var mail = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Quote request: ' + d.service) + '&body=' + encodeURIComponent(body(d));
    status.className = 'status ok';
    status.innerHTML = '<b>Thank you, ' + d.name.split(' ')[0].replace(/[<>&]/g, '') + '. Your enquiry is ready.</b><br>This site has no server, so choose how to send it. Nothing is sent until you press send in WhatsApp or your email app.' +
      '<div class="row"><a class="btn pri" target="_blank" rel="noopener" href="' + wa + '">Send on WhatsApp</a><a class="btn line" href="' + mail + '">Send by Email</a></div>';
    status.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  /* premium effects: progress bar, spotlight + tilt, orb parallax */
  var prog = $('#progress'), orbs = $$('.orb');
  function fx() {
    var h = document.documentElement.scrollHeight - innerHeight, y = scrollY;
    prog.style.width = (h > 0 ? y / h * 100 : 0) + '%';
    if (y < innerHeight * 1.2) orbs.forEach(function (o, i) { o.style.marginTop = (y * (i ? -.08 : .12)) + 'px'; });
  }
  addEventListener('scroll', fx, { passive: true }); fx();
  if (matchMedia('(hover:hover)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
    $$('.svc, .sector').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px');
        c.style.transitionDelay = '0ms'; c.style.transitionDuration = '.15s';
        c.style.transform = 'perspective(900px) rotateY(' + ((x / r.width - .5) * 8) + 'deg) rotateX(' + (-(y / r.height - .5) * 8) + 'deg) translateY(-8px) scale(1.03)';
      });
      c.addEventListener('mouseleave', function () { c.style.transform = ''; c.style.transitionDuration = ''; });
    });
  }

  /* business hours: highlight today + open/closed badge (South Africa time) */
  (function () {
    var rows = $$('.hours tr'), badge = $('#openNow'); if (!rows.length) return;
    var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Johannesburg', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()), g = {};
    p.forEach(function (x) { g[x.type] = x.value; });
    var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g.weekday), mins = (+g.hour % 24) * 60 + +g.minute;
    rows.forEach(function (r) {
      if (+r.dataset.d !== day) return;
      r.classList.add('today');
      var m = r.cells[1].textContent.match(/(\d\d):(\d\d)\s*\D+\s*(\d\d):(\d\d)/);
      badge.hidden = false;
      if (!m) { badge.textContent = 'Closed today'; badge.className = 'open-badge off'; return; }
      var a = +m[1] * 60 + +m[2], b = +m[3] * 60 + +m[4];
      if (b <= a) { badge.hidden = true; return; }
      var on = mins >= a && mins < b; badge.textContent = on ? 'Open now' : 'Closed now'; badge.className = 'open-badge ' + (on ? 'on' : 'off');
    });
  })();
})();
