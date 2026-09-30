// Builds the static website into dist/: npm run build
import { mkdirSync, rmSync, writeFileSync, copyFileSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { Marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import cpp from 'highlight.js/lib/languages/cpp';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import php from 'highlight.js/lib/languages/php';
import { ROOT, CODE_LANGS, REPO_URL, loadLanguages, loadStructures, translationState } from './lib.mjs';

hljs.registerLanguage('python', python);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('java', java);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('php', php);

// PDSA_DIST lets parallel builds (for example one per contributor preview) write to separate folders.
const DIST = process.env.PDSA_DIST ? resolve(process.env.PDSA_DIST) : join(ROOT, 'dist');
const PYODIDE_MB = 12;
const FONTS = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Baloo+Tamma+2:wght@500;600;700;800&family=Baloo+Thambi+2:wght@500;600;700;800&family=Caveat:wght@600;700&family=Hind:wght@400;500;600&family=Hind+Madurai:wght@400;500;600&family=Hind+Mysuru:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap';

// ---------------------------------------------------------------- load + validate
const languages = loadLanguages();
const en = languages.find((l) => l.code === 'en');
const problems = [];
for (const lang of languages) {
  for (const key of Object.keys(en)) if (!(key in lang)) problems.push(`site/i18n/${lang.code}.json: missing "${key}"`);
}
const { structures, errors, warnings } = loadStructures(languages);
problems.push(...errors);
warnings.forEach((w) => console.warn(`warning: ${w}`));
if (problems.length) {
  problems.forEach((p) => console.error(`error: ${p}`));
  console.error(`\nBuild stopped: ${problems.length} problem(s).`);
  process.exit(1);
}

// ---------------------------------------------------------------- helpers
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fill = (s, vars = {}) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
const jsonForScript = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
const slug = (s) => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
const tilt = (i, set) => `${set[i % set.length]}deg`;

function highlight(code, lang) {
  return hljs.getLanguage(lang) ? hljs.highlight(code, { language: lang }).value : esc(code);
}

function makeMarked() {
  const md = new Marked({ gfm: true });
  md.use({
    renderer: {
      code({ text, lang }) {
        const l = (lang || '').trim().split(/\s+/)[0];
        return `<pre class="block"><code class="hljs${l ? ` language-${esc(l)}` : ''}">${highlight(text, l)}</code></pre>\n`;
      },
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        return `<h${depth} id="${esc(slug(inner))}">${inner}</h${depth}>\n`;
      },
    },
  });
  return md;
}

// ---------------------------------------------------------------- drawn bits
const HERO_ART = readFileSync(join(ROOT, 'site', 'art', 'hero.svg'), 'utf8').trim();
const LOGO = `<svg class="logo art" viewBox="0 0 48 48" aria-hidden="true"><g transform="rotate(-7 24 38)"><rect class="s thin fe" x="7" y="31" width="34" height="12" rx="2"/></g><g transform="rotate(5 24 25)"><rect class="s thin fs" x="7" y="19" width="34" height="12" rx="2"/></g><g transform="rotate(-4 24 13)"><rect class="s thin fg" x="7" y="7" width="34" height="12" rx="2"/></g></svg>`;
const SUN = `<svg class="i-sun art" viewBox="0 0 24 24" aria-hidden="true"><circle class="s thin fg" cx="12" cy="12" r="4.5"/><path class="s thin" d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>`;
const MOON = `<svg class="i-moon art" viewBox="0 0 24 24" aria-hidden="true"><path class="s thin fg" d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/></svg>`;
const SQUIGGLE = `<svg class="squiggle" viewBox="0 0 280 16" preserveAspectRatio="none" aria-hidden="true"><path d="M4 10 C 40 2, 70 15, 110 8 S 190 2, 230 9 S 268 12, 276 6" style="fill:none;stroke:var(--red);stroke-width:5;stroke-linecap:round"/></svg>`;
const ARROW = `<svg viewBox="0 0 60 34" aria-hidden="true"><path d="M4 6 C 18 30, 38 32, 54 16 M43 13 l11 3 l-3 11" style="fill:none;stroke:var(--ink);stroke-width:3;stroke-linecap:round;stroke-linejoin:round"/></svg>`;
const FOOT_LINE = `<svg class="foot-line" viewBox="0 0 360 14" preserveAspectRatio="none" aria-hidden="true"><path d="M4 8 C 60 2, 120 13, 180 7 S 300 2, 356 8" style="fill:none;stroke:var(--subtle);stroke-width:3;stroke-linecap:round;stroke-dasharray:1 9"/></svg>`;
const CHECK = `<span class="box"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13 l5 5 L20 6"/></svg></span>`;

function art(s, labels) {
  if (s.illustration) return s.illustration;
  const letter = esc(Array.from(labels.title)[0] || '?');
  return `<svg class="art" viewBox="0 0 320 180" aria-hidden="true"><rect class="s fa" x="110" y="36" width="100" height="100" rx="20" transform="rotate(-4 160 86)"/><text x="160" y="106" text-anchor="middle" font-size="52">${letter}</text></svg>`;
}

function codeTabs(sources, t, { kind, runnable = false }) {
  const bar = CODE_LANGS.map((cl) => `<button type="button" class="tab" data-code="${cl.id}">${cl.label}</button>`).join('');
  const panels = CODE_LANGS.map((cl) => {
    const run = runnable && cl.browser ? `<button type="button" class="run" data-run="${cl.id}">▶ ${esc(t.run)}</button>` : '';
    return `<div class="code-panel" data-code="${cl.id}"><div class="code-tools">${run}<button type="button" class="copy" data-copied="${esc(t.copied)}">${esc(t.copy)}</button></div><pre><code class="hljs language-${cl.hljs}">${highlight(sources[cl.id], cl.hljs)}</code></pre></div>`;
  }).join('');
  return `<div class="code-tabs ${kind}"><div class="tabbar" role="tablist">${bar}</div>${panels}</div>`;
}

const codeStyle = `<style>${CODE_LANGS.map((cl) => `html[data-code="${cl.id}"] .code-panel:not([data-code="${cl.id}"]){display:none}html[data-code="${cl.id}"] .tab[data-code="${cl.id}"],html[data-code="${cl.id}"] .code-pick[data-code="${cl.id}"]{background:var(--lc);color:var(--on-accent);transform:translate(2px,2px);box-shadow:0 0 0 var(--ink)}`).join('')}</style>`;

const headPrefs = `<script>try{var d=document.documentElement,c=localStorage.getItem('pdsa.code'),t=localStorage.getItem('pdsa.theme');if(c)d.setAttribute('data-code',c);if(t)d.setAttribute('data-theme',t)}catch(e){}</script>`;

function page({ lang, depth, title, description, body, scripts = [], langLinks = '' }) {
  const up = '../'.repeat(depth);
  return `<!doctype html>
<html lang="${esc(lang.htmlLang)}" data-code="python">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="icon" href="${up}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="${up}assets/style.css">
${codeStyle}
${headPrefs}
</head>
<body class="lang-${esc(lang.code)}">
<header class="site-head">
  <a class="brand" href="${up}${depth ? `${lang.code}/` : ''}">${LOGO}<span>Polyglot <span class="hl">DSA</span></span></a>
  <div class="head-tools">${langLinks}</div>
  <button type="button" class="theme-toggle" aria-label="${esc(lang.toggleTheme)}" title="${esc(lang.toggleTheme)}">${SUN}${MOON}</button>
</header>
${body}
<footer class="site-foot">
  ${FOOT_LINE}
  <p>${esc(lang.footerLicence)} <a href="${REPO_URL}">GitHub</a></p>
  <p><a href="${REPO_URL}/blob/main/CONTRIBUTING.md">${esc(lang.footerContribute)}</a></p>
</footer>
${scripts.map((s) => `<script src="${up}${s}"></script>`).join('\n')}
</body>
</html>
`;
}

function langSwitcher(current, hrefFor) {
  const links = languages.map((l) => `<a class="lang-pick${l.code === current.code ? ' on' : ''}" lang="${esc(l.htmlLang)}" hreflang="${esc(l.htmlLang)}" href="${hrefFor(l)}"${l.code === current.code ? ' aria-current="page"' : ''}>${esc(l.name)}</a>`).join('');
  return `<nav class="langs" aria-label="${esc(current.chooseLanguage)}">${links}</nav>`;
}

function codePicker(t) {
  return `<div class="code-picker" role="group" aria-label="${esc(t.codeLanguage)}"><span class="lbl">${esc(t.codeLanguage)}</span>${CODE_LANGS.map((cl) => `<button type="button" class="code-pick" data-code="${cl.id}">${cl.label}</button>`).join('')}</div>`;
}

function write(rel, html) {
  const file = join(DIST, rel);
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, html);
}

function copyDir(from, to) {
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from)) {
    const src = join(from, name);
    if (statSync(src).isDirectory()) copyDir(src, join(to, name));
    else copyFileSync(src, join(to, name));
  }
}

// ---------------------------------------------------------------- build
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
copyDir(join(ROOT, 'site', 'assets'), join(DIST, 'assets'));
mkdirSync(join(DIST, 'assets', 'viz'), { recursive: true });
for (const s of structures) copyFileSync(s.vizPath, join(DIST, 'assets', 'viz', `${s.id}.js`));
writeFileSync(join(DIST, '.nojekyll'), '');

const md = makeMarked();
let pages = 0;

// Root: say hello in every language.
write('index.html', page({
  lang: en,
  depth: 0,
  title: `Polyglot DSA · ${languages.map((l) => l.tagline).join(' · ')}`,
  description: en.heroText,
  scripts: ['assets/app.js'],
  body: `<main class="hello wrap">
  <h1 class="hello-title">Polyglot <span class="hl">DSA</span></h1>
  <p class="hello-sub cycle" style="--n:${languages.length}">${languages.map((l, i) => `<span style="--i:${i}" lang="${esc(l.htmlLang)}">${esc(l.tagline)}</span>`).join('')}</p>
  <div class="hello-grid">
    ${languages.map((l, i) => `<a class="pick-card note" style="--i:${i};--tilt:${tilt(i, [-2.5, 1.8, -1.4, 2.2])}" href="${l.code}/" lang="${esc(l.htmlLang)}">
      <span class="tape"></span>
      <span class="greet">${esc(l.greeting)}</span>
      <span class="native">${esc(l.name)}</span>
      <span class="tag">${esc(l.tagline)}</span>
      <span class="go">${esc(l.chooseLanguage)} →</span>
    </a>`).join('\n    ')}
  </div>
</main>`,
}));
pages++;

for (const lang of languages) {
  // Language home: hero + lesson cards.
  const cards = structures.map((s, i) => {
    const l = s.labels[lang.code] || s.labels.en;
    return `<a class="lesson-card accent-${esc(s.meta.accent || 'teal')}" data-lesson="${esc(s.id)}" style="--i:${i};--tilt:${tilt(i, [-1.2, 1, -0.7, 1.3])}" href="${s.id}/">
      <span class="num">${i + 1}</span>
      <span class="stamp">${esc(lang.doneLabel)}</span>
      <span class="card-art">${art(s, l)}</span>
      <span class="card-body">
        <span class="title">${esc(l.title)}</span>
        <span class="summary">${esc(l.summary)}</span>
        <span class="go">${esc(lang.start)}</span>
      </span>
    </a>`;
  }).join('\n');

  write(`${lang.code}/index.html`, page({
    lang,
    depth: 1,
    title: `Polyglot DSA · ${lang.tagline}`,
    description: lang.heroText,
    scripts: ['assets/app.js'],
    langLinks: langSwitcher(lang, (l) => `../${l.code}/`),
    body: `<main class="home wrap">
  <section class="hero">
    <div class="hero-text">
      <h1>${esc(lang.heroTitle)}${SQUIGGLE}</h1>
      <p>${esc(lang.heroText)}</p>
      ${codePicker(lang)}
    </div>
    <div class="hero-art">${HERO_ART}</div>
  </section>
  <h2 class="section-title">${esc(lang.lessonsTitle)} ${ARROW}</h2>
  <div class="lesson-grid">${cards}</div>
</main>`,
  }));
  pages++;

  // Lesson pages.
  structures.forEach((s, i) => {
    const labels = s.labels[lang.code] || s.labels.en;
    const state = translationState(s, lang.code);
    const lesson = s.lessons[lang.code] || s.lessons.en;
    const contentLang = s.lessons[lang.code] ? lang : en;

    let prose = md.parse(lesson.body.replace(/^# .*\n+/, ''));
    prose = prose
      .replace(/<!--\s*code:\s*([\w-]+)\s*-->/g, (m, name) => codeTabs(Object.fromEntries(CODE_LANGS.map((cl) => [cl.id, s.code[cl.id].snippets[name]])), lang, { kind: 'snippet' }))
      .replace(/<table>/g, '<div class="table-wrap"><table>')
      .replace(/<\/table>/g, '</table></div>');

    const reviewUrl = `${REPO_URL}/issues/new?template=review-translation.yml&title=${encodeURIComponent(`[${lang.englishName}] ${s.labels.en.title}`)}`;
    const note = (cls, text, link) => `<div class="banner note${cls}"><span class="tape"></span>${esc(text)} ${link}</div>`;
    let banner = '';
    if (state === 'missing') banner = note(' warn', fill(lang.notTranslated, { language: lang.name }), `<a href="${REPO_URL}/blob/main/CONTRIBUTING.md">${esc(lang.footerContribute)}</a>`);
    else if (state === 'outdated') banner = note(' warn', lang.outdatedBanner, `<a href="${reviewUrl}">${esc(lang.helpReview)}</a>`);
    else if (state === 'draft') banner = note('', lang.draftBanner, `<a href="${reviewUrl}">${esc(lang.helpReview)}</a>`);

    const prev = structures[i - 1];
    const next = structures[i + 1];
    const pagerLink = (target, cls, word) => {
      if (!target) return '<span></span>';
      const tl = target.labels[lang.code] || target.labels.en;
      return `<a class="${cls}" href="../${target.id}/"><span class="lbl">${esc(word)}</span><span>${esc(tl.title)}</span></a>`;
    };

    const runCmds = CODE_LANGS.map((cl) => `<div class="code-panel" data-code="${cl.id}"><code class="cmd">${esc(cl.local(s.code[cl.id].file))}</code></div>`).join('');
    const sources = Object.fromEntries(CODE_LANGS.filter((cl) => cl.browser).map((cl) => [cl.id, s.code[cl.id].display]));

    const body = `<main class="lesson wrap accent-${esc(s.meta.accent || 'teal')}">
  <nav class="crumbs"><a href="../">← ${esc(lang.allLessons)}</a><span class="lesson-of">${esc(fill(lang.lessonOf, { n: i + 1, total: structures.length }))}</span></nav>
  <section class="lesson-hero">
    <div class="lh-text">
      <h1><span class="marker">${esc(labels.title)}</span></h1>
      <p class="summary">${esc(labels.summary)}</p>
    </div>
    <div class="lh-art">${art(s, labels)}</div>
  </section>
  <div class="lesson-code">${codePicker(lang)}</div>
  ${banner}
  <section class="card playground">
    <h2>${esc(lang.playground)}</h2>
    <p class="hint">${esc(lang.playgroundHint)}</p>
    <div class="viz" data-structure="${esc(s.id)}"></div>
  </section>
  <article class="prose" lang="${esc(contentLang.htmlLang)}">
${prose}
  </article>
  <section class="card program">
    <h2>${esc(lang.fullCode)}</h2>
    ${codeTabs(Object.fromEntries(CODE_LANGS.map((cl) => [cl.id, s.code[cl.id].display])), lang, { kind: 'full', runnable: true })}
    <div class="run-output" hidden><div class="lbl">${esc(lang.output)}</div><pre class="out live"></pre></div>
    <div class="lbl">${esc(lang.verifiedOutput)}</div>
    <pre class="out verified">${esc(s.expectedOutput)}</pre>
    <div class="lbl">${esc(lang.runLocally)}</div>
    ${runCmds}
  </section>
  <div class="done-row"><button type="button" class="mark-done" data-lesson="${esc(s.id)}" aria-pressed="false">${CHECK}<span>${esc(lang.markDone)}</span></button></div>
  <nav class="pager">${pagerLink(prev, 'prev', `← ${lang.previous}`)}${pagerLink(next, 'next', `${lang.next} →`)}</nav>
  <p class="edit"><a href="${REPO_URL}/edit/main/${lesson.path}">✎ ${esc(lang.editPage)}</a></p>
</main>
<script>window.PDSA=${jsonForScript({
      structure: s.id,
      lang: lang.code,
      viz: labels.viz || {},
      sources,
      text: { run: lang.run, running: lang.running, stepLog: lang.stepLog, loadingPython: fill(lang.loadingPython, { mb: PYODIDE_MB }) },
    })}</script>`;

    write(`${lang.code}/${s.id}/index.html`, page({
      lang,
      depth: 2,
      title: `${labels.title} · Polyglot DSA`,
      description: labels.summary,
      scripts: ['assets/app.js', 'assets/viz-kit.js', `assets/viz/${s.id}.js`],
      langLinks: langSwitcher(lang, (l) => `../../${l.code}/${s.id}/`),
      body,
    }));
    pages++;
  });
}

console.log(`Built ${pages} pages for ${languages.length} languages and ${structures.length} structures into ${DIST}`);
