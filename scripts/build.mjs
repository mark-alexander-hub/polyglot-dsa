// Builds the static website into dist/: npm run build
import { mkdirSync, rmSync, writeFileSync, copyFileSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { Marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import cpp from 'highlight.js/lib/languages/cpp';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import { ROOT, CODE_LANGS, REPO_URL, loadLanguages, loadStructures, translationState } from './lib.mjs';

hljs.registerLanguage('python', python);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('java', java);
hljs.registerLanguage('javascript', javascript);

// PDSA_DIST lets parallel builds (for example one per contributor preview) write to separate folders.
const DIST = process.env.PDSA_DIST ? resolve(process.env.PDSA_DIST) : join(ROOT, 'dist');
const PYODIDE_MB = 12;

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
        const id = slug(inner);
        return `<h${depth} id="${esc(id)}">${inner}</h${depth}>\n`;
      },
    },
  });
  return md;
}

function codeTabs(sources, t, { kind, runnable = false }) {
  const bar = CODE_LANGS.map((cl) => `<button type="button" class="tab" data-code="${cl.id}">${cl.label}</button>`).join('');
  const panels = CODE_LANGS.map((cl) => {
    const src = sources[cl.id];
    const run = runnable && cl.browser ? `<button type="button" class="run" data-run="${cl.id}">▶ ${esc(t.run)}</button>` : '';
    return `<div class="code-panel" data-code="${cl.id}"><div class="code-tools">${run}<button type="button" class="copy" data-copied="${esc(t.copied)}">${esc(t.copy)}</button></div><pre><code class="hljs language-${cl.hljs}">${highlight(src, cl.hljs)}</code></pre></div>`;
  }).join('');
  return `<div class="code-tabs ${kind}"><div class="tabbar" role="tablist">${bar}</div>${panels}</div>`;
}

const shapes = {
  row: (n) => `<span class="shape row">${Array.from({ length: n }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</span>`,
  chain: (n) => `<span class="shape chain">${Array.from({ length: n }, (_, i) => `<i style="--i:${i}"></i>`).join('<b></b>')}</span>`,
  column: (n) => `<span class="shape column">${Array.from({ length: n }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</span>`,
  ring: (n) => `<span class="shape ring">${Array.from({ length: n }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</span>`,
};

const codeStyle = `<style>${CODE_LANGS.map((cl) => `html[data-code="${cl.id}"] .code-panel:not([data-code="${cl.id}"]){display:none}html[data-code="${cl.id}"] .tab[data-code="${cl.id}"],html[data-code="${cl.id}"] .code-pick[data-code="${cl.id}"]{color:var(--on-accent);background:var(--accent);border-color:var(--accent)}`).join('')}</style>`;

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
<link rel="stylesheet" href="${up}assets/style.css">
${codeStyle}
${headPrefs}
</head>
<body class="lang-${esc(lang.code)}">
<header class="top">
  <a class="brand" href="${up}${depth ? `${lang.code}/` : ''}"><span class="gem" aria-hidden="true">◆</span> ${esc(lang.siteTitle)}</a>
  <div class="top-tools">
    ${langLinks}
    <button type="button" class="theme-toggle" aria-label="${esc(lang.toggleTheme)}" title="${esc(lang.toggleTheme)}">◐</button>
  </div>
</header>
${body}
<footer class="foot">
  <p>${esc(lang.footerLicence)} <a href="${REPO_URL}">GitHub</a></p>
  <p><a href="${REPO_URL}/blob/main/CONTRIBUTING.md">${esc(lang.footerContribute)}</a></p>
</footer>
${scripts.map((s) => `<script src="${up}${s}"></script>`).join('\n')}
</body>
</html>
`;
}

function langSwitcher(current, hrefFor) {
  const opts = languages.map((l) => `<a class="lang-pick${l.code === current.code ? ' on' : ''}" lang="${esc(l.htmlLang)}" hreflang="${esc(l.htmlLang)}" href="${hrefFor(l)}"${l.code === current.code ? ' aria-current="page"' : ''}>${esc(l.name)}</a>`).join('');
  return `<nav class="langs" aria-label="${esc(current.chooseLanguage)}">${opts}</nav>`;
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

// Root: language picker.
write('index.html', page({
  lang: en,
  depth: 0,
  title: `${en.siteTitle} · ${languages.map((l) => l.tagline).join(' · ')}`,
  description: en.heroText,
  scripts: ['assets/app.js'],
  body: `<main class="picker">
  <div class="picker-intro"><span class="gem big" aria-hidden="true">◆</span><h1>${esc(en.siteTitle)}</h1></div>
  <div class="picker-grid">
    ${languages.map((l, i) => `<a class="pick-card" style="--i:${i}" href="${l.code}/" lang="${esc(l.htmlLang)}" data-lang="${l.code}">
      <span class="native">${esc(l.name)}</span>
      <span class="tag">${esc(l.tagline)}</span>
      <span class="choose">${esc(l.chooseLanguage)} →</span>
    </a>`).join('\n    ')}
  </div>
</main>`,
}));
pages++;

for (const lang of languages) {
  // Language home: lesson cards.
  const cards = structures.map((s, i) => {
    const l = s.labels[lang.code] || s.labels.en;
    return `<a class="lesson-card accent-${esc(s.meta.accent || 'teal')}" style="--i:${i}" href="${s.id}/">
      ${(shapes[s.meta.shape] || shapes.row)(4)}
      <span class="kicker mono">${esc(fill(lang.lessonN, { n: i + 1 }))}</span>
      <span class="title">${esc(l.title)}</span>
      <span class="summary">${esc(l.summary)}</span>
      <span class="go">${esc(lang.start)} →</span>
    </a>`;
  }).join('\n');

  write(`${lang.code}/index.html`, page({
    lang,
    depth: 1,
    title: `${lang.siteTitle} · ${lang.tagline}`,
    description: lang.heroText,
    scripts: ['assets/app.js'],
    langLinks: langSwitcher(lang, (l) => `../${l.code}/`),
    body: `<main class="home">
  <section class="hero">
    <h1>${esc(lang.heroTitle)}</h1>
    <p>${esc(lang.heroText)}</p>
    ${codePicker(lang)}
  </section>
  <h2 class="section-title">${esc(lang.lessonsTitle)}</h2>
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
    let banner = '';
    if (state === 'missing') banner = `<div class="banner warn">${esc(fill(lang.notTranslated, { language: lang.name }))} <a href="${REPO_URL}/blob/main/CONTRIBUTING.md">${esc(lang.footerContribute)}</a></div>`;
    else if (state === 'outdated') banner = `<div class="banner warn">${esc(lang.outdatedBanner)} <a href="${reviewUrl}">${esc(lang.helpReview)}</a></div>`;
    else if (state === 'draft') banner = `<div class="banner">${esc(lang.draftBanner)} <a href="${reviewUrl}">${esc(lang.helpReview)}</a></div>`;

    const prev = structures[i - 1];
    const next = structures[i + 1];
    const pagerLink = (target, cls, word) => {
      if (!target) return '<span></span>';
      const tl = target.labels[lang.code] || target.labels.en;
      return `<a class="${cls}" href="../${target.id}/"><span class="lbl">${esc(word)}</span><span>${esc(tl.title)}</span></a>`;
    };

    const runCmds = CODE_LANGS.map((cl) => `<div class="code-panel" data-code="${cl.id}"><code class="cmd">${esc(cl.local(s.code[cl.id].file))}</code></div>`).join('');
    const sources = Object.fromEntries(CODE_LANGS.filter((cl) => cl.browser).map((cl) => [cl.id, s.code[cl.id].display]));

    const body = `<main class="lesson accent-${esc(s.meta.accent || 'teal')}">
  <nav class="crumbs"><a href="../">${esc(lang.allLessons)}</a><span aria-hidden="true">/</span><span class="mono">${esc(fill(lang.lessonN, { n: i + 1 }))}</span></nav>
  <section class="lesson-hero">
    ${(shapes[s.meta.shape] || shapes.row)(5)}
    <h1>${esc(labels.title)}</h1>
    <p class="summary">${esc(labels.summary)}</p>
    ${codePicker(lang)}
  </section>
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
      title: `${labels.title} · ${lang.siteTitle}`,
      description: labels.summary,
      scripts: ['assets/app.js', 'assets/viz-kit.js', `assets/viz/${s.id}.js`],
      langLinks: langSwitcher(lang, (l) => `../../${l.code}/${s.id}/`),
      body,
    }));
    pages++;
  });
}

console.log(`Built ${pages} pages for ${languages.length} languages and ${structures.length} structures into ${DIST}`);
