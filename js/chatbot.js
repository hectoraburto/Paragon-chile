// js/chatbot.js
(function () {
  const EMAIL_DESTINO = "marcelo.diaz@paragon-chile.cl";
  const THRESHOLD_OK = 0.72;       // confianza mínima para “responder”
  const TOP_K = 3;                 // cuántos resultados mostrar como sugerencias
  const MAX_SNIPPET = 420;         // longitud de extracto en la respuesta

  function ready(fn){ document.readyState!=='loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }
  function el(tag, attrs={}, html=""){ const n=document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v)); if(html) n.innerHTML=html; return n; }
  function clip(txt, n){ return txt.length>n ? txt.slice(0,n-1)+"…" : txt; }
  function cosine(a, b){ // a,b arrays
    let dot=0, na=0, nb=0;
    for(let i=0;i<a.length;i++){ dot+=a[i]*b[i]; na+=a[i]*a[i]; nb+=b[i]*b[i]; }
    return dot / (Math.sqrt(na)*Math.sqrt(nb) + 1e-8);
  }

  // --- Carga dinámica de scripts (TFJS + USE) ---
  function loadScript(src){ return new Promise((res,rej)=>{ const s=el('script',{src,async:true}); s.onload=()=>res(); s.onerror=()=>rej(new Error("No se pudo cargar "+src)); document.head.appendChild(s); }); }
  async function loadUSE(){
    // Versiones probadas y livianas
    await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js");
    await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/universal-sentence-encoder@1.3.3/dist/universal-sentence-encoder.min.js");
    // global "use" lo expone el bundle anterior
    return await use.load();
  }

  // --- Normalización simple + sinonimia ---
  function normalize(q){
    let s = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""); // sin tildes
    if (Array.isArray(window.PARAGON_SYNONYMS)) {
      window.PARAGON_SYNONYMS.forEach(group=>{
        const main = group[0];
        group.slice(1).forEach(alt=>{
          const re = new RegExp("\\b"+alt+"\\b","g");
          s = s.replace(re, main);
        });
      });
    }
    return s;
  }

  // --- UI del chatbot (igual que antes, pero con “pensando…” y resultados) ---
  function buildUI(){
    // Botón flotante
    const btn = el('button', {class:'chatbot-btn', 'aria-label':'Abrir chat de ayuda'},
      `<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20 2H4C2.897 2 2 2.897 2 4v14c0 1.103.897 2 2 2h4v3l4-3h8c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-8H6V4h12v2z"></path>
      </svg>`);
    document.body.appendChild(btn);

    // Panel
    const panel = el('div', {class:'chatbot-panel'});
    panel.innerHTML = `
      <div class="chatbot-header">
        <strong>Asistente Paragon</strong>
        <button id="cbt-close" aria-label="Cerrar" style="background:transparent;border:0;color:#fff;font-size:18px;line-height:1;">×</button>
      </div>
      <div class="chatbot-body" id="cbt-body" role="log" aria-live="polite"></div>
      <div class="chatbot-input">
        <input id="cbt-input" type="text" placeholder="Escribe tu consulta sobre proyectos, contratos, training…" />
        <button id="cbt-send">Enviar</button>
      </div>
    `;
    document.body.appendChild(panel);

    const body = panel.querySelector('#cbt-body');
    const input = panel.querySelector('#cbt-input');
    const sendBtn = panel.querySelector('#cbt-send');

    const addMsg = (who, html) => {
      const b = el('div'); b.style.margin = '8px 0';
      b.innerHTML = `<div style="font-size:12px;color:#6b7280;">${who}</div><div>${html}</div>`;
      body.appendChild(b); body.scrollTop = body.scrollHeight;
    };

    const setThinking = (on) => {
      let spinner = panel.querySelector('#cbt-thinking');
      if (on && !spinner){
        spinner = el('div',{id:'cbt-thinking'}, `<div style="display:flex;align-items:center;gap:8px;color:#6b7280;font-size:14px;">
          <span class="loader" style="width:12px;height:12px;border:2px solid #d1d5db;border-top-color:#6b7280;border-radius:9999px;display:inline-block;animation:spin 0.9s linear infinite"></span>
          Pensando…
        </div>`);
        body.appendChild(spinner); body.scrollTop = body.scrollHeight;
      } else if (!on && spinner){ spinner.remove(); }
    };

    // Mensaje de bienvenida
    addMsg('Paragon', '¡Hola! Soy el asistente del sitio. Puedo responder sobre Gestión de Proyectos, Gestión Contractual, Training & Coaching y otros servicios. Pregúntame: <em>“¿Qué incluye la PMO?”</em> o <em>“¿Hacen ITO?”</em>');

    // Toggle panel
    const toggle = () => { panel.style.display = (panel.style.display==='block' ? 'none' : 'block'); };
    btn.addEventListener('click', toggle);
    panel.querySelector('#cbt-close').addEventListener('click', toggle);

    return { addMsg, setThinking, input, sendBtn, panel, body };
  }

  // --- Núcleo semántico ---
  async function setupSemanticKernel(ui){
    // Garantiza que KB esté disponible
    const KB = (window.PARAGON_KB || []).slice();
    if (!KB.length){
      ui.addMsg('Paragon', 'Aún no tengo conocimiento cargado. Por favor agrega contenido en <code>js/kb.js</code>.');
      return { ready: false };
    }

    ui.addMsg('Paragon', 'Cargando conocimiento…');

    // Carga el modelo USE
    let model;
    try {
      model = await loadUSE();
    } catch (e) {
      ui.addMsg('Paragon', 'No pude cargar el motor semántico. ¿Conexión a internet OK?');
      console.error(e);
      return { ready: false };
    }

    // Embeddings del KB
    const texts = KB.map(x => x.content);
    const embTensor = await model.embed(texts);
    const embKB = await embTensor.array();
    embTensor.dispose?.();

    // Buscador
    async function query(q){
      const qn = normalize(q);
      const qt = await model.embed([qn]);
      const qv = (await qt.array())[0];
      qt.dispose?.();

      const scored = KB.map((doc, i) => ({
        doc,
        score: cosine(qv, embKB[i])
      })).sort((a,b)=>b.score-a.score);

      return scored;
    }

    ui.addMsg('Paragon', '¡Listo! Ya puedo responder según el contenido del sitio.');
    return { ready: true, query };
  }

  // --- Respuesta con formato y sugerencias ---
  function renderAnswer(ui, results, userText){
    const top = results[0];
    if (!top) {
      return ui.addMsg('Paragon', 'No encontré información relevante aún. ¿Puedes reformular tu consulta?');
    }

    if (top.score >= THRESHOLD_OK){
      const txt = clip(top.doc.content, MAX_SNIPPET);
      const url = top.doc.url;
      ui.addMsg('Paragon', `
        <div style="margin-bottom:6px"><strong>${top.doc.title}</strong></div>
        <div>${txt}</div>
        <div style="margin-top:8px"><a href="${url}" class="hover:underline" target="_blank" rel="noopener">Ver más →</a></div>
        <div style="margin-top:6px;font-size:12px;color:#6b7280">Confianza: ${(top.score*100).toFixed(0)}%</div>
      `);
    } else {
      ui.addMsg('Paragon', `No estoy 100% seguro. Esto es lo más cercano:`);

      const k = Math.min(TOP_K, results.length);
      let html = '<ol style="padding-left:18px; margin:6px 0">';
      for (let i=0;i<k;i++){
        const r = results[i];
        html += `<li style="margin:6px 0">
          <strong>${r.doc.title}</strong> — <span style="color:#6b7280">${(r.score*100).toFixed(0)}%</span><br>
          ${clip(r.doc.content, 180)} <a href="${r.doc.url}" target="_blank" rel="noopener">Ver</a>
        </li>`;
      }
      html += '</ol>';
      ui.addMsg('Paragon', html);

      // Sugerir contacto por correo
      const subject = encodeURIComponent('Consulta sitio Paragon');
      const bodyMail = encodeURIComponent(`${userText}\n\n--\nEnviado desde el sitio: ${location.href}`);
      const mailto = `mailto:${EMAIL_DESTINO}?subject=${subject}&body=${bodyMail}`;
      ui.addMsg('Paragon', `¿Quieres que lo revisemos contigo? <a href="${mailto}">Enviar por correo</a>`);
    }
  }

  // --- Arranque ---
  ready(async () => {
    const ui = buildUI();

    // Cargar KB (asegúrate de incluir <script src="js/kb.js"></script> antes de js/chatbot.js)
    if (!window.PARAGON_KB) {
      ui.addMsg('Paragon', 'No encuentro la base de conocimiento (js/kb.js). Asegúrate de incluirla.');
      return;
    }

    // Configura motor semántico
    const kernel = await setupSemanticKernel(ui);
    if (!kernel.ready) return;

    // Enviar
    async function onSend(){
      const text = ui.input.value.trim();
      if (!text) return;
      ui.addMsg('Tú', text);
      ui.input.value = "";

      ui.setThinking(true);
      try {
        const results = await kernel.query(text);
        ui.setThinking(false);
        renderAnswer(ui, results, text);
      } catch (e) {
        ui.setThinking(false);
        console.error(e);
        ui.addMsg('Paragon', 'Ocurrió un problema al procesar tu consulta.');
      }
    }

    ui.sendBtn.addEventListener('click', onSend);
    ui.input.addEventListener('keydown', (e)=>{ if (e.key==='Enter') onSend(); });
  });

  // CSS para spinner (aprovechando el mismo archivo)
  const style = document.createElement('style');
  style.textContent = `@keyframes spin{to{transform:rotate(360deg)}}`;
  document.head.appendChild(style);
})();
