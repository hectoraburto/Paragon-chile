/* js/build-kb.js
   Genera window.PARAGON_KB y window.PARAGON_SYNONYMS a partir del HTML del sitio.
   – Recorre index + /servicios/*.html
   – Extrae secciones útiles (About, Servicios, Contacto, y bloques por títulos en páginas de servicios)
   – Limpia texto, divide por secciones, y descarga kb.js listo para el chatbot semántico.
*/
(function () {
  // ====== Utilidades ======
  const logEl = () => document.getElementById('log');
  const log = (...args) => {
    const el = logEl();
    if (!el) return console.log(...args);
    el.textContent += args.join(' ') + '\n';
    el.scrollTop = el.scrollHeight;
  };

  function computeBasePath() {
    // /Paragon-chile/ en GitHub Pages; "/" en local
    if (location.hostname.endsWith('github.io')) {
      const parts = location.pathname.split('/').filter(Boolean);
      return parts.length ? `/${parts[0]}/` : '/';
    }
    return '/';
  }
  const BASE = computeBasePath();

  function absUrl(rel) {
    // Acepta URLs absolutas también
    try {
      const u = new URL(rel, location.origin + BASE);
      return u.href;
    } catch {
      return rel;
    }
  }

  async function fetchHtml(url) {
    const res = await fetch(url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now());
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
    return await res.text();
  }

  // Limpia el texto para embedding
  function cleanText(s) {
    return s
      .replace(/\s+/g, ' ')
      .replace(/(\n|\r)/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  // Extrae texto visible de un nodo evitando nav/scripts/styles/forms
  function visibleText(root) {
    const clone = root.cloneNode(true);
    clone.querySelectorAll('script,style,noscript,nav,header,footer,form,button').forEach(n => n.remove());
    return cleanText(clone.textContent || '');
  }

  // Partir texto en trozos por párrafos/frases
  function splitBySentences(txt, maxLen = 900, minLen = 280) {
    const sentences = txt.split(/(?<=[\.\!\?])\s+(?=[A-ZÁÉÍÓÚÑ0-9])/g);
    const chunks = [];
    let buf = '';
    for (const s of sentences) {
      if ((buf + ' ' + s).length > maxLen && buf.length >= minLen) {
        chunks.push(buf.trim());
        buf = s;
      } else {
        buf += (buf ? ' ' : '') + s;
      }
    }
    if (buf.trim()) chunks.push(buf.trim());
    return chunks;
  }

  // ====== Extracción por tipo de página ======

  function extractFromIndex(doc, url) {
    const out = [];
    // Secciones target
    const about = doc.querySelector('#about');
    const servs = doc.querySelector('#servicios');
    const contacto = doc.querySelector('#contacto');

    if (about) {
      const t = 'Quiénes Somos';
      const txt = visibleText(about);
      if (txt) out.push({ title: t, section: 'About', url: 'index.html#about', content: txt });
    }
    if (servs) {
      const t = 'Nuestros Servicios';
      const txt = visibleText(servs);
      if (txt) {
        // Trocear para que no quede demasiado largo
        splitBySentences(txt).forEach((chunk, i) => {
          out.push({ title: `${t}${out.length ? ` (${i+1})` : ''}`, section: 'Servicios', url: 'index.html#servicios', content: chunk });
        });
      }
    }
    if (contacto) {
      const t = 'Contacto';
      const txt = visibleText(contacto);
      if (txt) out.push({ title: t, section: 'Contacto', url: 'index.html#contacto', content: txt });
    }
    return out;
    }

  function extractFromService(doc, url) {
    const out = [];
    const main = doc.querySelector('main') || doc.body;
    const title = cleanText((doc.querySelector('h1')?.textContent) || (doc.title || 'Servicio'));
    const section = 'Servicio';

    // Dividir por headings H2/H3 como mini-secciones
    const blocks = [];
    let current = null;
    main.querySelectorAll('h2, h3, p, ul, ol').forEach(node => {
      if (node.matches('h2,h3')) {
        current && blocks.push(current);
        current = { heading: cleanText(node.textContent || ''), nodes: [] };
      } else {
        current = current || { heading: title, nodes: [] };
        current.nodes.push(node.cloneNode(true));
      }
    });
    current && blocks.push(current);

    blocks.forEach(b => {
      const wrapper = document.createElement('div');
      b.nodes.forEach(n => wrapper.appendChild(n));
      const txt = visibleText(wrapper);
      if (!txt) return;
      const chunks = splitBySentences(txt);
      chunks.forEach((chunk, i) => {
        out.push({
          title: `${title} — ${b.heading}${chunks.length > 1 ? ` (${i+1})` : ''}`,
          section,
          url,
          content: chunk
        });
      });
    });

    // Fallback: si no detectó nada, toma el texto de main
    if (!out.length) {
      const txt = visibleText(main);
      if (txt) {
        splitBySentences(txt).forEach((chunk, i) => {
          out.push({ title: `${title}${i?` (${i+1})`:''}`, section, url, content: chunk });
        });
      }
    }
    return out;
  }

  // Detección automática de /servicios/*.html desde index
  async function autoDetectServices() {
    log('Determinando páginas en /servicios/ …');
    const html = await fetchHtml(absUrl('index.html'));
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const links = Array.from(doc.querySelectorAll('a[href]'))
      .map(a => a.getAttribute('href'))
      .filter(h => !!h)
      .filter(h => /^servicios\/.+\.html$/i.test(h))
      .filter((v, i, arr) => arr.indexOf(v) === i); // únicos
    log('Encontradas:', links.length, '→', links.join(', '));
    return links;
  }

  // ====== Ensamblado final ======
  function toKbObjects(items) {
    // Con `id` reproducible
    return items.map((it, idx) => ({
      id: (it.title || 'item').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') + '-' + (idx+1),
      title: it.title,
      url: it.url,
      section: it.section,
      content: it.content
    }));
  }

  function getSynonyms() {
    // Puedes adaptar/expandir libremente
    return [
      ["gestión de proyectos","pmo","project management","dirección de proyectos","oficina de proyectos"],
      ["gestión contractual","cmo","contract management","contratos","reclamos","cambios","variaciones"],
      ["training","coaching","capacitación","formación","cursos","pdus"],
      ["ito","inspección técnica","supervisión","fiscalización"],
      ["kpi","indicadores","tableros","dashboards","valor ganado","spi","cpi"]
    ];
  }

  function downloadKb(kb) {
    const content =
`// Auto-generado con admin/build-kb.html
window.PARAGON_KB = ${JSON.stringify(kb, null, 2)};

window.PARAGON_SYNONYMS = ${JSON.stringify(getSynonyms(), null, 2)};
`;
    const blob = new Blob([content], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'kb.js';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ====== UI wiring ======
  async function runGenerate(seedList) {
    const pages = seedList
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .filter(s => !s.startsWith('#'));

    const all = [];
    for (const rel of pages) {
      try {
        const urlAbs = absUrl(rel);
        log('➜ Fetch', urlAbs);
        const html = await fetchHtml(urlAbs);
        const doc = new DOMParser().parseFromString(html, 'text/html');

        let items = [];
        if (/\/?index\.html?$/i.test(rel) || rel === '/' || rel === 'index.html') {
          items = extractFromIndex(doc, 'index.html');
        } else {
          items = extractFromService(doc, rel);
        }
        log('   ', items.length, 'bloques extraídos');
        all.push(...items);
      } catch (e) {
        log('   ERROR:', e.message);
      }
    }
    const kb = toKbObjects(all);
    log('\nTotal de fragmentos:', kb.length);
    downloadKb(kb);
  }

  async function runDetect() {
    try {
      const links = await autoDetectServices();
      const ta = document.getElementById('seed-urls');
      if (!ta) return;
      const set = new Set(ta.value.split('\n').map(s=>s.trim()).filter(Boolean));
      links.forEach(l => set.add(l));
      set.add('index.html');
      ta.value = Array.from(set).join('\n');
      log('Lista de rastreo actualizada.');
    } catch (e) {
      log('ERROR detectando:', e.message);
    }
  }

  // Botones
  document.addEventListener('DOMContentLoaded', () => {
    const detectBtn = document.getElementById('detect');
    const genBtn = document.getElementById('generate');
    const ta = document.getElementById('seed-urls');

    detectBtn?.addEventListener('click', runDetect);
    genBtn?.addEventListener('click', () => runGenerate(ta?.value || 'index.html'));
  });
})();
