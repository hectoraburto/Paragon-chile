// js/kb.js
// Base de conocimiento del sitio Paragon (editable por Héctor).
// Cada item debe representar una idea/servicio/sección autocontenida.

window.PARAGON_KB = [
  {
    id: "quienes-somos",
    title: "Quiénes Somos",
    url: "index.html#about",
    section: "About",
    content:
      "Paragon Project Partners es una firma registrada en el PMI® con operaciones principalmente en Chile. Nuestra metodología se basa en estándares del PMI® y se aplica a proyectos complejos en minería, energía e infraestructura. Acompañamos a los clientes en todas las fases, desde la planificación hasta el cierre, con enfoque preventivo y resolutivo para asegurar resultados."
  },
  {
    id: "serv-proyectos-que-hacemos",
    title: "Gestión de Proyectos (PMO®) – Qué hacemos",
    url: "servicios/gestion-proyectos.html",
    section: "Servicios / Gestión de Proyectos",
    content:
      "Implementamos gobierno y buenas prácticas de gestión de proyectos (PMBOK®/PMI®) habilitando visibilidad temprana de desvíos. Nuestro modelo PMO® puede operar como servicio (PMO as a Service) o integrarse a tu organización. Incluye planificación maestra (WBS/EDT y cronogramas), gestión de costos, riesgos, cambios y adquisiciones, con reportabilidad ejecutiva y tableros KPI."
  },
  {
    id: "serv-proyectos-beneficios",
    title: "Gestión de Proyectos – Beneficios",
    url: "servicios/gestion-proyectos.html",
    section: "Servicios / Gestión de Proyectos",
    content:
      "La PMO® de Paragon aporta disminución de riesgos y reclamos, mayor predictibilidad en plazos y costos, transparencia para directorio y patrocinadores, y mejora la madurez organizacional. Entregables: Plan de Gestión del Proyecto, EDT/WBS y cronogramas (MS Project/Primavera), matriz de riesgos, tableros con SPI/CPI y valor ganado."
  },
  {
    id: "serv-contratos-que-hacemos",
    title: "Gestión Contractual (CMO®) – Qué hacemos",
    url: "servicios/gestion-contractual.html",
    section: "Servicios / Gestión Contractual",
    content:
      "Operamos una CMO® que articula el ciclo de vida del contrato desde licitación y adjudicación hasta ejecución, control de cambios y cierre. Trabajamos con matriz de obligaciones y riesgos, bitácoras y evidencia trazable, RFC/VO, reuniones de seguimiento y mecanismos de resolución temprana de controversias, alineando Proyecto–Contrato junto a la PMO®."
  },
  {
    id: "serv-contratos-beneficios",
    title: "Gestión Contractual – Beneficios",
    url: "servicios/gestion-contractual.html",
    section: "Servicios / Gestión Contractual",
    content:
      "Beneficios: reducción de riesgos y reclamos, mayor predictibilidad de costos y plazos contractuales, mejora de compliance y gobernanza, relaciones colaborativas con contratistas/mandantes. Entregables: plan de gestión contractual, procedimiento de cambios, registro de eventos y evidencias, informes de avance contractual y KPI ejecutivos. (No constituye asesoría legal)."
  },
  {
    id: "serv-training",
    title: "Training & Coaching – Programas",
    url: "servicios/training-coaching.html",
    section: "Servicios / Training & Coaching",
    content:
      "Programas de formación y coaching en gestión de proyectos y contratos con foco PMI®. Contenidos: fundamentos PMBOK, gestión contractual aplicada, riesgos, cronogramas, valor ganado y tableros KPI, además de liderazgo, negociación y comunicación. Modalidades: in-company, abiertos, coaching 1:1 y formatos híbridos con aplicación inmediata en proyectos reales."
  },
  {
    id: "serv-otros",
    title: "Otros Servicios",
    url: "servicios/otros-servicios.html",
    section: "Servicios / Otros",
    content:
      "Servicios complementarios: ITO/supervisión técnica, auditorías y due diligence, peritajes técnicos (no legal), soporte a licitaciones (bases, evaluación, aclaraciones y adjudicación), diagnóstico de madurez en PM/CM y tableros KPI ejecutivos. Beneficios: mayor control de calidad y seguridad, riesgos visibles y decisiones oportunas, procesos de compra más robustos."
  },
  {
    id: "contacto",
    title: "Contacto y Ubicación",
    url: "index.html#contacto",
    section: "Contacto",
    content:
      "¿Tienes un proyecto en mente? Contáctanos. Dirección: Napoleón N° 3565 Of.904, Las Condes, Santiago, Chile. Teléfono: +56 2 2993 5424. Email: marcelo.diaz@paragon-chile.cl. También estamos en LinkedIn: Paragon Project Partners."
  }
];

// (Opcional) sinónimos y palabras clave para mejorar recall básico (antes de embeddings)
window.PARAGON_SYNONYMS = [
  ["gestión de proyectos","pmo","project management","dirección de proyectos"],
  ["gestión contractual","cmo","contract management","contratos","reclamos"],
  ["training","coaching","capacitación","formación","cursos"],
  ["ito","inspección técnica","supervisión","fiscalización"],
  ["kpi","indicadores","tableros","dashboards"]
];
