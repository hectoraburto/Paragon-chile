// js/chatbot.js
(function () {
  const EMAIL_DESTINO = "marcelo.diaz@paragon-chile.cl"; // puedes cambiarlo si es necesario

  function ready(fn){ document.readyState!=='loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }

  const qa = [
    { q: "¿Qué servicios ofrecen?", a: "Gestión Contractual (CMO®), Gestión de Proyectos (PMO®), Training & Coaching y otros servicios como ITO, peritajes y estudios especializados." },
    { q: "¿En qué industrias tienen experiencia?", a: "Minería, energía e infraestructura, entre otras, con presencia en Chile y Ecuador." },
    { q: "¿Trabajan bajo estándares PMI®?", a: "Sí, nuestra metodología se basa en lineamientos del PMI® y podemos emitir PDUs como R.E.P." },
  ];

  function saveHistory(arr){ try{ localStorage.setItem('paragon_chat_history', JSON.stringify(arr)); }catch(e){} }
  function loadHistory(){ try{ return JSON.parse(localStorage.getItem('paragon_chat_history')||"[]"); }catch(e){ return []; } }

  function createUI(){
    // Botón flotante
    const btn = document.createElement('button');
    btn.className = 'chatbot-btn';
    btn.setAttribute('aria-label', 'Abrir chat de ayuda');
    btn.innerHTML = `
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20 2H4C2.897 2 2 2.897 2 4v14c0 1.103.897 2 2 2h4v3l4-3h8c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-8H6V4h12v2z"></path>
      </svg>`;
    document.body.appendChild(btn);

    // Panel
    const panel = document.createElement('div');
    panel.className = 'chatbot-panel';
    panel.innerHTML = `
      <div class="chatbot-header">
        <strong>Asistente Paragon</strong>
        <button id="cbt-close" aria-label="Cerrar" style="background:transparent;border:0;color:#fff;font-size:18px;line-height:1;">×</button>
      </div>
      <div class="chatbot-body" id="cbt-body" role="log" aria-live="polite"></div>
      <div class="chatbot-input">
        <input id="cbt-input" type="text" placeholder="Escribe tu consulta..." />
        <button id="cbt-send">Enviar</button>
      </div>
    `;
    document.body.appendChild(panel);

    // Pinta Q&A iniciales y el historial
    const body = panel.querySelector('#cbt-body');
    const history = loadHistory();

    const addMsg = (who, text) => {
      const b = document.createElement('div');
      b.style.margin = '8px 0';
      b.innerHTML = `<div style="font-size:12px;color:#6b7280;">${who}</div><div>${text}</div>`;
      body.appendChild(b);
      body.scrollTop = body.scrollHeight;
    };

    // Mensaje de bienvenida
    addMsg('Paragon', '¡Hola! ¿Cómo podemos ayudarte hoy? Aquí tienes algunas preguntas frecuentes:');
    qa.forEach(item => addMsg('FAQ', `<strong>${item.q}</strong><br>${item.a}`));
    history.forEach(h => addMsg(h.who, h.text));

    // Acciones
    const toggle = () => { panel.style.display = (panel.style.display==='block' ? 'none' : 'block'); };
    btn.addEventListener('click', toggle);
    panel.querySelector('#cbt-close').addEventListener('click', toggle);

    const input = panel.querySelector('#cbt-input');
    const sendBtn = panel.querySelector('#cbt-send');

    function send(){
      const text = input.value.trim();
      if (!text) return;
      addMsg('Tú', text);
      const hist = loadHistory(); hist.push({who:'Tú', text}); saveHistory(hist);

      // Respuesta simple por keyword (muy básico)
      const hit = qa.find(item => text.toLowerCase().includes(item.q.toLowerCase().slice(0,8)));
      if (hit) { addMsg('Paragon', hit.a); hist.push({who:'Paragon', text: hit.a}); saveHistory(hist); }

      // Ofrecer envío por email
      const subject = encodeURIComponent('Consulta sitio Paragon');
      const bodyMail = encodeURIComponent(`${text}\n\n--\nEnviado desde el sitio: ${location.href}`);
      const mailto = `mailto:${EMAIL_DESTINO}?subject=${subject}&body=${bodyMail}`;
      addMsg('Paragon', `¿Deseas continuar por correo? <a href="${mailto}">Click aquí para enviar</a>`);
      hist.push({who:'Paragon', text:`¿Deseas continuar por correo? <a href="${mailto}">Click aquí para enviar</a>`}); saveHistory(hist);

      input.value = '';
    }
    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => { if (e.key==='Enter') send(); });
  }

  ready(createUI);
})();
