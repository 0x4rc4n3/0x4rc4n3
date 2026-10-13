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

  // ---- page-view counter: one atomic Supabase increment for every page load ----
  var vn = document.getElementById('visitor-number');
  if (vn) {
    var lastCount = '';
    try {
      var savedCount = localStorage.getItem('visitor-last-count');
      if (/^\d+$/.test(savedCount || '')) lastCount = savedCount;
    } catch (e) {}
    if (lastCount) vn.textContent = lastCount.padStart(4, '0');
    var countedThisSession = false;
    try { countedThisSession = sessionStorage.getItem('portfolio-view-counted') === '1'; } catch (e) {
      try { countedThisSession = /(?:^|;\s*)portfolio-view-counted=1(?:;|$)/.test(document.cookie); } catch (ignored) {}
    }
    if (!countedThisSession) {
      try { sessionStorage.setItem('portfolio-view-counted', '1'); }
      catch (e) { try { document.cookie = 'portfolio-view-counted=1; Path=/; SameSite=Lax; Secure'; } catch (ignored) {} }
    }
    var counterUrl = 'https://jbjzzvibtgtgzlbchqnm.supabase.co';
    var counterKey = 'sb_publishable_jyc4IQsrNU_G5B63HVzNPg_MPwC7RhD';
    var rpc = countedThisSession ? 'get_portfolio_page_views' : 'increment_portfolio_page_views';
    fetch(counterUrl + '/rest/v1/rpc/' + rpc, {
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
        try { localStorage.setItem('visitor-last-count', String(count)); } catch (e) {}
      })
      .catch(function (e) {
        // Keep the last real count (or the neutral initial 0000) on transient network failures.
        console.warn('Visitor counter could not refresh:', e);
        if (lastCount) vn.textContent = lastCount.padStart(4, '0');
      });
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

  // ---- whole-site search (projects + articles) ----
  var toggle = document.getElementById('search-toggle');
  var panel = document.getElementById('site-search-panel');
  var input = document.getElementById('site-search-input');
  var results = document.getElementById('site-search-results');
  var searchStatus = document.getElementById('site-search-status');
  if (toggle && panel && input && results && searchStatus) {
    var searchIndex = null, searchLoad = null, searchTimer = null, requestId = 0;
    var loadSearchIndex = function () {
      if (searchIndex) return Promise.resolve(searchIndex);
      if (!searchLoad) searchLoad = fetch(input.dataset.index, { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('index unavailable')); })
        .then(function (data) { searchIndex = data; return data; });
      return searchLoad;
    };
    var highlight = function (el, text, terms) {
      el.textContent = '';
      if (!terms.length) { el.textContent = text; return; }
      var rx = new RegExp('(' + terms.map(function (x) { return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'gi');
      text.split(rx).forEach(function (part, i) {
        if (i % 2) { var mark = document.createElement('mark'); mark.textContent = part; el.appendChild(mark); }
        else if (part) el.appendChild(document.createTextNode(part));
      });
    };
    var closeSearch = function () {
      panel.hidden = true; toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open site search');
    };
    toggle.addEventListener('click', function () {
      var opening = panel.hidden;
      panel.hidden = !opening;
      toggle.setAttribute('aria-expanded', String(opening));
      toggle.setAttribute('aria-label', opening ? 'Close site search' : 'Open site search');
      if (opening) input.focus();
    });
    input.addEventListener('input', function () {
      clearTimeout(searchTimer);
      var id = ++requestId;
      searchTimer = setTimeout(function () {
        var q = input.value.trim(), terms = q.toLowerCase().split(/\s+/).filter(Boolean);
        results.textContent = '';
        if (!terms.length) { searchStatus.textContent = 'TYPE TO SEARCH THE SITE'; return; }
        searchStatus.textContent = 'SEARCHING…';
        loadSearchIndex().then(function (items) {
          if (id !== requestId) return;
          var matches = items.map(function (item) {
            var fields = [item.t, item.c, item.d, item.b].map(function (x) { return String(x || '').toLowerCase(); });
            var all = terms.every(function (term) { return fields.some(function (field) { return field.indexOf(term) !== -1; }); });
            if (!all) return null;
            var score = terms.reduce(function (n, term) { return n + (fields[0].indexOf(term) >= 0 ? 8 : 0) + (fields[1].indexOf(term) >= 0 ? 4 : 0) + (fields[2].indexOf(term) >= 0 ? 2 : 0) + (fields[3].indexOf(term) >= 0 ? 1 : 0); }, 0);
            var at = item.b ? Math.max(0, item.b.toLowerCase().indexOf(terms[0])) : -1;
            var snippet = at >= 0 ? (at > 42 ? '…' : '') + item.b.slice(Math.max(0, at - 42), at + 118) + '…' : item.d;
            return { item: item, score: score, snippet: snippet };
          }).filter(Boolean).sort(function (a, b) { return b.score - a.score || a.item.t.localeCompare(b.item.t); }).slice(0, 12);
          matches.forEach(function (hit) {
            var a = document.createElement('a'); a.className = 'site-result'; a.href = hit.item.u;
            var kind = document.createElement('span'); kind.className = 'site-result-kind'; kind.textContent = hit.item.k;
            var title = document.createElement('span'); title.className = 'site-result-title'; highlight(title, hit.item.t, terms);
            var desc = document.createElement('span'); desc.className = 'site-result-desc'; highlight(desc, hit.snippet, terms);
            a.appendChild(kind); a.appendChild(title); a.appendChild(desc); results.appendChild(a);
          });
          searchStatus.textContent = matches.length ? matches.length + (matches.length === 1 ? ' RESULT' : ' RESULTS') : 'NO MATCHES. TRY ANOTHER WORD.';
        }).catch(function () { if (id === requestId) searchStatus.textContent = 'SEARCH IS TEMPORARILY UNAVAILABLE'; });
      }, 100);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { input.value = ''; results.textContent = ''; searchStatus.textContent = 'TYPE TO SEARCH THE SITE'; closeSearch(); toggle.focus(); }
    });
    document.addEventListener('click', function (e) { if (!panel.contains(e.target) && !toggle.contains(e.target)) closeSearch(); });
  }

})();
