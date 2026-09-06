import assert from 'node:assert';
import { readFileSync } from 'node:fs';

const app = await import(new URL('../sdd-viewer/app.js', import.meta.url).href);
const { markdownToHtml, highlight, parseInline } = app.default;

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`  ok  ${name}`);
  } catch (e) {
    failures++;
    console.error(`FAIL  ${name}  → ${e.message}`);
  }
}

check('inline: bold + italic + code + link', () => {
  const input = '**negrito** e *itálico* e `code` e [link](https://ex.com)';
  const out = parseInline(input);
  assert(out.includes('<strong>negrito</strong>'));
  assert(out.includes('<em>itálico</em>'));
  assert(out.includes('<code>code</code>'));
  assert(out.includes('<a href="https://ex.com"'));
});

check('inline: snake_case não vira itálico', () => {
  const out = parseInline('api_keys e schema_migrations');
  assert(!out.includes('<em>'));
});

check('inline: XSS é escapado', () => {
  const out = parseInline('<script>alert(1)</script>');
  assert(!out.includes('<script>'));
  assert(out.includes('&lt;script&gt;'));
});

check('block: headings remap + ids', () => {
  const out = markdownToHtml('# Título\n\n## 1. Seção\n\n### 1.1 Sub', '00-x');
  assert(out.includes('<h2'));
  assert(out.includes('<h3'));
});

check('block: lista aninhada', () => {
  const out = markdownToHtml('- A\n  - A1\n  - A2\n- B', null);
  assert(out.includes('<li>A<ul'));
  assert(out.includes('<li>A2</li>'));
  assert(out.includes('<li>B</li>'));
});

check('block: tabela', () => {
  const out = markdownToHtml('| A | B |\n| :- | -: |\n| 1 | 2 |', null);
  assert(out.includes('<table>'));
  assert(out.includes('<th'));
  assert(out.includes('<td'));
  assert(out.includes('text-align:right'));
});

check('block: code fence com highlight', () => {
  const out = markdownToHtml('```sql\nSELECT * FROM products;\n```', null);
  assert(out.includes('md-code'));
  assert(out.includes('tok-k'));
});

check('block: blockquote', () => {
  const out = markdownToHtml('> citação\n> continua', null);
  assert(out.includes('<blockquote>'));
});

check('highlight: strings e keywords', () => {
  const h = highlight('export const a = "oi";', 'js');
  assert(h.includes('tok-k'));
  assert(h.includes('tok-s'));
});

const index = JSON.parse(readFileSync(new URL('../sdd-viewer/index.json', import.meta.url), 'utf8'));

check(`render all ${index.docs.length} real docs`, () => {
  let total = 0;
  for (const d of index.docs) {
    const html = markdownToHtml(d.content, d.id);
    assert(html.length > 200, `${d.id} renderizou vazio`);
    total += html.length;
  }
  console.log(`      ${index.docs.length} docs · ${total.toLocaleString()} chars de HTML`);
});

if (failures) {
  console.error(`\n${failures} check(s) falharam`);
  process.exit(1);
}
console.log('\nALL OK');