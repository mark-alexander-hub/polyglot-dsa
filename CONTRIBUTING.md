# Contributing to Polyglot DSA

Thank you for helping someone learn in their own language. You do not need to be an expert
programmer to help: the most useful work here is reading a lesson in your language and
making it sound right.

## Set up

1. Install [Node.js](https://nodejs.org) 20 or newer.
2. Fork and clone the repository, then run `npm install`.
3. `npm run dev` builds the site and serves it at http://localhost:4173. Run it again after
   you change a file.

## Review a translation

1. Open the lesson on the website in your language, with the English one beside it.
2. Edit `structures/<name>/lesson/<language>.md` directly. Follow the
   [translation guide](docs/translation-guide.md): keep technical words in English, never
   touch code or `<!-- code: … -->` lines, keep the same headings.
3. When the whole lesson reads naturally, change `status: draft` to `status: reviewed` and put
   your GitHub handle in `reviewed_by`.
4. Open a pull request. One lesson per pull request is ideal.

If you only have a few notes, [open a review issue](../../issues/new?template=review-translation.yml)
instead and someone will make the edits.

## Add a language

1. Copy `site/i18n/en.json` to `site/i18n/<code>.json`, using the
   [ISO 639-1 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) (`mr` for
   Marathi, `te` for Telugu, `bn` for Bengali, and so on). Translate every value; keep the
   keys and the `{placeholders}`. Set `_status` to `draft`.
2. Add your language to the glossary and headings tables in
   `docs/translation-guide.md`.
3. For each structure, copy `labels/en.json` to `labels/<code>.json` and translate it.
4. Translate lessons one at a time: create `lesson/<code>.md`, then run
   `npm run translations -- --stamp <code> <structure>` to add its front matter. Lessons you
   have not translated yet show the English version with a notice, so you can open a pull
   request after the very first lesson.
5. `npm run build` must finish without errors.

## Add a structure

Copy the layout of `structures/stack/`:

| File | What goes in it |
|---|---|
| `code/<language>/` | One program per language, written from scratch (no built-in collection doing the work). Mark the parts a lesson shows with `# @snippet name` / `// @snippet name` and `@end`. |
| `expected-output.txt` | The exact output. All four programs must print it byte for byte (ASCII only). |
| `lesson/en.md` | No `#` title. The standard `##` headings from the translation guide, and `<!-- code: name -->` lines where snippets should appear. |
| `labels/en.json` | `title`, `summary`, and every piece of playground text under `viz`. |
| `visualizer.js` | `VizKit.register('<folder name>', (ctx) => { … })`. The helpers are documented at the top of `site/assets/viz-kit.js`; reuse the `.cell`, `.pointer` and `.idx` classes and add your own CSS with `ctx.css`. |
| `meta.json` | `{"order": 5, "shape": "row", "accent": "teal"}`. Shapes: `row`, `chain`, `column`, `ring`. Accents: `teal`, `gold`, `coral`, `rose`, `sage`, `sky`. |

Then run:

```sh
npm test -- <structure>        # the programs print expected-output.txt
npm run build                  # every snippet and label is found
```

## Fix a program

Change all four languages together so they keep printing the same output, update
`expected-output.txt` if the demo changed, and run `npm test`. If a snippet a lesson shows
changes meaning, update the English lesson too; translations will then show as out of date,
which is what we want.

## Pull request checklist

- [ ] `npm run build` finishes without errors
- [ ] `npm test` passes for every language you touched
- [ ] Translations follow the [translation guide](docs/translation-guide.md)
- [ ] One topic per pull request

## Be kind

Many people here are learning, and many are writing in a language they rarely type in. Be
patient, explain rather than correct, and assume good intent. Harassment of any kind is not
welcome and will be removed.

By contributing you agree that your code is licensed under MIT and your lessons and
translations under CC BY 4.0, as described in [LICENSE](LICENSE).
