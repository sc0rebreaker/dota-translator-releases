(function () {
  'use strict';
  var token = location.hash.slice(1);
  history.replaceState(null, '', location.pathname);
  var API = 'https://api.dotaskinchanger.live/translator';
  var button = document.getElementById('signin'), state = document.getElementById('state');
  var analyticsReady = null, completedSignup = '';
  function loadMeasurement() {
    if (analyticsReady) return;
    // The login secret has been consumed and cleared before third-party code loads.
    analyticsReady = document.createElement('script');
    analyticsReady.src = '/analytics.js?v=20261028-reddit';
    analyticsReady.onload = function () { if (completedSignup && window.dtMeasurement) window.dtMeasurement.signup(completedSignup); };
    document.head.appendChild(analyticsReady);
  }
  async function call(path, data) {
    var response = await fetch(API + path, { method: 'POST', credentials: 'omit', redirect: 'error', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: AbortSignal.timeout(10000) });
    var result = await response.json();
    if (!response.ok) throw Error('This link has expired or was already used. Request a new email in the app.');
    return result;
  }
  async function waitForApp(receipt) {
    var until = Date.now() + 15 * 60 * 1000;
    while (Date.now() < until) {
      try {
        var result = await call('/v1/auth/link-result', { receipt: receipt });
        if (result.completed) {
          state.textContent = 'Signed in. Return to Dota Translator. You can close this page.';
          if (result.conversionId) {
            completedSignup = result.conversionId;
            if (window.dtMeasurement) window.dtMeasurement.signup(completedSignup);
          }
          return;
        }
      } catch (_) { /* Account sign-in is independent of browser measurement. */ }
      await new Promise(function (resolve) { setTimeout(resolve, 2000); });
    }
  }
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
    button.hidden = true;
    var previouslyApproved = false;
    try { previouslyApproved = Number(sessionStorage.getItem('dt_link_confirmed')) > Date.now() - 15 * 60 * 1000; } catch (_) {}
    state.textContent = previouslyApproved ? 'Sign-in was confirmed. Return to your open Dota Translator app.' : 'This link is invalid. Request a new sign-in email in Dota Translator.';
    // No auth secret is present on this page.
    loadMeasurement();
    return;
  }
  button.addEventListener('click', async function () {
    button.disabled = true; state.textContent = 'Confirming sign-in...';
    try {
      var result = await call('/v1/auth/approve-link', { token: token, reportResult: true });
      if (!result.approved) throw Error('Could not confirm sign-in. Request a new email in the app.');
      token = '';
      try { sessionStorage.setItem('dt_link_confirmed', String(Date.now())); } catch (_) {}
      state.textContent = 'Confirmed. Waiting for your open Dota Translator app to sign in...';
      button.hidden = true;
      loadMeasurement();
      if (result.receipt) waitForApp(result.receipt);
    } catch (error) {
      state.textContent = error.message || 'Could not reach the server. Try again.';
      button.disabled = false;
    }
  });
})();
