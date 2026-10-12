// Zero-dependency static site generator. Run: node build.mjs  ->  dist/
import fs from 'node:fs';
import path from 'node:path';
const R = (...p) => path.join(process.cwd(), ...p);
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inl = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>')
  .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
function md(t) {
  const out = []; let list = false;
  for (const raw of t.split(/\r?\n/)) {
    const l = raw.trimEnd(); let m;
    if ((m = l.match(/^[-*] (.*)/))) { if (!list) { list = true; out.push('<ul>'); } out.push('<li>' + inl(m[1]) + '</li>'); continue; }
    if (list) { out.push('</ul>'); list = false; }
    if ((m = l.match(/^(#{1,3}) (.*)/))) { const n = m[1].length + 1; out.push(`<h${n}>${inl(m[2])}</h${n}>`); }
    else if (l) out.push('<p>' + inl(l) + '</p>');
  }
  if (list) out.push('</ul>');
  return out.join('\n');
}
function parse(file) {
  const t = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''); const m = t.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const data = { slug: path.basename(file, '.md'), body: m ? m[2] : t };
  if (m) for (const line of m[1].split(/\r?\n/)) {
    const k = line.match(/^(\w+):\s*(.*)$/);
    if (k) {
      let value = k[2];
      if (value.startsWith('"')) { try { value = JSON.parse(value); } catch {} }
      else value = value.replace(/^'|'$/g, '');
      data[k[1]] = value;
    }
  }
  return data;
}
const load = dir => fs.existsSync(R('content', dir)) ? fs.readdirSync(R('content', dir)).filter(f => f.endsWith('.md')).map(f => parse(R('content', dir, f))) : [];
const site = JSON.parse(fs.readFileSync(R('content/site.json'), 'utf8'));
const works = load('works').sort((a, b) => (+a.order || 99) - (+b.order || 99));
const blogs = load('blogs').sort((a, b) => String(b.date).localeCompare(String(a.date)));

const write = (p, html) => { fs.mkdirSync(path.dirname(R('dist', p)), { recursive: true }); fs.writeFileSync(R('dist', p), html); };
const fix = (html, b) => html.replace(/(src|href)="\/(?!\/)/g, `$1="${b}`);
const initials = s => s.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const hue = s => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
const thumb = (it, cls) => it.image ? `<img class="thumb ${cls}" src="${esc(it.image)}" alt="">` : `<span class="thumb ${cls}" style="background:hsl(${hue(it.title)} 35% 55%)">${esc(initials(it.title))}</span>`;
const card = (it, kind, b, small, excerpt = false) => `<a class="card ${kind === 'blogs' ? 'blog-card' : 'work-card'}" href="${b}${kind}/${it.slug}/">${thumb(it, small ? 's' : '')}<span class="ct"><span class="${small ? 'ctitle sm' : 'ctitle'}">${esc(it.title)}</span>${it.type ? `<span class="tag">${esc(it.type)}</span>` : ''}${excerpt && kind === 'works' && (it.impact || it.summary) ? `<span class="impact">${esc(it.impact || it.summary)}</span>` : excerpt && it.summary ? `<span class="excerpt">${esc(it.summary)}</span>` : ''}</span><span class="chev">&gt;</span></a>`;
const side = (b, showW = true, showB = true) =>
  (showW ? `<h2>Latest Work</h2>${works.slice(0, 4).map(w => card(w, 'works', b)).join('')}<a class="btn sm" href="${b}works/">All Works &gt;</a>` : '') +
  (showB && blogs.length ? `<h2 class="gap">Latest Blogs</h2>${blogs.slice(0, 4).map(x => card(x, 'blogs', b, true)).join('')}<a class="btn sm" href="${b}blogs/">All Blogs &gt;</a>` : '');

function page({ title, desc, depth, main, aside, archive = false }) {
  const b = '../'.repeat(depth) || './';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc || site.description)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🛡️%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Fragment+Mono:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${b}style.css"></head><body>
<header><div class="bar"><button class="btn" id="mb" aria-expanded="false" aria-controls="nav">MENU</button></div>
<nav id="nav" hidden><a class="btn" href="${b}">HOME/ABOUT</a><a class="btn" href="${b}works/">WORKS</a><a class="btn" href="${b}blogs/">BLOGS</a><a class="btn" href="${b}contact/">CONTACT</a></nav></header>
<div class="wrap${archive ? ' archive-wrap' : ''}"><main class="${archive ? 'archive' : ''}">${main}</main>${!archive && aside ? `<aside>${aside}</aside>` : ''}</div>
<footer><div class="visitor" aria-label="Decorative visitor number; not a tracked visit count">VISITOR NO. : <strong id="visitor-number">0000</strong></div><time class="clock" id="clock" aria-label="Current local time"></time></footer>
<script>const mb=document.getElementById('mb'),nv=document.getElementById('nav');mb.onclick=()=>{const o=nv.hidden;nv.hidden=!o;mb.textContent=o?'CLOSE':'MENU';mb.setAttribute('aria-expanded',o)};const vn=document.getElementById('visitor-number');let number=sessionStorage.getItem('retro-visitor-number');if(!number){number=String(Math.floor(1000+Math.random()*9000));sessionStorage.setItem('retro-visitor-number',number)}vn.textContent=number;const clock=document.getElementById('clock');function tick(){clock.textContent=new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',second:'2-digit'}).format(new Date())}tick();setInterval(tick,1000)</script></body></html>`;
  return fix(html, b);
}
const crumbs = (b, a, cur, currentHref, extraClass = '') => {
  const className = extraClass ? `crumb ${extraClass}` : 'crumb';
  return `<div class="${className}"><a href="${b}">Home</a><span aria-hidden="true">&gt;</span><a href="${b}${a[0]}/"${cur ? '' : ' aria-current="page"'}>${a[1]}</a>${cur ? `<span aria-hidden="true">&gt;</span>${currentHref ? `<a class="crumb-current" href="${currentHref}" aria-current="page">${esc(cur)}</a>` : `<span class="crumb-current" aria-current="page">${esc(cur)}</span>`}` : ''}</div>`;
};

// Home
write('index.html', page({ title: `${site.name} | ${site.role} Portfolio`, depth: 0, aside: side('./'), main:
`<div class="hero"><img class="photo" src="${esc(site.photo)}" alt="${esc(site.name)}"><div><div class="name">${esc(site.name)}</div><div class="role">${esc(site.role)}</div></div></div>
<h2>About Me</h2>${site.about.map(p => `<p>${inl(p)}</p>`).join('')}
<h2>${esc(site.skillsTitle)}</h2>${site.skills.map(s => `<p><strong>${esc(s.label)}:</strong> ${esc(s.value)}</p>`).join('')}
<h2>${esc(site.experienceTitle)}</h2>${site.experience.map(e => `<p class="exp"><strong>${esc(e.title)} | ${esc(e.org)}</strong><br>${esc(e.desc)}</p>`).join('')}
<h2>${esc(site.extrasTitle)}</h2>${site.extras.map(e => `<p><strong>${esc(e.label)}:</strong> ${esc(e.text)}</p>`).join('')}` }));

// Works
write('works/index.html', page({ title: `Works | ${site.name}`, depth: 1, archive: true, main: `${crumbs('../', ['works', 'Works'])}${works.map(w => card(w, 'works', '../', false, true)).join('')}` }));
for (const w of works) write(`works/${w.slug}/index.html`, page({ title: `${w.title} | ${site.name}`, desc: w.summary, depth: 2, aside: side('../../', true, false), main:
`${crumbs('../../', ['works', 'Works'], w.title, `../../works/${w.slug}/`)}<div class="meta">${[['TECH STACK', w.stack], ['PROJECT TYPE', w.type], ['DURATION', w.duration], ['IMPACT', w.impact]].filter(x => x[1]).map(x => `<p><b>${x[0]} :</b> <span>${esc(x[1])}</span></p>`).join('')}</div>
${w.link ? `<a class="btn" href="${esc(w.link)}">VISIT SITE</a>` : ''}${w.image ? `<img class="cover" src="${esc(w.image)}" alt="">` : ''}
<p class="lead">${esc(w.summary)}</p><div class="prose">${md(w.body)}</div>` }));

// Blogs
write('blogs/index.html', page({ title: `Blogs | ${site.name}`, depth: 1, archive: true, main: `${crumbs('../', ['blogs', 'Blogs'])}${blogs.map(x => card(x, 'blogs', '../', true, true)).join('') || '<p>No posts yet.</p>'}` }));
for (const [index, x] of blogs.entries()) write(`blogs/${x.slug}/index.html`, page({ title: `${x.title} | ${site.name}`, desc: x.summary, depth: 2, aside: side('../../', false, true), main:
`${crumbs('../../', ['blogs', 'Blogs'], `No. ${String(x.order || index + 1).padStart(2, '0')}`)}<h1 class="blog-title">${esc(x.title)}</h1><p class="date">${esc(x.date)}</p>${x.image ? `<img class="cover" src="${esc(x.image)}" alt="">` : ''}<div class="prose">${md(x.body)}</div>` }));

// Contact
const c = site.contact;
write('contact/index.html', page({ title: `Contact | ${site.name}`, depth: 1, main:
`${crumbs('../', ['contact', 'Contact'], null, null, 'contact-crumb')}
<form id="cf" ${site.formAction ? `action="${esc(site.formAction)}" method="POST"` : ''}><label>Name<input name="name" required></label><label>Email<input name="email" type="email" required></label><label>Message<textarea name="message" rows="6" required></textarea></label><button class="btn" type="submit">SUBMIT!</button></form>
<script>${site.formAction ? '' : `document.getElementById('cf').onsubmit=e=>{e.preventDefault();const f=e.target;location.href='mailto:${c.email}?subject='+encodeURIComponent('Portfolio message from '+f.name.value)+'&body='+encodeURIComponent(f.message.value+'\\n\\n'+f.name.value+' <'+f.email.value+'>')}`}</script>
<h2 class="gap">Connect</h2><p><strong>Email :</strong> <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p><p><strong>GitHub :</strong> <a href="${esc(c.github)}">${esc(c.github.replace('https://', ''))}</a></p><p><strong>LinkedIn :</strong> <a href="${esc(c.linkedin)}">${esc(c.linkedin.replace('https://www.', ''))}</a></p><p><strong>Phone :</strong> <a href="tel:${esc(c.phone.replace(/\s/g, ''))}">${esc(c.phone)}</a></p><p><strong>Location :</strong> ${esc(c.location)}</p>` }));

// Static + admin
fs.cpSync(R('static'), R('dist'), { recursive: true });
if (fs.existsSync(R('admin'))) fs.cpSync(R('admin'), R('dist/admin'), { recursive: true });
fs.writeFileSync(R('dist/.nojekyll'), '');
console.log(`Built ${works.length} works, ${blogs.length} blogs -> dist/`);
