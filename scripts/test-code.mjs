// Runs every program and checks it prints exactly structures/<id>/expected-output.txt.
//   npm test                      all structures, every toolchain found on this computer
//   npm test -- stack             one structure
//   npm test -- stack java        one structure, one language
//   npm test -- --require-all     fail (instead of skip) when a toolchain is missing (used in CI)
// Set CXX to pick a C++ compiler, for example CXX=clang++.
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join, basename, dirname, isAbsolute, delimiter } from 'node:path';
import { ROOT, CODE_LANGS, loadLanguages, loadStructures } from './lib.mjs';

const args = process.argv.slice(2);
const requireAll = args.includes('--require-all');
const [onlyStructure, onlyLang] = args.filter((a) => !a.startsWith('--'));

const { structures, errors } = loadStructures(loadLanguages());
if (errors.length) {
  errors.forEach((e) => console.error(`error: ${e}`));
  process.exit(1);
}

const run = (cmd, cmdArgs, cwd, env = process.env) => spawnSync(cmd, cmdArgs, { cwd, env, encoding: 'utf8', timeout: 60_000, windowsHide: true });
const works = (cmd, cmdArgs) => {
  const r = run(cmd, cmdArgs, ROOT);
  return !r.error && r.status === 0;
};

const python = ['python3', 'python'].find((p) => works(p, ['--version']));
const cxx = process.env.CXX || 'g++';
const toolchains = {
  python: python ? null : 'python3 / python not found',
  cpp: works(cxx, ['--version']) ? null : `${cxx} not found (set CXX)`,
  java: works('java', ['--version']) ? null : 'java not found',
  javascript: null,
};

function execute(structure, cl) {
  const { abs, file } = structure.code[cl.id];
  const cwd = join(abs, '..');
  switch (cl.id) {
    case 'python':
      return run(python, ['-X', 'utf8', file], cwd);
    case 'javascript':
      return run(process.execPath, [file], cwd);
    case 'java':
      return run('java', [file], cwd);
    case 'cpp': {
      const out = join(ROOT, '.build', structure.id);
      mkdirSync(out, { recursive: true });
      const exe = join(out, basename(file, '.cpp') + (process.platform === 'win32' ? '.exe' : ''));
      const compiled = run(cxx, ['-std=c++17', '-Wall', '-Wextra', '-O1', abs, '-o', exe], cwd);
      if (compiled.error || compiled.status !== 0) return { ...compiled, stage: 'compile' };
      if (compiled.stderr.trim()) console.warn(`  compiler warnings for ${structure.id}/cpp:\n${compiled.stderr}`);
      // A compiler given by full path (common on Windows) keeps its runtime DLLs next to it.
      const env = isAbsolute(cxx) ? { ...process.env, PATH: `${dirname(cxx)}${delimiter}${process.env.PATH}` } : process.env;
      return run(exe, [], cwd, env);
    }
  }
}

const normalize = (s) => s.replace(/\r\n?/g, '\n').split('\n').map((l) => l.trimEnd()).join('\n').trim();
let passed = 0;
let failed = 0;
let skipped = 0;

for (const s of structures.filter((x) => !onlyStructure || x.id === onlyStructure)) {
  const want = normalize(s.expectedOutput);
  for (const cl of CODE_LANGS.filter((c) => !onlyLang || c.id === onlyLang)) {
    const label = `${s.id} / ${cl.label}`.padEnd(28);
    if (toolchains[cl.id]) {
      if (requireAll) {
        console.log(`FAIL ${label} ${toolchains[cl.id]}`);
        failed++;
      } else {
        console.log(`skip ${label} ${toolchains[cl.id]}`);
        skipped++;
      }
      continue;
    }
    const r = execute(s, cl);
    if (r.error || r.status !== 0) {
      console.log(`FAIL ${label} ${r.stage === 'compile' ? 'did not compile' : `exit ${r.status ?? r.error?.code}`}`);
      console.log(`     ${(r.stderr || String(r.error || '')).trim().split('\n').slice(0, 12).join('\n     ')}`);
      failed++;
      continue;
    }
    const got = normalize(r.stdout);
    if (got === want) {
      console.log(`ok   ${label}`);
      passed++;
      continue;
    }
    const g = got.split('\n');
    const w = want.split('\n');
    const at = w.findIndex((line, i) => line !== g[i]);
    const line = at === -1 ? w.length : at;
    console.log(`FAIL ${label} output differs at line ${line + 1}`);
    console.log(`     expected: ${JSON.stringify(w[line] ?? '(end of output)')}`);
    console.log(`     got:      ${JSON.stringify(g[line] ?? '(end of output)')}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed, ${skipped} skipped`);
process.exit(failed ? 1 : 0);
