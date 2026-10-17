// Dependency-free static portfolio generator. Run: npm run build -> dist/
import fs from 'node:fs';
import path from 'node:path';

const R = (...parts) => path.join(process.cwd(), ...parts);
const esc = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
fs.rmSync(R('dist'), { recursive: true, force: true });

function scalar(value) {
  const text = String(value ?? '').trim();
  if (text.startsWith('"')) {
    try { return JSON.parse(text); } catch { return text.slice(1, -1); }
  }
  if (text.startsWith("'") && text.endsWith("'")) return text.slice(1, -1).replace(/''/g, "'");
  return text;
}

function inl(value) {
  const code = [];
  let text = esc(value).replace(/`([^`]+)`/g, (_, part) => {
    const token = `\u0000${code.length}\u0000`;
    code.push(`<code>${part}</code>`);
    return token;
  });
  text = text
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return text.replace(/\u0000(\d+)\u0000/g, (_, index) => code[Number(index)]);
}

function md(markdown) {
  const lines = String(markdown ?? '').split(/\r?\n/);
  const output = [];
  let paragraph = [];
  let listType = '';
  let listItems = [];
  let quote = [];
  let codeLines = null;
  let codeLang = '';

  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${inl(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (listItems.length) output.push(`<${listType}>${listItems.map(item => `<li>${inl(item)}</li>`).join('')}</${listType}>`);
    listType = '';
    listItems = [];
  };
  const flushQuote = () => {
    if (quote.length) output.push(`<blockquote>${quote.map(line => `<p>${inl(line)}</p>`).join('')}</blockquote>`);
    quote = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (codeLines) {
      if (/^\s*```/.test(line)) {
        output.push(`<pre><code${codeLang ? ` class="language-${esc(codeLang)}"` : ''}>${esc(codeLines.join('\n'))}</code></pre>`);
        codeLines = null;
        codeLang = '';
      } else codeLines.push(line);
      continue;
    }
    const fence = line.match(/^\s*```\s*([\w-]*)/);
    if (fence) {
      flushParagraph(); flushList(); flushQuote();
      codeLines = []; codeLang = fence[1];
      continue;
    }
    if (!line.trim()) {
      flushParagraph(); flushList(); flushQuote();
      continue;
    }
    if (/^\s*([-*_])\1\1+\s*$/.test(line)) {
      flushParagraph(); flushList(); flushQuote(); output.push('<hr>');
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph(); flushList(); flushQuote();
      const level = Math.min(3, heading[1].length + 1);
      output.push(`<h${level}>${inl(heading[2])}</h${level}>`);
      continue;
    }
    const standaloneStrong = line.match(/^\*\*(.+)\*\*$/);
    if (standaloneStrong) {
      flushParagraph(); flushList(); flushQuote();
      output.push(`<h3>${inl(standaloneStrong[1])}</h3>`);
      continue;
    }
    const quoteLine = line.match(/^>\s?(.*)$/);
    if (quoteLine) {
      flushParagraph(); flushList(); quote.push(quoteLine[1]);
      continue;
    }
    const bullet = line.match(/^\s*[-*+]\s+(.+)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (bullet || numbered) {
      flushParagraph(); flushQuote();
      const nextType = numbered ? 'ol' : 'ul';
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((bullet || numbered)[1]);
      continue;
    }
    flushList(); flushQuote(); paragraph.push(line.trim());
  }
  flushParagraph(); flushList(); flushQuote();
  if (codeLines) output.push(`<pre><code>${esc(codeLines.join('\n'))}</code></pre>`);
  return output.join('\n');
}

function parse(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const data = { slug: path.basename(file, '.md'), body: match ? match[2] : text };
  if (match) {
    for (const line of match[1].split(/\r?\n/)) {
      const field = line.match(/^(\w+):\s*(.*)$/);
      if (field) data[field[1]] = scalar(field[2]);
    }
  }
  return data;
}

const load = folder => fs.existsSync(R('content', folder))
  ? fs.readdirSync(R('content', folder)).filter(file => file.endsWith('.md')).map(file => parse(R('content', folder, file)))
  : [];
const site = JSON.parse(fs.readFileSync(R('content/site.json'), 'utf8'));
const works = load('works').sort((a, b) => (+a.order || 999) - (+b.order || 999));
const blogs = load('blogs').sort((a, b) => String(b.date).localeCompare(String(a.date)) || (+a.order || 999) - (+b.order || 999));
const write = (file, html) => {
  fs.mkdirSync(path.dirname(R('dist', file)), { recursive: true });
  fs.writeFileSync(R('dist', file), html);
};
const fix = (html, base) => html.replace(/(src|href)="\/(?!\/)/g, `$1="${base}`);
const initials = value => {
  const words = String(value ?? '').replace(/[\"'“”‘’]/g, '').trim().split(/\s+/).filter(Boolean);
  return words.length < 2 ? (words[0] ?? '').slice(0, 2).toUpperCase() : words.map(word => word[0]).join('').slice(0, 2).toUpperCase();
};
const hue = value => [...String(value ?? '')].reduce((total, char) => total + char.charCodeAt(0), 0) % 360;
const thumb = (item, small = false) => item.image
  ? `<img class="thumb${small ? ' s' : ''}" src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy">`
  : `<span class="thumb${small ? ' s' : ''}" style="background:hsl(${hue(item.title)} 30% 48%)" aria-hidden="true">${esc(initials(item.mark || item.title))}</span>`;
const card = (item, kind, base, small = false) => `<a class="card${small ? ' blog-card' : ''}" href="${base}${kind}/${esc(item.slug)}/">${thumb(item, small)}<span class="ct"><span class="ctitle${small ? ' sm' : ''}">${esc(item.title)}</span>${item.type ? `<span class="tag">${esc(item.type)}</span>` : ''}</span><span class="chev" aria-hidden="true">›</span></a>`;
const side = (base, showWorks = true, showBlogs = true) =>
  (showWorks ? `<section aria-labelledby="latest-work"><h2 id="latest-work">Latest Work</h2>${works.slice(0, 4).map(item => card(item, 'works', base)).join('')}<a class="btn sm" href="${base}works/">All Works ›</a></section>` : '') +
  (showBlogs && blogs.length ? `<section aria-labelledby="latest-blogs"><h2 class="gap" id="latest-blogs">Latest Blogs</h2>${blogs.slice(0, 4).map(item => card(item, 'blogs', base, true)).join('')}<a class="btn sm" href="${base}blogs/">All Blogs ›</a></section>` : '');

function page({ title, desc, depth = 0, main, aside = '' }) {
  const base = '../'.repeat(depth) || './';
  const contact = site.contact;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc || site.description)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🛡️%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Fragment+Mono:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${base}style.css"></head><body>
<header id="site-header"><div class="bar"><button class="btn menu-toggle" id="mb" aria-expanded="false" aria-controls="nav">MENU</button></div>
<nav id="nav" hidden aria-label="Main navigation"><a class="btn nav-link" href="${base}">HOME/ABOUT</a><a class="btn nav-link" href="${base}works/">WORKS</a><a class="btn nav-link" href="${base}blogs/">BLOGS</a><a class="btn nav-link" href="${base}contact/">CONTACT</a></nav></header>
<div class="wrap"><main>${main}</main>${aside ? `<aside>${aside}</aside>` : ''}</div>
<footer><span>${esc(contact.location)}</span><span>© ${new Date().getFullYear()} ${esc(site.name)}</span><span><a href="${esc(contact.github)}">GitHub</a> · <a href="${esc(contact.linkedin)}">LinkedIn</a></span></footer>
<script>const menuButton=document.getElementById('mb'),menu=document.getElementById('nav'),siteHeader=document.getElementById('site-header');menuButton.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;siteHeader.classList.toggle('menu-open',open);menuButton.textContent=open?'CLOSE':'MENU';menuButton.setAttribute('aria-expanded',String(open))});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){menu.hidden=true;siteHeader.classList.remove('menu-open');menuButton.textContent='MENU';menuButton.setAttribute('aria-expanded','false');menuButton.focus()}})</script></body></html>`;
  return fix(html, base);
}
const crumbs = (base, section, current = '') => `<p class="crumb"><a href="${base}">Home</a> › <a href="${base}${section.toLowerCase()}/">${esc(section)}</a>${current ? ` › ${esc(current)}` : ''}</p>`;

write('index.html', page({
  title: `${site.name} | ${site.role}`,
  main: `<div class="hero"><img class="photo" src="${esc(site.photo)}" alt="${esc(site.name)}"><div class="hero-copy"><div class="name">${esc(site.name)}</div><div class="role">${esc(site.role)}</div><div class="location">${esc(site.contact.location)}</div></div></div>
<h2>About Me</h2>${site.about.map(paragraph => `<p>${inl(paragraph)}</p>`).join('')}
<h2>${esc(site.skillsTitle)}</h2>${site.skills.map(item => `<p><strong>${esc(item.label)}:</strong> ${esc(item.value)}</p>`).join('')}
<h2>${esc(site.experienceTitle)}</h2>${site.experience.map(item => `<p class="exp"><strong>${esc(item.title)} | ${esc(item.org)}</strong>${item.desc ? `<br>${esc(item.desc)}` : ''}</p>`).join('')}
<h2>${esc(site.extrasTitle)}</h2>${site.extras.map(item => `<p><strong>${esc(item.label)}:</strong> ${esc(item.text)}</p>`).join('')}`,
  aside: side('./'),
}));

write('works/index.html', page({
  title: `Works | ${site.name}`, depth: 1,
  main: `${crumbs('../', 'Works')}<h1>Works</h1><div class="listing">${works.map(item => card(item, 'works', '../')).join('')}</div>`,
  aside: side('../', false, true),
}));
for (const item of works) {
  const buttons = [
    item.link ? `<a class="btn action-link" href="${esc(item.link)}" target="_blank" rel="noopener">${String(item.link).includes('github.com/') ? 'VIEW REPO' : 'VISIT SITE'}</a>` : '',
    item.site ? `<a class="btn action-link" href="${esc(item.site)}" target="_blank" rel="noopener">PROJECT SITE</a>` : '',
  ].filter(Boolean).join(' ');
  const metadata = [['TECH STACK', item.stack], ['PROJECT TYPE', item.type], ['DURATION', item.duration], ['IMPACT', item.impact]]
    .filter(([, value]) => value)
    .map(([label, value]) => `<p><b>${label}:</b> <span>${esc(value)}</span></p>`).join('');
  write(`works/${item.slug}/index.html`, page({
    title: `${item.title} | ${site.name}`, desc: item.summary, depth: 2,
    main: `${crumbs('../../', 'Works', item.title)}<h1>${esc(item.title)}</h1>${metadata ? `<div class="meta">${metadata}</div>` : ''}${buttons ? `<div class="actions">${buttons}</div>` : ''}${item.image ? `<img class="cover" src="${esc(item.image)}" alt="${esc(item.title)}">` : ''}<p class="lead">${esc(item.summary)}</p><div class="prose">${md(item.body)}</div>`,
    aside: side('../../', true, false),
  }));
}

write('blogs/index.html', page({
  title: `Blogs | ${site.name}`, depth: 1,
  main: `${crumbs('../', 'Blogs')}<h1>Blogs</h1><div class="listing">${blogs.map(item => card(item, 'blogs', '../', true)).join('') || '<p>No posts yet.</p>'}</div>`,
  aside: side('../', true, false),
}));
for (const item of blogs) {
  write(`blogs/${item.slug}/index.html`, page({
    title: `${item.title} | ${site.name}`, desc: item.summary, depth: 2,
    main: `${crumbs('../../', 'Blogs', item.title)}<h1>${esc(item.title)}</h1><p class="date">${esc(item.date)}</p><div class="prose">${md(item.body)}</div>`,
    aside: side('../../', false, true),
  }));
}

const contact = site.contact;
write('contact/index.html', page({
  title: `Contact | ${site.name}`, depth: 1,
  main: `<p class="crumb"><a href="../">Home</a> › Contact</p><h1>Contact</h1>
<form id="cf" ${site.formAction ? `action="${esc(site.formAction)}" method="POST"` : ''}><label>Name<input name="name" required></label><label>Email<input name="email" type="email" required></label><label>Message<textarea name="message" rows="5" required></textarea></label><button class="btn" type="submit">SEND MESSAGE</button></form>
<h2 id="connect" class="gap">Connect</h2><p><strong>Email:</strong> <a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></p><p><strong>GitHub:</strong> <a href="${esc(contact.github)}">${esc(contact.github.replace('https://', ''))}</a></p><p><strong>LinkedIn:</strong> <a href="${esc(contact.linkedin)}">${esc(contact.linkedin.replace('https://www.', ''))}</a></p><p><strong>Phone:</strong> <a href="tel:${esc(contact.phone.replace(/\s/g, ''))}">${esc(contact.phone)}</a></p><p><strong>Location:</strong> ${esc(contact.location)}</p>`,
}));
if (!site.formAction) {
  const contactHtml = fs.readFileSync(R('dist/contact/index.html'), 'utf8');
  fs.writeFileSync(R('dist/contact/index.html'), contactHtml.replace('</body>', `<script>document.getElementById('cf').addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget;location.href='mailto:${esc(contact.email)}?subject='+encodeURIComponent('Portfolio message from '+form.name.value)+'&body='+encodeURIComponent(form.message.value+'\\n\\n'+form.name.value+' <'+form.email.value+'>')})</script></body>`));
}

fs.cpSync(R('static'), R('dist'), { recursive: true });
if (fs.existsSync(R('admin'))) fs.cpSync(R('admin'), R('dist/admin'), { recursive: true });
fs.writeFileSync(R('dist/.nojekyll'), '');
console.log(`Built ${works.length} projects and ${blogs.length} blogs -> dist/`);
