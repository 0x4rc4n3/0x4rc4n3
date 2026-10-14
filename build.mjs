// Zero-dependency static site generator. Run: node build.mjs  ->  dist/
// Also validates content and the generated HTML; exits non-zero on any problem (used by CI).
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const R = (...p) => path.join(process.cwd(), ...p);
const errors = [];
const fail = m => errors.push(m);

// ---------- text helpers ----------
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const xml = esc;
const clip = (s, n) => { s = String(s ?? '').replace(/\s+/g, ' ').trim(); return s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…'; };
const slugify = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const ld = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

// Only allow web-safe URL schemes in Markdown links/images (blocks javascript:, data:, vbscript: ...).
const safeUrl = u => {
  const probe = String(u).replace(/[\u0000-\u0020]/g, '');
  return !/^[a-z][a-z0-9+.-]*:/i.test(probe) || /^(https?|mailto|tel):/i.test(probe) ? u : '#';
};

const site = JSON.parse(fs.readFileSync(R('content/site.json'), 'utf8'));
for (const k of ['name', 'role', 'url', 'photo', 'description', 'about', 'contact']) if (!site[k]) fail(`site.json: missing "${k}"`);
const SITE = String(site.url || '').replace(/\/$/, '');
const assetVersion = createHash('sha256')
  .update(fs.readFileSync(R('static/style.css')))
  .update(fs.readFileSync(R('static/site.js')))
  .digest('hex').slice(0, 12);
const abs = p => SITE + (p.startsWith('/') ? p : '/' + p);
const isExternal = u => /^https?:\/\//i.test(u) && !u.startsWith(SITE);
const rel = u => (isExternal(u) ? ' rel="noopener noreferrer"' : '');

const inl = s => {
  const codes = [];
  let t = String(s ?? '').replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  t = esc(t)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, u) => `<img src="${safeUrl(u)}" alt="${alt}" loading="lazy" decoding="async">`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, u) => `<a href="${safeUrl(u)}"${rel(u)}>${txt}</a>`);
  return t.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
};

function md(text) {
  const lines = text.split(/\r?\n/), out = [];
  let block = null; // 'ul' | 'ol' | 'bq'
  const close = () => { if (block) { out.push(block === 'bq' ? '</blockquote>' : `</${block}>`); block = null; } };
  const open = (kind) => { if (block !== kind) { close(); block = kind; out.push(kind === 'bq' ? '<blockquote>' : `<${kind}>`); } };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trimEnd(); let m;
    if ((m = l.match(/^```(\w*)\s*$/))) {
      close();
      const code = [];
      for (i++; i < lines.length && !/^```\s*$/.test(lines[i]); i++) code.push(lines[i]);
      out.push(`<pre><code${m[1] ? ` class="language-${esc(m[1])}"` : ''}>${esc(code.join('\n'))}</code></pre>`);
      continue;
    }
    if ((m = l.match(/^[-*] (.*)/))) { open('ul'); out.push('<li>' + inl(m[1]) + '</li>'); continue; }
    if ((m = l.match(/^\d+[.)] (.*)/))) { open('ol'); out.push('<li>' + inl(m[1]) + '</li>'); continue; }
    if ((m = l.match(/^> ?(.*)/))) { open('bq'); if (m[1]) out.push('<p>' + inl(m[1]) + '</p>'); continue; }
    close();
    if (/^(-{3,}|\*{3,})$/.test(l)) out.push('<hr>');
    else if ((m = l.match(/^(#{1,3}) (.*)/))) { const n = m[1].length + 1; out.push(`<h${n} id="${slugify(m[2])}">${inl(m[2])}</h${n}>`); }
    else if (l) out.push('<p>' + inl(l) + '</p>');
  }
  close();
  return out.join('\n');
}

function parse(file) {
  const t = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const m = t.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const data = { slug: path.basename(file, '.md'), body: m ? m[2] : t, file: path.basename(file) };
  if (!m) fail(`${data.file}: missing front matter`);
  if (m) for (const line of m[1].split(/\r?\n/)) {
    const k = line.match(/^(\w+):\s*(.*)$/);
    if (k) {
      let value = k[2];
      if (value.startsWith('"')) { try { value = JSON.parse(value); } catch { fail(`${data.file}: bad quoted value for "${k[1]}"`); } }
      else value = value.replace(/^'|'$/g, '');
      data[k[1]] = value;
    }
  }
  return data;
}
const load = dir => fs.existsSync(R('content', dir)) ? fs.readdirSync(R('content', dir)).filter(f => f.endsWith('.md')).map(f => parse(R('content', dir, f))) : [];

const works = load('works').sort((a, b) => (+a.order || 99) - (+b.order || 99));
const blogs = load('blogs').sort((a, b) => String(b.date).localeCompare(String(a.date)));

// ---------- content validation ----------
for (const w of works) for (const k of ['title', 'summary']) if (!w[k]) fail(`works/${w.file}: missing "${k}"`);
for (const b of blogs) {
  for (const k of ['title', 'date', 'summary']) if (!b[k]) fail(`blogs/${b.file}: missing "${k}"`);
  if (b.date && (!/^\d{4}-\d{2}-\d{2}$/.test(b.date) || Number.isNaN(Date.parse(b.date)))) fail(`blogs/${b.file}: date must be YYYY-MM-DD`);
}
const seenOrders = new Set();
for (const b of blogs) { if (b.order && seenOrders.has(b.order)) fail(`blogs: duplicate order ${b.order} (${b.file})`); seenOrders.add(b.order); }
// categories: content/categories.json gives order + descriptions; any category used by a post is picked up automatically
const catFile = fs.existsSync(R('content/categories.json')) ? JSON.parse(fs.readFileSync(R('content/categories.json'), 'utf8')) : { categories: [] };
const catMeta = new Map((catFile.categories || []).map(x => [x.name, x.description || '']));
const cats = [...new Set([...catMeta.keys(), ...blogs.map(b => b.category).filter(Boolean)])]
  .map(name => ({ name, slug: slugify(name), desc: catMeta.get(name) || '', posts: blogs.filter(b => b.category === name) }))
  .filter(x => x.posts.length);
if (new Set(cats.map(x => x.slug)).size !== cats.length) fail('categories: two category names produce the same URL slug');
for (const b of blogs) if (b.category && !catMeta.has(b.category)) console.warn(`note: blog "${b.slug}" uses category "${b.category}" which is not in content/categories.json (still listed, but has no description)`);
for (const b of blogs) if (!b.category) console.warn(`note: blog "${b.slug}" has no category (shown under ALL only)`);

for (const p of [site.photo, site.ogImage].filter(Boolean)) if (!fs.existsSync(R('static', p))) fail(`site.json: image not found in static/: ${p}`);

// ---------- shared pieces ----------
const dist = (...p) => R('dist', ...p);
fs.rmSync(dist(), { recursive: true, force: true });
const write = (p, html) => { fs.mkdirSync(path.dirname(dist(p)), { recursive: true }); fs.writeFileSync(dist(p), html); };
const fix = (html, b) => html.replace(/(src|href)="\/(?!\/)/g, `$1="${b}`);
const buildISO = new Date().toISOString();
const resumeFile = site.resume && fs.existsSync(R('static', site.resume)) ? site.resume : '';
if (site.resume && !resumeFile) console.warn(`note: resume "${site.resume}" not found in static/, so the download button is hidden`);
if (resumeFile && !/\.pdf$/i.test(resumeFile)) console.warn('note: resume is not a .pdf file');
const resumeName = site.name.trim().replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-Resume.pdf';
const resumeBtn = (cls = 'btn sm') => resumeFile ? `<a class="${cls}" href="${esc(resumeFile)}" download="${esc(resumeName)}" type="application/pdf">DOWNLOAD RESUME</a>` : '';
const readMins = body => Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 200));
const ogDefault = abs(site.ogImage || site.photo);
const ogFor = img => (img && !/\.svg$/i.test(img) ? abs(img) : null);

const thumb = (it, kind, cls) => {
  const glyphs = {
    credential: '<rect x="7" y="9" width="34" height="28" rx="3"/><circle cx="17" cy="19" r="4"/><path d="M11 31c1-5 11-5 12 0M27 18h9M27 25h9M27 32h6"/>',
    shield: '<path d="M24 5 39 11v10c0 10-6 17-15 22C15 38 9 31 9 21V11z"/><path d="m17 24 5 5 10-11"/>',
    network: '<circle cx="24" cy="24" r="5"/><circle cx="10" cy="12" r="3"/><circle cx="38" cy="12" r="3"/><circle cx="10" cy="36" r="3"/><circle cx="38" cy="36" r="3"/><path d="m20 20-8-6m16 6 8-6m-16 14-8 6m16-6 8 6"/>',
    book: '<path d="M24 13c-5-5-12-5-18-4v27c7-1 13 0 18 5 5-5 11-6 18-5V9c-6-1-13-1-18 4Z"/><path d="M24 14v27M11 17c4 0 7 1 9 3m-9 5c4 0 7 1 9 3m17-11c-4 0-7 1-9 3m9 5c-4 0-7 1-9 3"/>',
    lattice: '<path d="m24 6 18 18-18 18L6 24zM15 15l18 18M33 15 15 33M6 24h36M24 6v36"/><circle cx="24" cy="24" r="2"/>'
  };
  const key = kind === 'works' ? (it.slug === 'scatterid' ? 'credential' : it.slug === 'apex-pq' ? 'shield' : 'network')
    : /quantum/i.test(it.category || '') ? 'lattice' : 'book';
  return `<span class="thumb icon-thumb ${cls}" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${glyphs[key]}</g></svg></span>`;
};
const card = (it, kind, b, small, excerpt = false) => `<a class="card ${kind === 'blogs' ? 'blog-card' : 'work-card'}" href="${b}${kind}/${it.slug}/"${kind === 'blogs' ? ` data-slug="${esc(it.slug)}"` : ''}>${thumb(it, kind, small ? 's' : '')}<span class="ct"><span class="${small ? 'ctitle sm' : 'ctitle'}">${esc(it.title)}</span>${it.category || it.type ? `<span class="tag">${esc(it.category || it.type)}</span>` : ''}${excerpt && kind === 'works' && (it.impact || it.summary) ? `<span class="impact">${esc(it.impact || it.summary)}</span>` : excerpt && it.summary ? `<span class="excerpt">${esc(it.summary)}</span>` : ''}</span><span class="chev" aria-hidden="true">&gt;</span></a>`;
const side = (b, showW = true, showB = true) =>
  (showW ? `<h2>Latest Work</h2>${works.slice(0, 4).map(w => card(w, 'works', b)).join('')}<a class="btn sm" href="${b}works/">All Works &gt;</a>` : '') +
  (showB && blogs.length ? `<h2 class="gap">Latest Blogs</h2>${blogs.slice(0, 4).map(x => card(x, 'blogs', b, true)).join('')}<a class="btn sm" href="${b}blogs/">All Blogs &gt;</a>` : '');

function page({ title, desc, depth = 0, base, main, aside, archive = false, active = '', extraWrapClass = '', path: urlPath = '', image, imageAlt, type = 'website', jsonld = '', noindex = false }) {
  const b = base ?? ('../'.repeat(depth) || './');
  const d = clip(desc || site.description, 200);
  const canonical = abs('/' + urlPath);
  const img = image || ogDefault, imgAlt = imageAlt || `${site.name}: ${site.role}`;
  const navItem = (label, href, key) => `<a class="btn${active === key ? ' active' : ''}" href="${href}"${active === key ? ' aria-current="page"' : ''}>${label}</a>`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(d)}">
<link rel="canonical" href="${esc(canonical)}">${noindex ? '<meta name="robots" content="noindex">' : ''}
<meta name="author" content="${esc(site.name)}"><meta name="theme-color" content="#d6d6d6">
<meta property="og:type" content="${type}"><meta property="og:site_name" content="${esc(site.name)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(d)}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${esc(img)}"><meta property="og:image:alt" content="${esc(imgAlt)}">${img === ogDefault ? '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">' : ''}
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(d)}"><meta name="twitter:image" content="${esc(img)}">
<link rel="alternate" type="application/rss+xml" title="${esc(site.name)} blog" href="${b}feed.xml">
<link rel="icon" type="image/png" sizes="128x128" href="${b}favicon.png"><link rel="apple-touch-icon" sizes="128x128" href="${b}favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Fragment+Mono:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${b}style.css?v=${assetVersion}">${jsonld}</head><body>
<a class="skip" href="#main">Skip to content</a>
<header><div class="bar"><button class="btn" id="mb" aria-expanded="false" aria-controls="nav">MENU</button></div>
<nav id="nav" aria-label="Main" hidden>${navItem('HOME', b, 'home')}${navItem('WORKS', `${b}works/`, 'works')}${navItem('BLOGS', `${b}blogs/`, 'blogs')}${navItem('CONTACT', `${b}contact/`, 'contact')}</nav><div class="site-search"><button class="btn search-toggle" id="search-toggle" type="button" aria-expanded="false" aria-controls="site-search-panel" aria-label="Open site search"><span class="search-glyph" aria-hidden="true"></span></button><div class="search-panel" id="site-search-panel" hidden><label class="sr-only" for="site-search-input">Search the whole website</label><input id="site-search-input" type="search" autocomplete="off" spellcheck="false" data-index="${b}search-index.json" aria-controls="site-search-results"></div></div></header>
<main id="site-search-view" class="site-search-view" hidden><p class="search-status" id="site-search-status" role="status" aria-live="polite"></p><div class="search-results" id="site-search-results"></div></main>
<div id="site-content" class="wrap${archive ? ' archive-wrap' : ''}${extraWrapClass ? ` ${extraWrapClass}` : ''}"><main id="main" class="${archive ? 'archive' : ''}">${main}</main>${!archive && aside ? `<aside aria-label="More from ${esc(site.name)}">${aside}</aside>` : ''}</div>
<footer><div class="visitor">VISITOR NO. : <strong id="visitor-number">0000</strong></div><time class="clock" id="clock" aria-label="Current local time"></time></footer>
<script src="${b}site.js?v=${assetVersion}" defer></script></body></html>`;
  return fix(html, b);
}

const crumbs = (b, a, cur, currentHref, extraClass = '') => {
  const className = extraClass ? `crumb ${extraClass}` : 'crumb';
  return `<nav class="${className}" aria-label="Breadcrumb"><a href="${b}">Home</a><span aria-hidden="true">&gt;</span><a href="${b}${a[0]}/"${cur ? '' : ' aria-current="page"'}>${a[1]}</a>${cur ? `<span aria-hidden="true">&gt;</span>${currentHref ? `<a class="crumb-current" href="${currentHref}" aria-current="page">${esc(cur)}</a>` : `<span class="crumb-current" aria-current="page">${esc(cur)}</span>`}` : ''}</nav>`;
};

const c = site.contact || {};
const sameAs = [c.github, c.linkedin, c.website].filter(Boolean);

// ---------- Home ----------
const homeLinks = [
  `<a class="btn sm" href="./contact/">CONTACT</a>`,
  c.github && `<a class="btn sm" href="${esc(c.github)}" rel="noopener noreferrer">GITHUB</a>`,
  c.linkedin && `<a class="btn sm" href="${esc(c.linkedin)}" rel="noopener noreferrer">LINKEDIN</a>`,
  resumeBtn(),
].filter(Boolean).join('');
const entry = e => `<p class="exp"><strong>${esc(e.title)} | ${esc(e.org)}</strong>${e.desc ? `<br>${esc(e.desc)}` : ''}</p>`;

write('index.html', page({
  title: site.homeTitle || `${site.name} | ${site.role} Portfolio`, desc: site.description, depth: 0, active: 'home', path: '', aside: side('./'),
  jsonld: ld({
    '@context': 'https://schema.org', '@type': 'Person', name: site.name, url: SITE + '/', image: abs(site.photo), jobTitle: site.role, description: site.description,
    sameAs, alumniOf: { '@type': 'CollegeOrUniversity', name: 'Khwaja Fareed University of Engineering and IT' },
    knowsAbout: ['Post-quantum cryptography', 'Applied cryptography', 'Secure authentication', 'Security auditing', 'Digital forensics'],
  }),
  main:
`<div class="hero"><img class="photo" src="${esc(site.photo)}" alt="Portrait of ${esc(site.name)}" width="180" height="270" fetchpriority="high"><div><h1 class="name">${esc(site.name)}</h1><div class="role">${esc(site.role)}</div></div></div>
<p class="links">${homeLinks}</p>
<h2>About Me</h2>${site.about.map(p => `<p>${inl(p)}</p>`).join('')}
<h2>${esc(site.skillsTitle)}</h2>${site.skills.map(s => `<p><strong>${esc(s.label)}:</strong> ${esc(s.value)}</p>`).join('')}
<h2>${esc(site.experienceTitle)}</h2>${site.experience.map(entry).join('')}
${site.education?.length ? `<h2>${esc(site.educationTitle || 'Education')}</h2>${site.education.map(entry).join('')}` : ''}
<h2>${esc(site.extrasTitle)}</h2>${site.extras.map(e => `<p><strong>${esc(e.label)}:</strong> ${esc(e.text)}</p>`).join('')}`,
}));

// ---------- Works ----------
write('works/index.html', page({
  title: `Works | ${site.name}`, desc: `Projects by ${site.name}: post-quantum identity, authentication and crypto-agile SDK design.`, depth: 1, active: 'works', archive: true, path: 'works/',
  main: `${crumbs('../', ['works', 'Works'])}<h1 class="archive-heading">Works</h1>${works.map(w => card(w, 'works', '../', false, true)).join('')}`,
}));
for (const w of works) {
  const repoUrl = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/i.test(w.link || '') ? w.link : '';
  if (!repoUrl) fail(`works/${w.file}: expected a GitHub repository URL in "link"`);
  write(`works/${w.slug}/index.html`, page({
    title: `${w.title} | ${site.name}`, desc: w.summary, depth: 2, active: 'works', path: `works/${w.slug}/`, aside: side('../../', true, false),
    image: ogFor(w.image), imageAlt: w.imageAlt,
    main:
`${crumbs('../../', ['works', 'Works'], w.title, `../../works/${w.slug}/`)}<h1 class="work-title">${esc(w.title)}</h1><div class="meta">${[['TECH STACK', w.stack], ['PROJECT TYPE', w.type], ['DURATION', w.duration], ['IMPACT', w.impact]].filter(x => x[1]).map(x => `<p><b>${x[0]} :</b> <span>${esc(x[1])}</span></p>`).join('')}</div>
<p class="links"><a class="btn" href="${esc(repoUrl)}" rel="noopener noreferrer">GITHUB REPOSITORY</a></p>${w.image ? `<img class="cover" src="${esc(w.image)}" alt="${esc(w.imageAlt || `${w.title} preview`)}" decoding="async">` : ''}
<p class="lead">${esc(w.summary)}</p><div class="prose">${md(w.body)}</div>`,
  }));
}

// ---------- Blogs ----------
const chipBar = (b, active) => `<div class="chips" role="navigation" aria-label="Blog categories"><a class="btn sm chip${active == null ? ' active' : ''}" href="${b}blogs/"${active == null ? ' aria-current="page"' : ''}>ALL (${blogs.length})</a>${cats.map(x => `<a class="btn sm chip${active === x.slug ? ' active' : ''}" href="${b}blogs/category/${x.slug}/"${active === x.slug ? ' aria-current="page"' : ''}>${esc(x.name.toUpperCase())} (${x.posts.length})</a>`).join('')}</div>`;
const blogList = (b, items, active) => `${chipBar(b, active)}<div>${items.map(x => card(x, 'blogs', b, true, true)).join('') || '<p>No posts yet.</p>'}</div>`;
write('blogs/index.html', page({
  title: `Blogs | ${site.name}`, desc: `Writing on post-quantum cryptography, identity, revocation and honest security engineering by ${site.name}.`, depth: 1, active: 'blogs', archive: true, path: 'blogs/',
  main: `${crumbs('../', ['blogs', 'Blogs'])}<h1 class="archive-heading">Blogs</h1>${blogList('../', blogs, null)}`,
}));
for (const [categoryIndex, x] of cats.entries()) {
  write(`blogs/category/${x.slug}/index.html`, page({
    title: `${x.name} | Blogs | ${site.name}`, desc: x.desc || `${x.name} posts by ${site.name}.`, depth: 3, active: 'blogs', archive: true, path: `blogs/category/${x.slug}/`,
    main: `${crumbs('../../../', ['blogs', 'Blogs'], `No. ${categoryIndex + 1}`)}<h1 class="archive-heading">${esc(x.name)}</h1>${x.desc ? `<p class="cat-desc">${esc(x.desc)}</p>` : ''}${blogList('../../../', x.posts, x.slug)}`,
  }));
}
for (const [index, x] of blogs.entries()) {
  const newer = blogs[index - 1], older = blogs[index + 1];
  write(`blogs/${x.slug}/index.html`, page({
    title: `${x.title} | ${site.name}`, desc: x.summary, depth: 2, active: 'blogs', path: `blogs/${x.slug}/`, aside: side('../../', false, true), type: 'article',
    image: ogFor(x.image), imageAlt: x.imageAlt,
    jsonld: ld({
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: x.title, description: x.summary, datePublished: x.date, dateModified: x.date,
      author: { '@type': 'Person', name: site.name, url: SITE + '/' }, mainEntityOfPage: abs(`/blogs/${x.slug}/`), image: ogFor(x.image) || ogDefault,
      ...(x.category ? { articleSection: x.category } : {}),
    }),
    main:
`${crumbs('../../', ['blogs', 'Blogs'], `No. ${String(x.order || index + 1).padStart(2, '0')}`)}<h1 class="blog-title">${esc(x.title)}</h1>${x.category ? `<p class="blog-category">CATEGORY: <a href="../category/${slugify(x.category)}/">${esc(x.category)}</a></p>` : ''}<p class="date"><time datetime="${esc(x.date)}">${esc(x.date)}</time> · ${readMins(x.body)} min read</p>${x.image ? `<img class="cover" src="${esc(x.image)}" alt="${esc(x.imageAlt || `${x.title} cover`)}" decoding="async">` : ''}<div class="prose">${md(x.body)}</div>
<div class="post-nav" role="navigation" aria-label="More posts">${older ? `<a class="btn sm" href="../${older.slug}/" rel="prev">&lt; OLDER POST</a>` : '<span></span>'}${newer ? `<a class="btn sm" href="../${newer.slug}/" rel="next">NEWER POST &gt;</a>` : '<span></span>'}</div>`,
  }));
}

// ---------- Contact ----------
write('contact/index.html', page({
  title: `Contact | ${site.name}`, desc: `Get in touch with ${site.name} about security engineering roles, post-quantum cryptography and collaboration.`, depth: 1, active: 'contact', path: 'contact/', extraWrapClass: 'contact-wrap',
  main:
`${crumbs('../', ['contact', 'Contact'], null, null, 'contact-crumb')}<h1 class="sr-only">Contact</h1>
<form id="cf" ${site.formAction ? `action="${esc(site.formAction)}" method="POST"` : `data-mailto="${esc(c.email)}"`}>
<label>Name<input name="name" autocomplete="name" required></label><label>Email<input name="email" type="email" autocomplete="email" required></label><label>Message<textarea name="message" rows="6" required></textarea></label>${site.formAction ? '<input class="hp" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">' : ''}<button class="btn" type="submit">SUBMIT!</button></form>
<noscript><p>The form needs JavaScript. Email me directly at <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>.</p></noscript>
<h2 class="gap">Connect</h2><p><strong>Email :</strong> <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p><p><strong>GitHub :</strong> <a href="${esc(c.github)}" rel="noopener noreferrer">${esc(c.github.replace('https://', ''))}</a></p><p><strong>LinkedIn :</strong> <a href="${esc(c.linkedin)}" rel="noopener noreferrer">${esc(c.linkedin.replace('https://www.', ''))}</a></p>${c.website ? `<p><strong>Project :</strong> <a href="${esc(c.website)}" rel="noopener noreferrer">${esc(c.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a></p>` : ''}${resumeFile ? `<p><strong>Resume :</strong> ${resumeBtn('')}</p>` : ''}${c.phone ? `<p><strong>Phone :</strong> <a href="tel:${esc(c.phone.replace(/\s/g, ''))}">${esc(c.phone)}</a></p>` : ''}<p><strong>Location :</strong> ${esc(c.location)}</p>`,
}));

// ---------- 404 (absolute base so it works at any depth) ----------
write('404.html', page({
  title: `Page not found | ${site.name}`, desc: 'This page does not exist.', base: '/', noindex: true, path: '404.html',
  main: `<h1>404: Not found</h1><p>That page doesn't exist or has moved.</p><p class="links"><a class="btn" href="/">HOME</a><a class="btn" href="/works/">WORKS</a><a class="btn" href="/blogs/">BLOGS</a></p>`,
}));

// ---------- static, admin, generated files ----------
fs.cpSync(R('static'), dist(), { recursive: true });
if (fs.existsSync(R('admin'))) fs.cpSync(R('admin'), dist('admin'), { recursive: true });
fs.writeFileSync(dist('.nojekyll'), '');


const urls = [['', buildISO.slice(0, 10)], ['works/', buildISO.slice(0, 10)], ['blogs/', blogs[0]?.date || buildISO.slice(0, 10)], ['contact/', buildISO.slice(0, 10)],
  ...works.map(w => [`works/${w.slug}/`, buildISO.slice(0, 10)]), ...blogs.map(x => [`blogs/${x.slug}/`, x.date]), ...cats.map(x => [`blogs/category/${x.slug}/`, x.posts[0].date])];
fs.writeFileSync(dist('sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, m]) => `  <url><loc>${xml(abs('/' + u))}</loc><lastmod>${m}</lastmod></url>`).join('\n')}\n</urlset>\n`);
const plain = s => s.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/```\w*/g, ' ').replace(/[`*#>]/g, '').replace(/^\s*(?:[-]|\d+[.)])\s+/gm, ' ').replace(/\s+/g, ' ').trim();
fs.writeFileSync(dist('search-index.json'), JSON.stringify([
  ...works.map(x => ({ k: 'WORK', s: x.slug, t: x.title, c: x.type || 'PROJECT', d: x.summary, b: plain(x.body), u: `/works/${x.slug}/` })),
  ...blogs.map(x => ({ k: 'BLOG', s: x.slug, t: x.title, c: x.category || '', d: x.summary, b: plain(x.body), u: `/blogs/${x.slug}/` }))
]));
fs.writeFileSync(dist('robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITE}/sitemap.xml\n`);

const rfc822 = d => new Date(d + 'T00:00:00Z').toUTCString();
fs.writeFileSync(dist('feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>${xml(site.name)} | Blog</title><link>${xml(abs('/blogs/'))}</link><description>${xml(site.description)}</description><language>en</language>
<atom:link href="${xml(abs('/feed.xml'))}" rel="self" type="application/rss+xml"/>
${blogs.map(x => `<item><title>${xml(x.title)}</title><link>${xml(abs(`/blogs/${x.slug}/`))}</link><guid isPermaLink="true">${xml(abs(`/blogs/${x.slug}/`))}</guid><pubDate>${rfc822(x.date)}</pubDate>${x.category ? `<category>${xml(x.category)}</category>` : ''}<description>${xml(x.summary)}</description></item>`).join('\n')}
</channel></rss>\n`);

const expires = new Date(Date.now() + 365 * 864e5).toISOString();
fs.mkdirSync(dist('.well-known'), { recursive: true });
fs.writeFileSync(dist('.well-known/security.txt'), `Contact: mailto:${c.email}\nExpires: ${expires}\nPreferred-Languages: en\nCanonical: ${SITE}/.well-known/security.txt\n`);

// ---------- post-build checks ----------
function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? htmlFiles(path.join(dir, e.name)) : e.name.endsWith('.html') ? [path.join(dir, e.name)] : []);
}
for (const file of htmlFiles(dist())) {
  const rel = path.relative(dist(), file);
  if (rel.startsWith('admin')) continue; // third-party CMS shell, covered by its own CSP
  const html = fs.readFileSync(file, 'utf8');
  // 1. internal links and assets must exist
  for (const m of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
    let u = m[1].replace(/&amp;/g, '&');
    if (!u || /^(https?:|mailto:|tel:|data:|#)/i.test(u)) continue;
    u = u.split('#')[0].split('?')[0];
    const target = u.startsWith('/') ? path.join(dist(), u) : path.resolve(path.dirname(file), u);
    const ok = fs.existsSync(target) && (fs.statSync(target).isFile() || fs.existsSync(path.join(target, 'index.html')));
    if (!ok) fail(`${rel}: broken link/asset "${m[1]}"`);
  }
  // 2. CSP-safe markup: no inline scripts, <style> blocks or style attributes
  if (/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>/i.test(html)) fail(`${rel}: inline <script> would be blocked by the CSP`);
  if (/<style[\s>]/i.test(html) || /\sstyle="/i.test(html)) fail(`${rel}: inline style would be blocked by the CSP`);
  // 3. accessibility basics
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) if (!/\balt=/.test(m[0])) fail(`${rel}: <img> without alt: ${m[0].slice(0, 80)}`);
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) fail(`${rel}: expected exactly one <h1>, found ${h1s}`);
}

if (errors.length) {
  console.error(`\nBuild FAILED with ${errors.length} problem(s):\n` + errors.map(e => ' - ' + e).join('\n'));
  process.exit(1);
}
console.log(`Built ${works.length} works, ${blogs.length} blogs -> dist/ (all checks passed)`);
