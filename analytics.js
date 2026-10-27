// Google Analytics for the WEBSITE, one file for every page in docs/.
// The app never loads this: it is not in src/, and it does nothing unless
// the page came over http(s) from the real site (not localhost, not a file).
(function () {
  var ID = 'G-RX1LXWKFZD';
  if (!/^https?:$/.test(location.protocol) || /^(localhost|127\.)/.test(location.hostname)) return;
  var enabled = false, loaded = false;
  var preference = null;
  try { preference = localStorage.getItem('dt_website_analytics'); } catch (_) {}
  window.dataLayer = window.dataLayer || [];
  function gtag() { if (enabled) window.dataLayer.push(arguments); }
  function enable() {
    enabled = true; window['ga-disable-' + ID] = false;
    if (loaded) return;
    loaded = true;
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(script);
    gtag('js', new Date()); gtag('config', ID);
  }
  function choose(accept) {
    enabled = accept; window['ga-disable-' + ID] = !accept;
    try { localStorage.setItem('dt_website_analytics', accept ? 'yes' : 'no'); } catch (_) {}
    if (accept) enable();
    else document.cookie.split('; ').map(function (v) { return v.split('=')[0]; }).filter(function (n) { return n === '_ga' || n.indexOf('_ga_') === 0; }).forEach(function (n) {
      document.cookie = n + '=; Max-Age=0; Path=/; Secure; SameSite=Lax';
      document.cookie = n + '=; Max-Age=0; Path=/; Domain=dotatranslator.live; Secure; SameSite=Lax';
    });
    panel.hidden = true;
  }
  var style = document.createElement('link'); style.rel = 'stylesheet'; style.href = '/privacy-banner.css?v=20261028'; document.head.appendChild(style);
  var panel = document.createElement('section'); panel.className = 'dt-privacy'; panel.setAttribute('aria-label', 'Privacy choices');
  panel.innerHTML = '<div class="dt-privacy-summary"><p>We use optional cookies for website analytics. <a href="/privacy.html">Privacy details</a></p></div><div class="dt-privacy-details" hidden><h2>Your privacy choices</h2><p>Google Analytics helps us understand website visits and interactions, including download clicks. It is optional and is not needed to use Dota Translator.</p><label><input type="checkbox" id="dt-analytics"> Website analytics</label></div><div class="dt-privacy-actions"><button type="button" data-choice="accept">Accept</button><button type="button" data-choice="reject">Reject</button><button type="button" data-action="settings">Settings</button><button type="button" data-choice="save" hidden>Save choices</button><button type="button" data-action="back" hidden>Back</button></div>';
  document.body.appendChild(panel);
  function details(open) {
    panel.querySelector('.dt-privacy-summary').hidden = open;
    panel.querySelector('.dt-privacy-details').hidden = !open;
    panel.querySelector('[data-action="settings"]').hidden = open;
    panel.querySelector('[data-choice="save"]').hidden = !open;
    panel.querySelector('[data-action="back"]').hidden = !open;
    panel.classList.toggle('dt-privacy-expanded', open);
    if (open) panel.querySelector('#dt-analytics').checked = enabled;
  }
  panel.addEventListener('click', function (event) {
    var action = event.target.closest('button[data-action]');
    if (action) { var open = action.dataset.action === 'settings'; details(open); panel.querySelector(open ? '#dt-analytics' : '[data-action="settings"]').focus(); return; }
    var button = event.target.closest('button[data-choice]');
    if (button) choose(button.dataset.choice === 'accept' || button.dataset.choice === 'save' && panel.querySelector('#dt-analytics').checked);
  });
  var settings = document.createElement('button'); settings.type = 'button'; settings.className = 'dt-privacy-settings'; settings.textContent = 'Privacy choices';
  (document.querySelector('footer') || document.body).appendChild(settings);
  settings.addEventListener('click', function () { details(true); panel.hidden = false; panel.querySelector('#dt-analytics').focus(); });
  if (preference === 'yes') enable();
  panel.hidden = preference === 'yes' || preference === 'no';

  // What a page view cannot say: did anybody press the button? The
  // download is a link to GitHub, so without this it leaves no trace.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (a.classList.contains('skin-nav') || a.getAttribute('data-product') === 'skin-changer') gtag('event', 'skin_changer_click', { page: location.pathname, placement: a.classList.contains('related-card') ? 'more' : 'navigation' });
    if (a.classList.contains('related-card')) gtag('event', 'related_product_click', { page: location.pathname, product: a.getAttribute('data-product'), placement: 'more' });
    var where = location.pathname.split('/').pop() || 'index.html';
    // The Treasure Simulator's glowing "Try Dota Translator" button (the user,
    // 2026-10-04: does the simulator crowd come over?). Phone or desktop,
    // because only a desktop visitor can install the app.
    // `to`: Russian-language browsers are sent to /ru/ (2026-10-04).
    if (a.classList.contains('dt-cta')) gtag('event', 'treasure_cta_click', { device: matchMedia('(pointer: coarse)').matches ? 'phone' : 'desktop', to: href.indexOf('/ru/') >= 0 ? 'ru' : 'en' });
    else if (/Dota-Translator-Setup\.exe$/.test(href)) gtag('event', 'download_click', { page: where, label: a.textContent.trim().slice(0, 40) });
    else if (/aistudio\.google\.com/.test(href)) gtag('event', 'aistudio_click', { page: where });
    else if (/ko-fi\.com/.test(href)) gtag('event', 'donate_click', { page: where });
    else if (/github\.com\/sc0rebreaker/.test(href)) gtag('event', 'github_click', { page: where });
    else if (href === 'key.html' || href === 'download.html' || href === 'install.html') gtag('event', 'guide_click', { page: where, to: href });
  });
  // The slider in the hero: once per visit, the first time it is moved by hand.
  var slider = document.querySelector('input[type=range]');
  if (slider) slider.addEventListener('pointerdown', function () { gtag('event', 'slider_used'); }, { once: true });
  // The hero's language tabs: which of Russian, Spanish and Chinese people look at.
  var tabs = document.querySelectorAll('.seg button[data-lang]');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', function () { gtag('event', 'language_tab', { lang: this.getAttribute('data-lang') }); });
  }
})();
