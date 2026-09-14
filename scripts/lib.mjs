// Shared loaders and validators for the build, translation and code-test scripts.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const STRUCTURES_DIR = join(ROOT, 'structures');
export const REPO_URL = 'https://github.com/mark-alexander-hub/polyglot-dsa';

// The programming languages every structure is written in.
export const CODE_LANGS = [
  { id: 'python', label: 'Python', ext: '.py', hljs: 'python', browser: 'python', local: (f) => `python ${f}` },
  { id: 'cpp', label: 'C++', ext: '.cpp', hljs: 'cpp', browser: null, local: (f) => `g++ -std=c++17 ${f} -o ${basename(f, '.cpp')} && ./${basename(f, '.cpp')}` },
  { id: 'java', label: 'Java', ext: '.java', hljs: 'java', browser: null, local: (f) => `java ${f}` },
  { id: 'javascript', label: 'JavaScript', ext: '.js', hljs: 'javascript', browser: 'javascript', local: (f) => `node ${f}` },
];

const readText = (p) => readFileSync(p, 'utf8').replace(/\r\n?/g, '\n');
const readJson = (p) => JSON.parse(readText(p));

/** Human languages, English first, then by code. */
export function loadLanguages() {
  const dir = join(ROOT, 'site', 'i18n');
  const langs = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => readJson(join(dir, f)));
  return langs.sort((a, b) => (a.code === 'en' ? -1 : b.code === 'en' ? 1 : a.code.localeCompare(b.code)));
}

/** Splits `---` front matter (flat `key: value` pairs) from a Markdown body. */
export function parseFrontMatter(text) {
  const src = text.replace(/\r\n?/g, '\n');
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(src);
  if (!m) return { data: {}, body: src };
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line.trim());
    if (kv) data[kv[1]] = kv[2].trim();
  }
  return { data, body: src.slice(m[0].length) };
}

/** Fingerprint of an English lesson body; stable across line endings and trailing spaces. */
export function fingerprint(body) {
  const norm = body.replace(/\r\n?/g, '\n').split('\n').map((l) => l.trimEnd()).join('\n').trim();
  return createHash('sha256').update(norm, 'utf8').digest('hex').slice(0, 12);
}

const SNIPPET_START = /^\s*(?:#|\/\/)\s*@snippet\s+([\w-]+)\s*$/;
const SNIPPET_END = /^\s*(?:#|\/\/)\s*@end\s*$/;

function dedent(lines) {
  const indents = lines.filter((l) => l.trim()).map((l) => /^ */.exec(l)[0].length);
  const cut = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(cut)).join('\n').replace(/\n+$/, '');
}

/** Reads a source file: the display code (markers removed) and its named snippets. */
export function parseSource(text) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const display = [];
  const snippets = {};
  const errors = [];
  let open = null;
  lines.forEach((line, i) => {
    const s = SNIPPET_START.exec(line);
    if (s) {
      if (open) errors.push(`line ${i + 1}: @snippet ${s[1]} starts inside @snippet ${open.name}`);
      open = { name: s[1], lines: [] };
      return;
    }
    if (SNIPPET_END.test(line)) {
      if (!open) errors.push(`line ${i + 1}: @end without @snippet`);
      else if (snippets[open.name]) errors.push(`snippet "${open.name}" is defined twice`);
      else snippets[open.name] = dedent(open.lines);
      open = null;
      return;
    }
    display.push(line);
    if (open) open.lines.push(line);
  });
  if (open) errors.push(`@snippet ${open.name} is never closed with @end`);
  return { display: display.join('\n').replace(/\n+$/, '') + '\n', snippets, errors };
}

/** Lines like `<!-- code: push -->` inside a lesson. */
export const CODE_DIRECTIVE = /^<!--\s*code:\s*([\w-]+)\s*-->$/gm;

export function lessonDirectives(body) {
  return [...body.matchAll(CODE_DIRECTIVE)].map((m) => m[1]);
}

export function h2Count(body) {
  return (body.replace(/```[\s\S]*?```/g, '').match(/^## /gm) || []).length;
}

function sameKeys(a, b, path = '') {
  const out = [];
  for (const k of Object.keys(a)) {
    if (!(k in b)) out.push(`missing "${path}${k}"`);
    else if (a[k] && typeof a[k] === 'object' && !Array.isArray(a[k])) out.push(...sameKeys(a[k], b[k] || {}, `${path}${k}.`));
  }
  return out;
}

/** Loads every structure with its labels, lessons, code and output. Collects problems instead of throwing. */
export function loadStructures(languages) {
  const errors = [];
  const warnings = [];
  const ids = readdirSync(STRUCTURES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(STRUCTURES_DIR, d.name, 'meta.json')))
    .map((d) => d.name);

  const structures = ids.map((id) => {
    const dir = join(STRUCTURES_DIR, id);
    const where = `structures/${id}`;
    const meta = readJson(join(dir, 'meta.json'));
    if (typeof meta.order !== 'number') errors.push(`${where}/meta.json: "order" must be a number`);

    const labels = {};
    for (const lang of languages) {
      const p = join(dir, 'labels', `${lang.code}.json`);
      if (existsSync(p)) labels[lang.code] = readJson(p);
    }
    if (!labels.en) errors.push(`${where}/labels/en.json is missing`);
    for (const [code, l] of Object.entries(labels)) {
      if (code !== 'en' && labels.en) sameKeys(labels.en, l).forEach((e) => errors.push(`${where}/labels/${code}.json: ${e}`));
    }

    const lessons = {};
    for (const lang of languages) {
      const p = join(dir, 'lesson', `${lang.code}.md`);
      if (!existsSync(p)) {
        if (lang.code === 'en') errors.push(`${where}/lesson/en.md is missing`);
        continue;
      }
      const { data, body } = parseFrontMatter(readText(p));
      lessons[lang.code] = { data, body, path: `${where}/lesson/${lang.code}.md` };
    }

    const code = {};
    for (const cl of CODE_LANGS) {
      const cdir = join(dir, 'code', cl.id);
      const files = existsSync(cdir) ? readdirSync(cdir).filter((f) => extname(f) === cl.ext) : [];
      if (files.length !== 1) {
        errors.push(`${where}/code/${cl.id}: expected exactly one ${cl.ext} file, found ${files.length}`);
        continue;
      }
      const parsed = parseSource(readText(join(cdir, files[0])));
      parsed.errors.forEach((e) => errors.push(`${where}/code/${cl.id}/${files[0]}: ${e}`));
      code[cl.id] = { ...parsed, file: files[0], path: `${where}/code/${cl.id}/${files[0]}`, abs: join(cdir, files[0]) };
    }

    const outPath = join(dir, 'expected-output.txt');
    const expectedOutput = existsSync(outPath) ? readText(outPath) : null;
    if (expectedOutput === null) errors.push(`${where}/expected-output.txt is missing`);

    const vizPath = join(dir, 'visualizer.js');
    if (!existsSync(vizPath)) errors.push(`${where}/visualizer.js is missing`);

    for (const [code2, lesson] of Object.entries(lessons)) {
      for (const name of lessonDirectives(lesson.body)) {
        for (const cl of CODE_LANGS) {
          if (code[cl.id] && !(name in code[cl.id].snippets)) {
            errors.push(`${lesson.path}: <!-- code: ${name} --> has no "@snippet ${name}" in ${code[cl.id].path}`);
          }
        }
      }
      if (code2 !== 'en' && lessons.en) {
        const want = lessonDirectives(lessons.en.body).join(',');
        if (lessonDirectives(lesson.body).join(',') !== want) {
          warnings.push(`${lesson.path}: code lines differ from English (${want})`);
        }
      }
    }

    return { id, dir, meta, labels, lessons, code, expectedOutput, vizPath };
  });

  structures.sort((a, b) => a.meta.order - b.meta.order);
  return { structures, errors, warnings };
}

/** Where a translated lesson stands against the English one. */
export function translationState(structure, langCode) {
  if (langCode === 'en') return 'source';
  const lesson = structure.lessons[langCode];
  if (!lesson) return 'missing';
  const en = structure.lessons.en;
  if (!en || lesson.data.translated_from !== fingerprint(en.body)) return 'outdated';
  return lesson.data.status === 'reviewed' ? 'reviewed' : 'draft';
}
