// Site behaviour. Kept in an external file so the CSP can forbid inline scripts.
(function () {
  // ---- menu ----
  var mb = document.getElementById('mb'), nv = document.getElementById('nav');
  if (mb && nv) {
    mb.addEventListener('click', function () {
      var opening = nv.hidden;
      nv.hidden = !opening;
      mb.textContent = opening ? 'CLOSE' : 'MENU';
      mb.setAttribute('aria-expanded', String(opening));
    });
  }

  // ---- clock ----
  var clock = document.getElementById('clock');
  if (clock) {
    var fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
    var tick = function () { clock.textContent = fmt.format(new Date()); };
    tick(); setInterval(tick, 1000);
  }

  // ---- page-view counter (one increment for every page load; see api/visitors.js) ----
  var vn = document.getElementById('visitor-number');
  if (vn) {
    var counterUrl = 'https://jbjzzvibtgtgzlbchqnm.supabase.co';
    var counterKey = 'sb_publishable_jyc4IQsrNU_G5B63HVzNPg_MPwC7RhD';
    fetch(counterUrl + '/rest/v1/rpc/increment_portfolio_page_views', {
      method: 'POST',
      headers: { apikey: counterKey, Authorization: 'Bearer ' + counterKey, 'Content-Type': 'application/json' },
      body: '{}',
      cache: 'no-store'
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (d) {
        var count = Number(d);
        if (!Number.isSafeInteger(count) || count < 0) throw 0;
        vn.textContent = String(count).padStart(4, '0');
      })
      .catch(function () { vn.textContent = '----'; });
  }

  // ---- contact form (mailto fallback) ----
  var form = document.getElementById('cf');
  if (form && form.dataset.mailto) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = form.elements.name.value, m = form.elements.email.value, b = form.elements.message.value;
      location.href = 'mailto:' + form.dataset.mailto +
        '?subject=' + encodeURIComponent('Portfolio message from ' + n) +
        '&body=' + encodeURIComponent(b + '\n\n' + n + ' <' + m + '>');
    });
  }

  // ---- blog search (index built by build.mjs -> search-index.json) ----
  var box = document.getElementById('bs'), list = document.getElementById('bl'), status = document.getElementById('bs-status');
  if (box && list) {
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-slug]'));
    cards.forEach(function (c) {
      var t = c.querySelector('.ctitle'), x = c.querySelector('.excerpt');
      c._t = t; c._x = x; c._tt = t ? t.textContent : ''; c._xt = x ? x.textContent : '';
    });
    var index = null, loading = null, timer = null;

    var domIndex = function () {
      return cards.map(function (c) {
        var tag = c.querySelector('.tag');
        return { s: c.dataset.slug, t: c._tt, c: tag ? tag.textContent : '', d: c._xt, b: '' };
      });
    };
    var load = function () {
      if (index) return Promise.resolve(index);
      if (!loading) {
        loading = fetch(box.dataset.index, { credentials: 'same-origin' })
          .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
          .catch(function () { return domIndex(); })
          .then(function (j) { index = j; return j; });
      }
      return loading;
    };
    var esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
    var mark = function (el, text, re) {
      if (!el) return;
      el.textContent = '';
      if (!re) { el.textContent = text; return; }
      text.split(re).forEach(function (part, i) {
        if (i % 2) { var m = document.createElement('mark'); m.textContent = part; el.appendChild(m); }
        else if (part) el.appendChild(document.createTextNode(part));
      });
    };
    var count = function (hay, tok) { var n = 0, i = hay.indexOf(tok); while (i !== -1 && n < 5) { n++; i = hay.indexOf(tok, i + tok.length); } return n; };

    var reset = function () {
      cards.forEach(function (c) { c.hidden = false; mark(c._t, c._tt); mark(c._x, c._xt); list.appendChild(c); });
      status.textContent = '';
    };

    var run = function () {
      var q = box.value.toLowerCase().trim();
      if (!q) { reset(); return; }
      var toks = q.split(/\s+/).filter(Boolean);
      var re = new RegExp('(' + toks.map(esc).join('|') + ')', 'gi');
      load().then(function (idx) {
        if (box.value.toLowerCase().trim() !== q) return; // a newer query is already running
        var hits = {};
        idx.forEach(function (e) {
          var title = e.t.toLowerCase(), cat = e.c.toLowerCase(), sum = e.d.toLowerCase(), body = e.b.toLowerCase(), score = 0;
          for (var i = 0; i < toks.length; i++) {
            var k = toks[i], a = title.indexOf(k) !== -1, b = cat.indexOf(k) !== -1, c = sum.indexOf(k) !== -1, d = count(body, k);
            if (!a && !b && !c && !d) return;
            score += (a ? 10 : 0) + (b ? 4 : 0) + (c ? 3 : 0) + d;
          }
          var snippet = '';
          if (e.b && title.indexOf(toks[0]) === -1 && sum.indexOf(toks[0]) === -1) {
            var at = body.indexOf(toks[0]), from = Math.max(0, at - 50);
            snippet = (from ? '\u2026' : '') + e.b.slice(from, at + 90) + '\u2026';
          }
          hits[e.s] = { score: score, snippet: snippet };
        });
        var shown = cards.filter(function (c) { return hits[c.dataset.slug]; })
          .sort(function (a, b) { return hits[b.dataset.slug].score - hits[a.dataset.slug].score; });
        cards.forEach(function (c) { c.hidden = !hits[c.dataset.slug]; });
        shown.forEach(function (c) {
          var h = hits[c.dataset.slug];
          mark(c._t, c._tt, re);
          mark(c._x, h.snippet || c._xt, re);
          list.appendChild(c);
        });
        status.textContent = shown.length
          ? shown.length + (shown.length === 1 ? ' RESULT' : ' RESULTS')
          : 'NO MATCHES. TRY ANOTHER WORD.';
      });
    };

    box.addEventListener('focus', load);
    box.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 120); });
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape') { box.value = ''; run(); } });
    var pre = new URLSearchParams(location.search).get('q');
    if (pre) { box.value = pre; run(); }
  }
})();
