// Shows where every translation stands, and stamps a translation after it is updated.
//   npm run translations                      table of all lessons
//   npm run translations -- --stamp hi stack  mark hi/stack as matching the current English lesson
//   npm run translations -- --stamp hi all    same, for every structure
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadLanguages, loadStructures, translationState, fingerprint, parseFrontMatter, h2Count } from './lib.mjs';

const args = process.argv.slice(2);
const languages = loadLanguages();
const { structures, errors } = loadStructures(languages);
if (errors.length) {
  errors.forEach((e) => console.error(`error: ${e}`));
  process.exit(1);
}

const stampAt = args.indexOf('--stamp');
if (stampAt !== -1) {
  const [langCode, which] = args.slice(stampAt + 1);
  if (!langCode || !which || langCode === 'en') {
    console.error('Usage: npm run translations -- --stamp <language code> <structure id | all>');
    process.exit(1);
  }
  const targets = which === 'all' ? structures : structures.filter((s) => s.id === which);
  if (!targets.length) {
    console.error(`No structure called "${which}".`);
    process.exit(1);
  }
  for (const s of targets) {
    const file = join(s.dir, 'lesson', `${langCode}.md`);
    if (!existsSync(file)) {
      console.warn(`skip: structures/${s.id}/lesson/${langCode}.md does not exist`);
      continue;
    }
    const { data, body } = parseFrontMatter(readFileSync(file, 'utf8'));
    const next = { translated_from: fingerprint(s.lessons.en.body), status: data.status || 'draft', reviewed_by: data.reviewed_by || '' };
    const front = `---\n${Object.entries(next).map(([k, v]) => (v ? `${k}: ${v}` : `${k}:`)).join('\n')}\n---\n\n`;
    writeFileSync(file, front + body.replace(/^\n+/, ''));
    console.log(`stamped structures/${s.id}/lesson/${langCode}.md -> ${next.translated_from} (${next.status})`);
  }
  process.exit(0);
}

const marks = { source: 'EN', reviewed: 'ok', draft: 'draft', outdated: 'OUTDATED', missing: 'missing' };
const width = Math.max(...structures.map((s) => s.id.length), 10);
console.log(`${'structure'.padEnd(width)}  ${languages.map((l) => l.code.padEnd(9)).join('')}`);
const notes = [];
for (const s of structures) {
  const row = languages.map((l) => {
    const state = translationState(s, l.code);
    const lesson = s.lessons[l.code];
    if (lesson && l.code !== 'en' && h2Count(lesson.body) !== h2Count(s.lessons.en.body)) {
      notes.push(`structures/${s.id}/lesson/${l.code}.md has ${h2Count(lesson.body)} "##" headings, English has ${h2Count(s.lessons.en.body)}`);
    }
    return marks[state].padEnd(9);
  });
  console.log(`${s.id.padEnd(width)}  ${row.join('')}`);
}
for (const lang of languages.filter((l) => l.code !== 'en')) {
  if (lang._status !== 'reviewed') notes.push(`site/i18n/${lang.code}.json (website buttons and labels) is still a draft`);
}
if (notes.length) console.log(`\n${notes.map((n) => `note: ${n}`).join('\n')}`);
console.log('\nok = reviewed by a native speaker · draft = not reviewed yet · OUTDATED = English changed since translation');
