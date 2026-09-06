/* =========================================================================
   MarketFlow — SDD Viewer application
   Self-contained: markdown parser, syntax highlighter, search, TOC, theme.
   ========================================================================= */

let __sdk = {};

(function () {
  'use strict';

  /* ------------------------------------------------------------ helpers */

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeRegExp(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  const slugify = (() => {
    const used = {};
    function make(text) {
      let slug = String(text)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (!slug) slug = 'secao';
      const seen = used[slug] || 0;
      return seen ? `${slug}-${seen + 1}` : slug;
    }
    function reset() { for (const k in used) delete used[k]; }
    return { make, used, reset };
  })();

  /* --------------------------------------------------- syntax highlight */

  const LANGS = {
    js: 'js', javascript: 'js', ts: 'ts', typescript: 'ts',
    json: 'json', sql: 'sql', postgresql: 'sql',
    sh: 'bash', bash: 'bash', shell: 'bash', zsh: 'bash',
    py: 'python', python: 'python',
    yaml: 'yaml', yml: 'yaml', toml: 'yaml',
    html: 'html', xml: 'html', css: 'css',
    txt: 'text', text: 'text', plaintext: 'text', plain: 'text',
  };

  const KW = {
    js: 'const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|delete|void|static|get|set|this|super|yield|interface|type|enum|implements|public|private|readonly|namespace|declare',
    ts: 'const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|implements|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|delete|void|static|get|set|this|super|yield|interface|type|enum|public|private|readonly|namespace|declare|as|keyof|never|string|number|boolean|any|unknown|Promise|Record|Partial|Pick|Omit',
    sql: 'CREATE|TABLE|SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|OUTER|FULL|CROSS|ON|AND|OR|NOT|NULL|PRIMARY|KEY|FOREIGN|REFERENCES|ALTER|ADD|COLUMN|DROP|INDEX|UNIQUE|CHECK|DEFAULT|CASCADE|SET|RETURNING|BEGIN|COMMIT|ROLLBACK|GRANT|REVOKE|POLICY|USING|WITH|AS|GROUP|BY|ORDER|LIMIT|OFFSET|HAVING|DISTINCT|VALUES|INTO|CASE|WHEN|THEN|ELSE|END|TRIGGER|FUNCTION|RETURNS|LANGUAGE|EXISTS|VIEW|MATERIALIZED|SEQUENCE|TRUNCATE|SCHEMA|PUBLIC|ANON|SERVICE|ROLE|AUTH|TRANSACTION|ISOLATION|LEVEL|GENERATED|ALWAYS|IDENTITY|TIMESTAMP|TIMEZONE|BIGINT|SERIAL|UUID|TEXT|BOOLEAN|EXTENSION|SECURITY|ROW|LEVEL|ENABLE',
    bash: 'if|then|else|fi|for|while|do|done|case|esac|function|export|local|return|exit|echo|cd|mkdir|rm|cp|mv|npm|pnpm|yarn|node|npx|git|docker|supabase|psql|curl',
    python: 'def|return|if|elif|else|for|while|import|from|as|class|try|except|finally|raise|with|lambda|global|nonlocal|pass|break|continue|yield|async|await|in|is|not|and|or|None|print|async',
  };

  function highlight(code, lang) {
    const norm = LANGS[(lang || '').toLowerCase()] || 'js';
    const kw = KW[norm] || '';
    let comment = '//[^\\n]*|/\\*[\\s\\S]*?\\*/';
    if (norm === 'sql') comment = '--[^\\n]*|/\\*[\\s\\S]*?\\*/';
    if (norm === 'bash' || norm === 'python' || norm === 'yaml') comment = '#[^\\n]*';
    if (norm === 'html') comment = '<!--[\\s\\S]*?-->';
    if (norm === 'css') comment = '/\\*[\\s\\S]*?\\*/';

    let patterns = [
      { cls: 'c', re: new RegExp(comment, 'g') },
      { cls: 's', re: /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g },
      { cls: 'n', re: /\b0x[0-9a-fA-F]+\b|\b\d+(?:\.\d+)?\b/g },
    ];
    if (kw) patterns.push({ cls: 'k', re: new RegExp('\\b(?:' + kw + ')\\b', 'g') });
    patterns.push(
      { cls: 'b', re: /\b(?:true|false|null|undefined|None|True|False|nil)\b/g },
      { cls: 'f', re: /[A-Za-z_$][\w$]*(?=\s*\()/g }
    );

    const tokens = [];
    for (const p of patterns) {
      let m;
      p.re.lastIndex = 0;
      while ((m = p.re.exec(code))) {
        tokens.push({ start: m.index, end: m.index + m[0].length, cls: p.cls });
      }
    }
    tokens.sort((a, b) => a.start - b.start || a.end - b.end);

    // Remove overlapping tokens (keep the earliest/longest).
    const clean = [];
    for (const t of tokens) {
      const last = clean[clean.length - 1];
      if (last && t.start < last.end) {
        if (t.end > last.end && t.start >= last.start) {
          // same start, longer wins
          if (t.end - t.start > last.end - last.start) clean[clean.length - 1] = t;
        }
        continue;
      }
      clean.push(t);
    }

    // Emit: gaps are escaped, tokens are escaped and wrapped (tokenize raw, escape per slice).
    let result = '';
    let pos = 0;
    for (const t of clean) {
      if (t.start < pos) continue;
      result += escapeHtml(code.slice(pos, t.start));
      result += `<span class="tok-${t.cls}">${escapeHtml(code.slice(t.start, t.end))}</span>`;
      pos = t.end;
    }
    result += escapeHtml(code.slice(pos));
    return result;
  }

  /* ------------------------------------------------------ markdown (md) */

  function parseInline(text) {
    // 1) extract code spans
    const fragments = [];
    const codeRe = /(`+)([\s\S]*?)\1/g;
    let last = 0;
    let m;
    while ((m = codeRe.exec(text))) {
      if (m.index > last) fragments.push({ t: text.slice(last, m.index) });
      fragments.push({ code: m[2] });
      last = m.index + m[0].length;
    }
    if (last < text.length) fragments.push({ t: text.slice(last) });

    return fragments
      .map((f) => {
        if (f.code !== undefined) {
          return `<code>${escapeHtml(f.code)}</code>`;
        }
        let h = escapeHtml(f.t);
        h = h.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, alt, src, title) =>
          `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${title ? ` title="${escapeHtml(title)}"` : ''} loading="lazy"/>`
        );
        h = h.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, t, url, title) =>
          `<a href="${escapeHtml(url)}"${title ? ` title="${escapeHtml(title)}"` : ''} target="${/^https?:/i.test(url) ? '_blank' : ''}" rel="noopener">${parseInline(t)}</a>`
        );
        h = h.replace(/\*\*([^*\n]+?)\*\*|__([^_\n]+?)__/g, (_, a, b) => `<strong>${parseInline(a || b)}</strong>`);
        h = h.replace(/(?<![A-Za-z0-9_])_([^_\n]+?)_(?![A-Za-z0-9_])/g, (_, a) => `<em>${parseInline(a)}</em>`);
        h = h.replace(/\*([^*\n]+?)\*/g, (_, a) => `<em>${parseInline(a)}</em>`);
        h = h.replace(/~~([^~\n]+?)~~/g, (_, a) => `<del>${parseInline(a)}</del>`);
        h = h.replace(/(^|[\s(<])(https?:\/\/[^\s<)]+)/g, (_, pre, url) => `${pre}<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
        return h;
      })
      .join('');
  }

  function markdownToHtml(md, docId) {
    const lines = String(md).replace(/\r\n/g, '\n').split('\n');
    const state = { headings: [], minLevel: 6 };
    slugify.reset();

    // compute minimum heading level among body headings (skip the very first heading = doc title)
    let firstHeadingForMin = true;
    for (const line of lines) {
      const m = /^(#{1,6})\s+/.exec(line.trim());
      if (m) {
        if (firstHeadingForMin) {
          firstHeadingForMin = false;
          continue;
        }
        state.minLevel = Math.min(state.minLevel, m[1].length);
      }
    }
    if (state.minLevel === 6) state.minLevel = 2;

    let i = 0;
    const out = [];
    while (i < lines.length) {
      const line = lines[i];
      const t = line.trim();
      if (!t) { i++; continue; }

      // fenced code
      const fence = /^(```|~~~)\s*([\w.#-]*)\s*$/.exec(t);
      if (fence) {
        const marker = fence[1];
        const lang = fence[2] || 'text';
        i++;
        const buf = [];
        while (i < lines.length && !lines[i].trim().startsWith(marker)) { buf.push(lines[i]); i++; }
        i++; // skip closing fence
        const code = buf.join('\n');
        out.push(
          `<div class="md-code"><div class="md-code-head"><span class="md-code-lang">${escapeHtml(lang)}</span>` +
          `<button class="md-code-copy" data-copy="${encodeURIComponent(code)}">Copy</button></div>` +
          `<pre><code class="lang-${escapeHtml(lang)}">${highlight(code, lang)}</code></pre></div>`
        );
        continue;
      }

      // ATX heading
      const heading = /^(#{1,6})\s+(.*)$/.exec(t);
      if (heading) {
        if (docId && !state.skipTitle) {
          // first heading is the document title (shown in the hero); skip it here
          state.skipTitle = true;
          i++;
          continue;
        }
        const rawLevel = heading[1].length;
        const level = Math.max(2, Math.min(6, rawLevel - state.minLevel + 2));
        const title = heading[2].replace(/[#*`]/g, '').trim();
        const id = slugify.make(title);
        state.headings.push({ id, level, title });
        out.push(
          `<h${level} id="${id}" class="md-h">` +
          `<a class="anchor" href="#/doc/${encodeURIComponent(docId || '')}::${id}" aria-label="Link direto">#</a>` +
          `${parseInline(heading[2])}` +
          `</h${level}>`
        );
        i++;
        continue;
      }

      // horizontal rule
      if (/^([-*_])(?:\s*\1){2,}\s*$/.test(t)) {
        out.push('<hr/>');
        i++;
        continue;
      }

      // table
      if (isTable(i, lines)) {
        const tbl = renderTable(i, lines);
        out.push(tbl.html);
        i = tbl.next;
        continue;
      }

      // blockquote
      if (/^>\s?/.test(t)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
          buf.push(lines[i].replace(/^\s*>\s?/, ''));
          i++;
        }
        out.push(`<blockquote>${markdownToHtml(buf.join('\n'), null)}</blockquote>`);
        continue;
      }

      // list
      const listMatch = /^( *)([-*+]|\d+[.)])\s+/.exec(line);
      if (listMatch && listMatch[1].length < 4) {
        const parsed = consumeList(lines, i);
        out.push(parsed.html);
        i = parsed.next;
        continue;
      }

      // paragraph
      const buf = [];
      while (i < lines.length) {
        const l = lines[i];
        const lt = l.trim();
        if (!lt) break;
        if (/^(#{1,6})\s/.test(lt)) break;
        if (/^(```|~~~)/.test(lt)) break;
        if (/^([-*_])(?:\s*\1){2,}\s*$/.test(lt)) break;
        if (/^>\s?/.test(lt)) break;
        if (isTable(i, lines)) break;
        if (/^ {0,3}([-*+]|\d+[.)])\s/.test(l)) break;
        buf.push(lt);
        i++;
      }
      out.push(buf.length ? `<p>${parseInline(buf.join(' '))}</p>` : '');
    }

    return out.join('\n');
  }

  function isTable(i, lines) {
    const a = lines[i].trim();
    const b = (lines[i + 1] || '').trim();
    if (!a.includes('|')) return false;
    if (!/^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(b)) return false;
    return true;
  }

  function renderTable(i, lines) {
    const headLine = lines[i].trim();
    const sepLine = lines[i + 1].trim();
    i += 2;
    const splitCells = (row) => {
      const cells = row.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
      return cells;
    };
    const headers = splitCells(headLine);
    const aligns = splitCells(sepLine).map((c) => {
      const left = c.startsWith(':');
      const right = c.endsWith(':');
      return left && right ? 'center' : left ? 'left' : right ? 'right' : '';
    });

    const body = [];
    while (i < lines.length && lines[i].trim().includes('|') && lines[i].trim()) {
      body.push(splitCells(lines[i].trim()));
      i++;
    }

    const th = headers.map((h, n) => {
      const al = aligns[n] ? ` style="text-align:${aligns[n]}"` : '';
      return `<th${al}>${parseInline(h)}</th>`;
    }).join('');
    const trs = body.map((row) => {
      const tds = headers.map((_, n) => {
        const al = aligns[n] ? ` style="text-align:${aligns[n]}"` : '';
        return `<td${al}>${parseInline(row[n] || '')}</td>`;
      }).join('');
      return `<tr>${tds}</tr>`;
    }).join('');

    return { html: `<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`, next: i };
  }

  function consumeList(lines, start) {
    const base = /^( *)([-*+]|\d+[.)])\s+(.*)$/.exec(lines[start]);
    const baseIndent = base[1].length;
    const isOl = /^\d/.test(base[2]);
    const items = [];
    let i = start;

    while (i < lines.length) {
      const m = /^( *)([-*+]|\d+[.)])\s+(.*)$/.exec(lines[i]);
      if (!m) break;
      const ind = m[1].length;
      if (ind < baseIndent) break;
      if (ind === baseIndent) {
        // sibling item
        const task = /^\[([ xX])\]\s*(.*)$/.exec(m[3]);
        const item = {
          text: task ? task[2] : m[3],
          task: !!task,
          checked: task && task[1].toLowerCase() === 'x',
          children: [],
        };
        items.push(item);
        i++;
        // continuation / nested
        while (i < lines.length) {
          const l = lines[i];
          const lt = l.trim();
          if (!lt) break;
          const cm = /^( *)([-*+]|\d+[.)])\s+/.exec(l);
          if (cm && cm[1].length <= baseIndent) break;
          if (cm && cm[1].length > baseIndent) {
            const nested = consumeList(lines, i);
            item.children.push(nested.html);
            i = nested.next;
            continue;
          }
          if (/^(#{1,6})\s/.test(lt) || /^(```|~~~)/.test(lt) || /^>\s?/.test(lt)) break;
          item.text += ' ' + lt;
          i++;
        }
        continue;
      }
      // ind >= baseIndent but reached here only when ind === baseIndent handled; safety break
      break;
    }

    const tag = isOl ? 'ol' : 'ul';
    const lis = items
      .map((it) => {
        const inner = it.task
          ? `<label class="task-item"><input type="checkbox" disabled ${it.checked ? 'checked' : ''}/><span>${parseInline(it.text)}</span></label>`
          : parseInline(it.text);
        const kids = it.children.length ? it.children.join('') : '';
        return `<li>${inner}${kids}</li>`;
      })
      .join('');
    return { html: `<${tag} class="${items.some((x) => x.task) ? 'task-list' : ''}">${lis}</${tag}>`, next: i };
  }

  /* ------------------------------------------------------------- the app */

  let state = {
    docs: [],
    open: null, // doc id
    query: '',
    theme: '',
  };

  const $ = (sel) => document.querySelector(sel);

  if (typeof window !== 'undefined') window.__openMode = true; // guard for node tests

  function initApp() {
    bindTheme();
    bindKeys();
    bindActions();
    $('html').dataset.theme = getTheme();
    loadIndex();
  }

  function getTheme() {
    const saved = localStorage.getItem('sdd-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function bindTheme() {
    $('#btn-theme').addEventListener('click', () => {
      const next = $('html').dataset.theme === 'dark' ? 'light' : 'dark';
      $('html').dataset.theme = next;
      localStorage.setItem('sdd-theme', next);
    });
  }

  function bindKeys() {
    document.addEventListener('keydown', (e) => {
      const t = e.target;
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        $('#search').focus();
      }
      if (typing && e.key === 'Escape') {
        $('#search').value = '';
        $('#search').blur();
        doSearch('');
      }
      if (e.key === ']' && !typing && state.open) { openDoc(nextId(state.open)); }
      if (e.key === '[' && !typing && state.open) { openDoc(prevId(state.open)); }
      if (e.key === 't' && !typing) { $('#btn-theme').click(); }
      if (e.key === 'c' && !typing && state.open) { copyCurrent(); }
      if (e.key === 'p' && !typing) { window.print(); }
    });
  }

  function bindActions() {
    $('#btn-print').addEventListener('click', () => window.print());
    $('#btn-copy').addEventListener('click', copyCurrent);
    $('#btn-src').addEventListener('click', () => {
      if (!state.open) return;
      window.open('../sdd/' + state.open + '.md', '_blank');
    });
    $('#search').addEventListener('input', (e) => {
      doSearch(e.target.value);
      updateHash({ q: e.target.value });
    });
    window.addEventListener('hashchange', loadIndex);
    window.addEventListener('scroll', updateProgress, { passive: true });
  }

  async function loadIndex() {
    const home = $('#home');
    const article = $('#article');
    try {
      const res = await fetch('index.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('http ' + res.status);
      const data = await res.json();
      state.docs = data.docs;
      renderSidebar();
      renderFooter(data);

      const { doc, sec, q } = parseHash();
      if (q) { $('#search').value = q; doSearch(q); }
      if (doc) {
        openDoc(doc, sec);
      } else {
        renderHome();
        home.hidden = false;
        article.hidden = true;
        $('#crumb-doc').textContent = 'Dashboard';
        setToc([]);
      }
    } catch (err) {
      home.innerHTML =
        '<div class="home-card home-hero"><h1>Não foi possível carregar o índice</h1>' +
        '<p>O viewer precisa ser servido por HTTP (o navegador bloqueia fetch em <code>file://</code>).</p>' +
        '<div class="note-box"><span>Rode um servidor estático na raiz do repositório, ex.: <kbd>npx serve</kbd> ' +
        'e abra <kbd>/sdd-viewer/</kbd>. Depois execute <kbd>node scripts/build-sdd-index.mjs</kbd> ' +
        'para regenerar o índice quando os arquivos de <kbd>sdd/</kbd> mudarem.</span></div></div>';
      home.hidden = false;
      article.hidden = true;
      console.error('index load failed:', err);
    }
  }

function parseHash() {
  let h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  if (!h) return {};
  const qm = h.match(/[?&]q=([^&]*)/);
  const q = qm ? qm[1] : '';
  h = h.replace(/\?.*$/, '');
  const parts = h.split('::').filter(Boolean);
  if (parts.length === 1 && !parts[0].includes('/')) return { doc: parts[0], q };
  if (parts[0] === 'doc') return { doc: parts[1], sec: parts.slice(2).join('::'), q };
  return { doc: parts[0], sec: parts.slice(1).join('::'), q };
}

  function updateHash({ q } = {}) {
    const base = state.open ? `/doc/${encodeURIComponent(state.open)}` : '';
    const sec = state.currentSec || '';
    const qi = q ? `?q=${encodeURIComponent(q)}` : '';
    const wanted = `${base}${sec ? '::' + sec : ''}${qi}`;
    if (location.hash !== '#' + wanted) {
      try {
        history.replaceState(null, '', '#' + wanted);
      } catch (e) { location.hash = wanted; }
    }
  }

  /* -------------------------------------------------------------- render */

  function renderSidebar() {
    const list = $('#doc-list');
    $('#sidebar-count').textContent = `${state.docs.length} documentos · ${sumWords(state.docs).toLocaleString('pt-BR')} termos`;
    list.innerHTML = state.docs
      .map((d) => {
        const num = String(d.id).split('-')[0].padStart(2, '0') || d.id;
        return `<button class="doc-item${state.open === d.id ? ' active' : ''}" data-id="${d.id}">` +
          `<span class="doc-num">${escapeHtml(num)}</span>` +
          `<span class="doc-meta">` +
          `<span class="doc-title">${escapeHtml(d.title)}</span>` +
          `<span class="doc-desc">${escapeHtml(d.description || '')}</span>` +
          `<span class="doc-stats"><span>${d.lines} linhas</span><span>${d.sections.length} seções</span></span>` +
          `</span></button>`;
      })
      .join('');
    list.querySelectorAll('.doc-item').forEach((el) => {
      el.addEventListener('click', () => openDoc(el.dataset.id));
    });
  }

  function renderFooter(data) {
    $('#footer').innerHTML =
      `<span><b>MarketFlow</b> · Especificações técnicas</span>` +
      `<span>${data.count} documentos · ${data.totalWords.toLocaleString('pt-BR')} termos · gerado ${new Date(data.generatedAt).toLocaleDateString('pt-BR')}</span>` +
      `<span><b>[</b> anterior · <b>]</b> próximo · <b>t</b> tema · <b>c</b> copiar md · <b>p</b> imprimir</span>`;
  }

  function sumWords(docs) {
    return docs.reduce((a, d) => a + (d.words || 0), 0);
  }

  function renderHome() {
    const home = $('#home');
    const cards = state.docs
      .map((d) => {
        const num = String(d.id).split('-')[0].padStart(2, '0') || d.id;
        return `<button class="doc-card" data-id="${d.id}">` +
          `<div class="card-top"><span class="card-sec">${escapeHtml(num)}</span><span class="card-title">${escapeHtml(d.title)}</span></div>` +
          `<span class="card-desc">${escapeHtml(d.description || '')}</span>` +
          `<span class="card-meat">${d.lines.toLocaleString('pt-BR')} linhas · ${(d.words || 0).toLocaleString('pt-BR')} termos</span>` +
          `</button>`;
      })
      .join('');

    home.innerHTML =
      `<div class="home-card home-hero">` +
      `<div class="eyebrow">Especificações de Desenvolvimento</div>` +
      `<h1>MarketFlow — Documentação técnica</h1>` +
      `<p>Navegue pelas especificações do produto: visão, fundação, banco de dados, autenticação, permissões, API, roadmap, monetização, segurança, design system, auditoria e garantias.</p>` +
      `<div class="home-stats">` +
      `<div class="stat"><b>${state.docs.length}</b><span>documentos</span></div>` +
      `<div class="stat"><b>${sumWords(state.docs).toLocaleString('pt-BR')}</b><span>termos</span></div>` +
      `<div class="stat"><b>${state.docs.reduce((a, d) => a + d.sections.length, 0)}</b><span>seções</span></div>` +
      `</div>` +
      `<div class="note-box"><span>Use <kbd>/</kbd> para buscar, <kbd>[</kbd>/<kbd>]</kbd> para navegar entre documentos e <kbd>t</kbd> para alternar o tema.</span></div>` +
      `</div>` +
      `<div class="home-grid">${cards}</div>`;

    home.querySelectorAll('.doc-card').forEach((el) => {
      el.addEventListener('click', () => openDoc(el.dataset.id));
    });
  }

  function openDoc(id, sectionId) {
    const doc = state.docs.find((d) => d.id === id);
    if (!doc) return renderHome();
    state.open = id;
    state.query = '';
    state.currentSec = sectionId || '';
    $('#home').hidden = true;
    const art = $('#article');
    art.hidden = false;

    $('#crumb-doc').textContent = doc.file;
    $('#btn-src').style.display = '';
    renderArticle(doc);
    renderSidebar();
    updateHash();

    if (sectionId) {
      const el = document.getElementById(sectionId);
      if (el) { el.scrollIntoView({ behavior: 'auto', block: 'start' }); }
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  function renderArticle(doc) {
    const art = $('#article');
    const html = markdownToHtml(doc.content, doc.id);
    const num = String(doc.id).split('-')[0].padStart(2, '0') || '—';

    art.innerHTML =
      `<header class="article-hero">` +
      `<div class="eyebrow">SDD · ${escapeHtml(num)}</div>` +
      `<h1>${escapeHtml(doc.title)}</h1>` +
      (doc.description ? `<p class="desc">${escapeHtml(doc.description)}</p>` : '') +
      `<div class="meta">` +
      `<span class="chip">arquivo <b>${escapeHtml(doc.file)}</b></span>` +
      `<span class="chip"><b>${doc.lines.toLocaleString('pt-BR')}</b> linhas</span>` +
      `<span class="chip"><b>${(doc.words || 0).toLocaleString('pt-BR')}</b> termos</span>` +
      `<span class="chip"><b>${doc.sections.length}</b> seções</span>` +
      `</div></header>` +
      `<div class="article-body md" id="md-body">${html}</div>`;

    // wire copy buttons
    art.querySelectorAll('.md-code-copy').forEach((b) => {
      b.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(decodeURIComponent(b.dataset.copy));
          toast('Código copiado');
        } catch (e) {
          toast('Falha ao copiar');
        }
      });
    });

    // anchor jump from hash
    art.querySelectorAll('.anchor').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const sec = a.parentElement.id;
        state.currentSec = sec;
        history.pushState(null, '', `#/doc/${encodeURIComponent(doc.id)}::${sec}`);
        setActiveToc(sec);
      });
    });

    // collect headings for TOC
    const headings = [];
    Array.from(art.querySelectorAll('.md-h')).forEach((el) => {
      headings.push({ id: el.id, level: parseInt(el.tagName[1], 10), title: el.textContent.replace('#', '') });
    });
    setToc(headings);
    setupScrollSpy();
    updateProgress();
  }

  /* ---------------------------------------------------------------- TOC */

  function setToc(headings) {
    const nav = $('#toc-nav');
    if (!headings.length) {
      nav.innerHTML = '<div class="toc-empty">Sem seções neste documento.</div>';
      $('#toc').style.visibility = 'hidden';
      return;
    }
    $('#toc').style.visibility = 'visible';

    const minLevel = Math.min(...headings.map((h) => h.level));
    let idx = 0;

    function build(depth) {
      let out = '<ul class="toc-list">';
      while (idx < headings.length) {
        const h = headings[idx];
        if (h.level < depth) break;
        if (h.level === depth) {
          idx++;
          out +=
            `<li><a href="#/doc/${encodeURIComponent(state.open)}::${h.id}" data-sec="${h.id}" data-level="${h.level}">` +
            `${escapeHtml(h.title)}</a>${build(depth + 1)}</li>`;
        } else {
          // heading level jumped deeper than expected — treat as its own branch
          const start = idx;
          out += `<li><a href="#/doc/${encodeURIComponent(state.open)}::${h.id}" data-sec="${h.id}" data-level="${h.level}">` +
            `${escapeHtml(h.title)}</a>`;
          idx++;
          out += build(h.level + 1);
          out += '</li>';
          if (idx === start) idx++; // safety against infinite loop
        }
      }
      out += '</ul>';
      return out;
    }

    nav.innerHTML = build(minLevel);
    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const el = document.getElementById(a.dataset.sec);
        state.currentSec = a.dataset.sec;
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', a.getAttribute('href'));
        setActiveToc(a.dataset.sec);
      });
    });
  }

  function setActiveToc(id) {
    document.querySelectorAll('#toc-nav a').forEach((a) => {
      a.classList.toggle('active', a.dataset.sec === id);
    });
  }

  function setupScrollSpy() {
    const headings = Array.from(document.querySelectorAll('.md-h'));
    if (!headings.length) return;
    const spy = () => {
      let current = headings[0].id;
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= 96) current = h.id;
      }
      setActiveToc(current);
    };
    window.__spy = spy;
    document.removeEventListener('scroll', spy);
    document.addEventListener('scroll', spy, { passive: true });
    document.addEventListener('scroll', updateProgress, { passive: true });
  }

  function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const p = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    $('#progress').style.setProperty('--_p', p + '%');
    $('#progress').style.width = p + '%';
  }

  /* --------------------------------------------------------------- search */

  function doSearch(q) {
    const term = q.trim().toLowerCase();
    state.query = term;
    $('#sidebar-count').textContent = term
      ? `Resultados para "${q.trim()}"`
      : `${state.docs.length} documentos · ${sumWords(state.docs).toLocaleString('pt-BR')} termos`;

    const list = $('#doc-list');
    if (!term) {
      renderSidebar();
      return;
    }

    const scored = state.docs
      .map((d) => {
        const idx = (d.title + ' ' + d.title + d.description + ' ' + d.content).toLowerCase();
        let score = 0;
        let count = 0;
        let pos = -1;
        while ((pos = idx.indexOf(term, pos + 1)) !== -1) { count++; }
        if (d.title.toLowerCase().includes(term)) score += 40;
        if (d.description.toLowerCase().includes(term)) score += 12;
        score += count;
        return { d, score, count };
      })
      .filter((x) => x.count > 0)
      .sort((a, b) => b.score - a.score);

    if (!scored.length) {
      list.innerHTML = '<div class="doc-empty">Nenhum resultado para "' + escapeHtml(q.trim()) + '".</div>';
      return;
    }

    list.innerHTML = scored
      .map(({ d }) => {
        const num = String(d.id).split('-')[0].padStart(2, '0');
        return `<button class="doc-item${state.open === d.id ? ' active' : ''}" data-id="${d.id}">` +
          `<span class="doc-num">${escapeHtml(num)}</span>` +
          `<span class="doc-meta"><span class="doc-title">${escapeHtml(d.title)}</span>` +
          `<span class="doc-desc">${escapeHtml(d.description || '')}</span>` +
          `<span class="doc-stats"><span>${String(d.content.toLowerCase().split(term).length - 1)} ocorrências</span></span>` +
          `</span></button>`;
      })
      .join('');
    list.querySelectorAll('.doc-item').forEach((el) => {
      el.addEventListener('click', () => {
        openDoc(el.dataset.id, '');
        highlightInBody(term);
      });
    });
  }

  function highlightInBody(term) {
    const body = $('#md-body');
    if (!body) return;
    body.querySelectorAll('mark').forEach((m) => {
      const t = m.textContent;
      m.replaceWith(document.createTextNode(t));
    });
    if (!term) return;
    const re = new RegExp(escapeRegExp(term), 'ig');
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        return /^\s*$/.test(n.nodeValue) || n.parentNode && n.parentNode.closest && n.parentNode.closest('pre') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      re.lastIndex = 0;
      if (!re.test(node.nodeValue)) return;
      re.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0;
      let m;
      while ((m = re.exec(node.nodeValue))) {
        frag.appendChild(document.createTextNode(node.nodeValue.slice(last, m.index)));
        const mark = document.createElement('mark');
        mark.textContent = m[0];
        frag.appendChild(mark);
        last = m.index + m[0].length;
      }
      frag.appendChild(document.createTextNode(node.nodeValue.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  /* ---------------------------------------------------------------- utils */

  function nextId(id) {
    const idx = state.docs.findIndex((d) => d.id === id);
    return state.docs[(idx + 1) % state.docs.length].id;
  }
  function prevId(id) {
    const idx = state.docs.findIndex((d) => d.id === id);
    return state.docs[(idx - 1 + state.docs.length) % state.docs.length].id;
  }

  async function copyCurrent() {
    const doc = state.docs.find((d) => d.id === state.open);
    if (!doc) return;
    try {
      await navigator.clipboard.writeText(doc.content);
      toast('Markdown copiado');
    } catch (e) {
      toast('Falha ao copiar');
    }
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.classList.remove('show');
      t.hidden = true;
    }, 1600);
  }

  /* ------------------------------------------------------------ exports */

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initApp);
    } else {
      initApp();
    }
  }

  __sdk = { markdownToHtml, highlight, parseInline, escapeHtml, slugify };
})();

export default __sdk;