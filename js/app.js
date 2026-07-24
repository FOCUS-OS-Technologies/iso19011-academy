const data = window.COURSE_DATA;
const STORAGE_KEY = 'iso19011_state';

const defaultState = {
  completed: {},
  scores: {},
  current: 0,
  name: '',
  simulation: { completed: false, score: null, answers: {}, completedAt: null },
  diagnostic: {
    started: false,
    completed: false,
    profile: {},
    answers: {},
    score: null,
    level: '',
    startedAt: null,
    completedAt: null
  }
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      ...defaultState,
      ...saved,
      completed: saved.completed || {},
      scores: saved.scores || {},
      simulation: { ...defaultState.simulation, ...(saved.simulation || {}) },
      diagnostic: {
        ...defaultState.diagnostic,
        ...(saved.diagnostic || {})
      }
    };
  } catch (error) {
    console.error('No se pudo leer el progreso guardado:', error);
    return structuredClone(defaultState);
  }
}

let state = loadState();
const $ = (selector) => document.querySelector(selector);
const main = $('#content');
const nav = $('#moduleNav');


const moduleVisuals = {
  1: `<figure class="module-hero-visual"><img src="./assets/course/part1-foundations.svg" alt="Flujo visual desde el criterio hasta la conclusión de auditoría"></figure>`,
  2: `<figure class="module-hero-visual"><img src="./assets/course/part2-program.svg" alt="Programa de auditoría basado en objetivos y riesgos"></figure>`,
  3: `<figure class="module-hero-visual"><img src="./assets/course/part3-execution.svg" alt="Métodos de ejecución de auditoría"></figure>`,
  4: `<figure class="module-hero-visual"><img src="./assets/course/part4-findings.svg" alt="Construcción objetiva de hallazgos"></figure>`,
  5: `<figure class="module-hero-visual"><img src="./assets/course/part5-competence.svg" alt="Ruta de desarrollo de competencia del auditor"></figure>`
};

const lessonVisuals = {
  '1-2': ['./assets/course/audit-types.svg', 'Diferencia entre auditorías de primera, segunda y tercera parte'],
  '1-3': ['./assets/course/audit-types.svg', 'Tipos de auditoría y su propósito'],
  '1-4': ['./assets/course/principles-wheel.svg', 'Los siete principios que sostienen una auditoría confiable'],
  '2-2': ['./assets/course/risk-matrix.svg', 'Priorización del programa según riesgo y desempeño'],
  '2-4': ['./assets/course/audit-plan.svg', 'Elementos esenciales de un plan de auditoría'],
  '3-2': ['./assets/course/evidence.svg', 'Fuentes complementarias de evidencia objetiva'],
  '3-3': ['./assets/course/interview.svg', 'Secuencia de una entrevista eficaz'],
  '3-4': ['./assets/course/traceability.svg', 'Ruta de trazabilidad en manufactura'],
  '4-2': ['./assets/course/finding.svg', 'Estructura de un hallazgo claro y trazable'],
  '4-5': ['./assets/course/closing.svg', 'Comunicación de resultados en la reunión de cierre'],
  '5-4': ['./assets/course/simulation.svg', 'Aplicación integrada de conocimientos en el caso práctico']
};

function lessonVisual(moduleId, lessonIndex) {
  const visual = lessonVisuals[`${moduleId}-${lessonIndex + 1}`];
  if (!visual) return '';
  return `<figure class="lesson-visual"><img src="${visual[0]}" alt="${visual[1]}" loading="lazy"><figcaption>${visual[1]}</figcaption></figure>`;
}

const simulationQuestions = [
  {
    title: '1. Planeación de la auditoría',
    text: 'Se auditará el proceso de estampado del número de parte BRK-204. El cliente reportó una dimensión fuera de especificación. ¿Cuál es el objetivo mejor formulado?',
    options: [
      'Encontrar al responsable del defecto',
      'Evaluar si los controles del proceso de estampado aseguran el cumplimiento de requisitos dimensionales y de reacción',
      'Revisar todos los procesos de la empresa',
      'Confirmar que el producto siempre sale bien'
    ], answer: 1, area: 'Planeación'
  },
  {
    title: '2. Revisión documental',
    text: 'El plano vigente es revisión F, pero la instrucción de inspección disponible en la prensa hace referencia a revisión D. ¿Cómo debe tratarse?',
    options: ['Conforme', 'Observación sin evidencia', 'No conformidad por uso de información documentada obsoleta', 'No aplica'], answer: 2, area: 'Revisión documental'
  },
  {
    title: '3. Evidencia en piso',
    text: 'El calibrador usado para liberar la primera pieza no tiene identificación visible. El supervisor afirma que está calibrado, pero no localiza el registro. ¿Qué debe hacer el auditor?',
    options: ['Aceptar la explicación', 'Declarar de inmediato una no conformidad mayor', 'Solicitar evidencia trazable y corroborar el estado del equipo antes de concluir', 'Ignorar el tema porque la pieza ya fue liberada'], answer: 2, area: 'Obtención de evidencia'
  },
  {
    title: '4. Reacción ante proceso fuera de control',
    text: 'El registro SPC muestra Cpk 0.82 en una característica especial. Se fabricaron 8,500 piezas y no existe evidencia de contención ni escalamiento. ¿Cuál es la respuesta más adecuada?',
    options: ['Continuar porque existe inspección final', 'Comunicar el riesgo de inmediato, ampliar la evidencia y verificar el plan de reacción', 'Esperar a la reunión de cierre', 'Cambiar el límite de control'], answer: 1, area: 'Juicio del auditor'
  },
  {
    title: '5. Redacción del hallazgo',
    text: '¿Cuál redacción es más sólida?',
    options: [
      'El operador trabaja mal y debe ser reentrenado',
      'Se recomienda mejorar el control del proceso',
      'El Plan de Control PC-BRK-204 rev. F requiere aplicar el plan de reacción ante pérdida de capacidad; en los registros del turno 2 del 23/07 se observó Cpk 0.82 sin evidencia de contención, escalamiento ni evaluación de las 8,500 piezas producidas',
      'La gerencia no está comprometida'
    ], answer: 2, area: 'Redacción'
  },
  {
    title: '6. Seguimiento',
    text: 'La organización ajustó el troquel y reinspeccionó el lote. ¿Qué falta para demostrar eficacia?',
    options: ['Nada; la corrección es suficiente', 'Verificar que la causa fue eliminada y que el desempeño se mantiene sin recurrencia', 'Cerrar por cumplimiento de fecha', 'Emitir otra observación'], answer: 1, area: 'Seguimiento'
  }
];

const diagnosticProfileQuestions = [
  {
    id: 'experience',
    label: '¿Has participado anteriormente en una auditoría?',
    options: ['Nunca', 'Como auditado', 'Como observador', 'Como auditor', 'Como auditor líder']
  },
  {
    id: 'role',
    label: '¿Cuál es tu función principal en la organización?',
    options: ['Dirección / Gerencia', 'Calidad / Sistemas de gestión', 'Producción / Operaciones', 'Ingeniería', 'Compras / Proveedores', 'Otra']
  },
  {
    id: 'years',
    label: '¿Cuántos años de experiencia tienes en sistemas de gestión?',
    options: ['Sin experiencia', 'Menos de 1 año', '1 a 3 años', '4 a 7 años', 'Más de 7 años']
  },
  {
    id: 'auditTypes',
    label: '¿Qué tipo de auditoría conoces mejor?',
    options: ['Ninguna', 'Primera parte / interna', 'Segunda parte / proveedor', 'Tercera parte / certificación', 'Varias de las anteriores']
  },
  {
    id: 'expectation',
    label: '¿Cuál es tu principal expectativa del curso?',
    options: ['Comprender los fundamentos', 'Preparar auditorías internas', 'Mejorar entrevistas y evidencias', 'Redactar mejores hallazgos', 'Desarrollarme como auditor líder']
  }
];

const diagnosticQuestions = [
  {
    q: '¿Cuál es el propósito principal de una auditoría de sistemas de gestión?',
    options: ['Encontrar culpables', 'Obtener evidencia objetiva y evaluarla frente a criterios establecidos', 'Sustituir la responsabilidad de la dirección', 'Inspeccionar exclusivamente el producto terminado'],
    answer: 1,
    topic: 'Fundamentos'
  },
  {
    q: '¿Qué es un criterio de auditoría?',
    options: ['La opinión personal del auditor', 'El conjunto de requisitos usado como referencia para comparar la evidencia', 'El reporte final de auditoría', 'La experiencia profesional del auditado'],
    answer: 1,
    topic: 'Criterios y evidencia'
  },
  {
    q: '¿Qué se entiende por evidencia de auditoría?',
    options: ['Rumores sobre el proceso', 'Información verificable relacionada con los criterios de auditoría', 'Únicamente documentos impresos', 'La experiencia previa del auditor'],
    answer: 1,
    topic: 'Criterios y evidencia'
  },
  {
    q: '¿Cuál de los siguientes es un principio asociado con la auditoría?',
    options: ['Confidencialidad', 'Improvisación', 'Autoridad absoluta', 'Sanción inmediata'],
    answer: 0,
    topic: 'Principios'
  },
  {
    q: 'Una auditoría de primera parte es realizada normalmente por:',
    options: ['Un cliente', 'Un organismo certificador', 'La propia organización o en su nombre', 'Una autoridad gubernamental exclusivamente'],
    answer: 2,
    topic: 'Tipos de auditoría'
  },
  {
    q: '¿Cuál es la diferencia principal entre una auditoría y una inspección?',
    options: ['No existe diferencia', 'La auditoría evalúa procesos y sistemas frente a criterios; la inspección suele verificar características específicas', 'La inspección siempre es más importante', 'La auditoría solamente revisa documentos'],
    answer: 1,
    topic: 'Fundamentos'
  },
  {
    q: '¿Qué debe hacer un auditor cuando encuentra una posible desviación?',
    options: ['Emitir inmediatamente una sanción', 'Recopilar y verificar evidencia suficiente antes de formular el hallazgo', 'Ignorarla si el responsable explica la situación', 'Modificar el criterio de auditoría'],
    answer: 1,
    topic: 'Ejecución'
  },
  {
    q: '¿Qué característica debe tener una conclusión de auditoría?',
    options: ['Basarse en percepciones', 'Basarse en los objetivos, hallazgos y evidencia disponible', 'Favorecer siempre a la organización', 'Ser definida antes de comenzar la auditoría'],
    answer: 1,
    topic: 'Hallazgos y conclusiones'
  },
  {
    q: '¿Qué es un programa de auditoría?',
    options: ['Una sola lista de verificación', 'El conjunto de una o más auditorías planificadas para un periodo y propósito determinados', 'El informe de una auditoría individual', 'La agenda de la reunión de apertura'],
    answer: 1,
    topic: 'Programa de auditoría'
  },
  {
    q: '¿Qué enfoque debe priorizarse al planificar y ejecutar auditorías?',
    options: ['La cantidad de preguntas realizadas', 'Los riesgos y oportunidades relacionados con los objetivos de auditoría', 'La antigüedad de los auditados', 'La duración máxima de la auditoría'],
    answer: 1,
    topic: 'Enfoque basado en riesgos'
  }
];

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateProgress();
}

function totalModules() {
  return data.length + 1;
}

function completedCount() {
  return (state.diagnostic.completed ? 1 : 0) + Object.values(state.completed).filter(Boolean).length;
}

function updateProgress() {
  const done = completedCount();
  const pct = Math.round((done / totalModules()) * 100);

  $('#progressFill').style.width = `${pct}%`;
  $('#progressLabel').textContent =
    `${done} de ${totalModules()} partes completadas · ${pct}%`;
}

function buildNav() {
  nav.innerHTML = '';

  const diagnosticButton = document.createElement('button');
  diagnosticButton.textContent = state.diagnostic.completed
    ? '✓ Parte 0: Inducción y diagnóstico'
    : 'Parte 0: Inducción y diagnóstico';
  diagnosticButton.className = Number(state.current) === 0 ? 'active' : '';
  diagnosticButton.onclick = () => {
    state.current = 0;
    save();
    renderDiagnostic();
    buildNav();
    window.scrollTo(0, 0);
  };
  nav.appendChild(diagnosticButton);

  data.forEach((module) => {
    const button = document.createElement('button');
    button.textContent = `Parte ${module.id}: ${module.title}`;
    button.className = Number(state.current) === module.id ? 'active' : '';
    button.disabled = !state.diagnostic.completed;
    button.title = button.disabled ? 'Completa primero la Parte 0' : '';
    button.onclick = () => {
      if (!state.diagnostic.completed) return;
      state.current = module.id;
      save();
      renderModule(module.id);
      buildNav();
      window.scrollTo(0, 0);
    };
    nav.appendChild(button);
  });
}

function renderDiagnostic() {
  if (state.diagnostic.completed) {
    renderDiagnosticResult();
    return;
  }

  if (!state.diagnostic.started) {
    main.innerHTML = `
      <section class="hero diagnostic-hero">
        <div class="meta">MÓDULO 0 · 10–15 MINUTOS</div>
        <span class="diagnostic-badge">Evaluación inicial obligatoria</span>
        <h2>Antes de comenzar</h2>
        <p class="lead">Esta inducción permite conocer tu experiencia y comprensión inicial sobre auditorías de sistemas de gestión.</p>
        <div class="diagnostic-grid">
          <article><strong>15 preguntas</strong><span>5 de perfil y 10 de conocimiento</span></article>
          <article><strong>Sin aprobación mínima</strong><span>El resultado no afecta tu calificación final</span></article>
          <article><strong>Un intento</strong><span>Responde con tus conocimientos actuales</span></article>
          <article><strong>Resultado privado</strong><span>Identifica fortalezas y áreas de estudio</span></article>
        </div>
        <div class="callout key"><strong>Importante:</strong> no consultes materiales externos. El propósito es establecer tu punto de partida antes del curso.</div>
        <button class="btn diagnostic-start" id="startDiagnostic">Comenzar evaluación diagnóstica</button>
      </section>`;

    $('#startDiagnostic').onclick = () => {
      state.diagnostic.started = true;
      state.diagnostic.startedAt = new Date().toISOString();
      save();
      renderDiagnostic();
    };
    return;
  }

  const profileHtml = diagnosticProfileQuestions.map((question, index) => `
    <div class="question diagnostic-question">
      <strong>${index + 1}. ${question.label}</strong>
      ${question.options.map((option) => `
        <label><input type="radio" name="profile-${question.id}" value="${escapeHtml(option)}"> ${escapeHtml(option)}</label>
      `).join('')}
    </div>`).join('');

  const knowledgeHtml = diagnosticQuestions.map((question, index) => `
    <div class="question diagnostic-question">
      <strong>${index + 6}. ${question.q}</strong>
      ${question.options.map((option, optionIndex) => `
        <label><input type="radio" name="diagnostic-${index}" value="${optionIndex}"> ${escapeHtml(option)}</label>
      `).join('')}
    </div>`).join('');

  main.innerHTML = `
    <section class="hero diagnostic-hero compact">
      <div class="meta">MÓDULO 0 · EVALUACIÓN DIAGNÓSTICA</div>
      <h2>Tu punto de partida</h2>
      <p>Contesta todas las preguntas. Una vez enviado, el intento quedará cerrado.</p>
    </section>
    <form id="diagnosticForm">
      <section class="quiz diagnostic-section">
        <div class="section-heading"><span>A</span><div><h3>Perfil del participante</h3><p>Estas respuestas no tienen una opción correcta.</p></div></div>
        ${profileHtml}
      </section>
      <section class="quiz diagnostic-section">
        <div class="section-heading"><span>B</span><div><h3>Conocimiento inicial</h3><p>Selecciona la mejor respuesta con base en lo que sabes hoy.</p></div></div>
        ${knowledgeHtml}
        <div id="diagnosticError" class="feedback bad hidden"></div>
        <button class="btn" type="submit">Enviar evaluación diagnóstica</button>
      </section>
    </form>`;

  $('#diagnosticForm').addEventListener('submit', submitDiagnostic);
}

function submitDiagnostic(event) {
  event.preventDefault();

  const profile = {};
  const answers = {};
  let missing = 0;

  diagnosticProfileQuestions.forEach((question) => {
    const selected = document.querySelector(`input[name="profile-${question.id}"]:checked`);
    if (!selected) missing += 1;
    else profile[question.id] = selected.value;
  });

  diagnosticQuestions.forEach((question, index) => {
    const selected = document.querySelector(`input[name="diagnostic-${index}"]:checked`);
    if (!selected) missing += 1;
    else answers[index] = Number(selected.value);
  });

  if (missing > 0) {
    const errorBox = $('#diagnosticError');
    errorBox.textContent = `Faltan ${missing} respuesta${missing === 1 ? '' : 's'}. Completa toda la evaluación antes de enviarla.`;
    errorBox.classList.remove('hidden');
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  if (!confirm('¿Enviar la evaluación? Después no podrás modificar tus respuestas.')) return;

  const correct = diagnosticQuestions.reduce((total, question, index) => {
    return total + (answers[index] === question.answer ? 1 : 0);
  }, 0);
  const score = Math.round((correct / diagnosticQuestions.length) * 100);

  state.diagnostic = {
    ...state.diagnostic,
    completed: true,
    profile,
    answers,
    score,
    level: diagnosticLevel(score),
    completedAt: new Date().toISOString()
  };
  state.current = 0;
  save();
  buildNav();
  renderDiagnosticResult();
  window.scrollTo(0, 0);
}

function diagnosticLevel(score) {
  if (score < 40) return 'Nivel introductorio';
  if (score < 70) return 'Conocimiento básico';
  if (score < 85) return 'Conocimiento intermedio';
  return 'Conocimiento avanzado';
}

function diagnosticInsights() {
  const resultsByTopic = {};
  diagnosticQuestions.forEach((question, index) => {
    if (!resultsByTopic[question.topic]) resultsByTopic[question.topic] = { correct: 0, total: 0 };
    resultsByTopic[question.topic].total += 1;
    if (state.diagnostic.answers[index] === question.answer) resultsByTopic[question.topic].correct += 1;
  });

  const ordered = Object.entries(resultsByTopic)
    .map(([topic, result]) => ({ topic, ratio: result.correct / result.total }))
    .sort((a, b) => b.ratio - a.ratio);

  return {
    strengths: ordered.filter((item) => item.ratio >= 0.75).slice(0, 3).map((item) => item.topic),
    opportunities: ordered.filter((item) => item.ratio < 0.75).sort((a, b) => a.ratio - b.ratio).slice(0, 3).map((item) => item.topic)
  };
}

function renderDiagnosticResult() {
  const { strengths, opportunities } = diagnosticInsights();
  const score = state.diagnostic.score;
  const date = state.diagnostic.completedAt
    ? new Date(state.diagnostic.completedAt).toLocaleString('es-MX')
    : '';

  main.innerHTML = `
    <section class="hero diagnostic-result">
      <div class="meta">MÓDULO 0 COMPLETADO</div>
      <div class="result-icon">✓</div>
      <h2>Evaluación diagnóstica completada</h2>
      <p>Este resultado representa tu punto de partida y no afecta la calificación final del curso.</p>
      <div class="score-ring" style="--score:${score}"><strong>${score}%</strong><span>${state.diagnostic.level}</span></div>
      <div class="result-columns">
        <article>
          <h3>Fortalezas identificadas</h3>
          ${strengths.length ? `<ul>${strengths.map((topic) => `<li>✓ ${topic}</li>`).join('')}</ul>` : '<p>El curso te ayudará a construir una base completa desde el inicio.</p>'}
        </article>
        <article>
          <h3>Áreas recomendadas</h3>
          ${opportunities.length ? `<ul>${opportunities.map((topic) => `<li>• ${topic}</li>`).join('')}</ul>` : '<p>Tu base inicial es sólida. Enfócate en profundizar y aplicar los conceptos.</p>'}
        </article>
      </div>
      <p class="small">Aplicada: ${date}</p>
      <button class="btn diagnostic-start" onclick="goModule(1)">Iniciar Parte 1 →</button>
    </section>`;
}

function renderModule(id) {
  if (!state.diagnostic.completed) {
    state.current = 0;
    save();
    buildNav();
    renderDiagnostic();
    return;
  }

  const module = data.find((item) => item.id === Number(id));
  let html = `<section class="hero">
    <div class="meta">PARTE ${module.id} · ${module.duration}</div>
    <h2>${module.title}</h2>
    <h4>Objetivos de aprendizaje</h4>
    <ul class="objectives">${module.objectives.map((objective) => `<li>${objective}</li>`).join('')}</ul>
    ${moduleVisuals[module.id] || ''}
  </section>`;

  module.lessons.forEach((lesson, lessonIndex) => {
    html += `<section class="lesson"><h3>${lesson.title}</h3>${lessonVisual(module.id, lessonIndex)}${lesson.content}</section>`;
  });

  html += renderQuiz(module);
  if (module.id === 5) html += renderSimulation();
  html += `<div class="module-footer">
    <button class="btn secondary" onclick="goModule(${module.id - 1})">← ${module.id === 1 ? 'Diagnóstico' : 'Parte anterior'}</button>
    <button class="btn" onclick="markComplete(${module.id})">Marcar parte como completada</button>
    <button class="btn secondary" ${module.id === data.length ? 'disabled' : ''} onclick="goModule(${module.id + 1})">Parte siguiente →</button>
  </div>`;
  main.innerHTML = html;
}

function renderQuiz(module) {
  return `<section class="quiz"><h3>Autoevaluación de la Parte ${module.id}</h3>
  <p>Contesta y presiona “Calificar”. Recibirás retroalimentación inmediata.</p>
  ${module.quiz.map((question, index) => `<div class="question" data-q="${index}">
    <strong>${index + 1}. ${question.q}</strong>
    ${question.type === 'tf'
      ? `<label><input type="radio" name="q${index}" value="true"> Verdadero</label><label><input type="radio" name="q${index}" value="false"> Falso</label>`
      : question.options.map((option, optionIndex) => `<label><input type="radio" name="q${index}" value="${optionIndex}"> ${option}</label>`).join('')}
    <div class="feedback" id="fb${index}"></div>
  </div>`).join('')}
  <button class="btn" onclick="gradeQuiz(${module.id})">Calificar autoevaluación</button>
  <div id="quizResult" class="callout key hidden"></div></section>`;
}


function renderSimulation() {
  const completed = state.simulation.completed;
  const score = state.simulation.score;
  return `<section class="simulation" id="auditSimulation">
    <figure class="simulation-visual"><img src="./assets/course/simulation.svg" alt="Caso práctico de auditoría simulada al proceso de estampado"></figure><div class="simulation-header">
      <div><span class="simulation-label">EVALUACIÓN PRÁCTICA FINAL</span><h3>Auditoría simulada · Proceso de estampado</h3><p>Analiza el caso y toma decisiones como auditor. Debes completar las seis etapas antes de cerrar la Parte 5.</p></div>
      <div class="case-file"><b>CASO</b><span>AUD-EST-001</span><small>BRK-204 · Cliente Tier 1</small></div>
    </div>
    <div class="case-summary">
      <article><b>Situación</b><p>Reclamo dimensional del cliente y pérdida de capacidad en una característica especial.</p></article>
      <article><b>Documentos</b><p>Plano rev. F, Plan de Control rev. F, instrucción rev. D, SPC y registros de liberación.</p></article>
      <article><b>Alcance</b><p>Estampado, liberación de primera pieza, control de medición y reacción ante desviaciones.</p></article>
    </div>
    ${simulationQuestions.map((q, index) => `<div class="simulation-step"><div class="step-number">${index + 1}</div><div class="step-content"><h4>${q.title}</h4><p>${q.text}</p>${q.options.map((o, oi) => `<label><input type="radio" name="sim${index}" value="${oi}" ${state.simulation.answers[index] === oi ? 'checked' : ''}> ${o}</label>`).join('')}<div class="feedback" id="simfb${index}"></div></div></div>`).join('')}
    <button class="btn" onclick="gradeSimulation()">Evaluar auditoría simulada</button>
    <div id="simulationResult" class="simulation-result ${completed ? '' : 'hidden'}">${completed ? simulationResultHtml(score) : ''}</div>
  </section>`;
}

function simulationResultHtml(score) {
  const level = score >= 85 ? 'Competencia sólida' : score >= 70 ? 'Competencia en desarrollo' : 'Requiere reforzamiento';
  return `<h3>Resultado de la actividad</h3><div class="simulation-score"><strong>${score}%</strong><span>${level}</span></div><p>${score >= 70 ? 'La actividad práctica fue completada. Revisa la retroalimentación de cada etapa para consolidar tu criterio de auditoría.' : 'Repasa las Partes 2, 3 y 4 y vuelve a analizar el caso antes de cerrar el curso.'}</p>`;
}

window.gradeSimulation = function gradeSimulation() {
  let correct = 0;
  let missing = 0;
  const answers = {};
  simulationQuestions.forEach((q, index) => {
    const selected = document.querySelector(`input[name=sim${index}]:checked`);
    const fb = document.querySelector(`#simfb${index}`);
    if (!selected) { missing += 1; fb.textContent = 'Selecciona una respuesta.'; fb.className = 'feedback bad'; return; }
    const value = Number(selected.value); answers[index] = value;
    if (value === q.answer) { correct += 1; fb.textContent = `Correcto · ${q.area}.`; fb.className = 'feedback ok'; }
    else { fb.textContent = `Revisa tu decisión · ${q.area}. La mejor respuesta debe sustentarse en criterio, evidencia y riesgo.`; fb.className = 'feedback bad'; }
  });
  if (missing) return;
  const score = Math.round(correct / simulationQuestions.length * 100);
  state.simulation = { completed: true, score, answers, completedAt: new Date().toISOString() };
  save();
  const result = document.querySelector('#simulationResult'); result.classList.remove('hidden'); result.innerHTML = simulationResultHtml(score); result.scrollIntoView({behavior:'smooth', block:'center'});
};

window.gradeQuiz = function gradeQuiz(id) {
  const module = data.find((item) => item.id === id);
  let correct = 0;

  module.quiz.forEach((question, index) => {
    const selected = document.querySelector(`input[name=q${index}]:checked`);
    const feedback = document.querySelector(`#fb${index}`);
    if (!selected) {
      feedback.textContent = 'Sin respuesta.';
      feedback.className = 'feedback bad';
      return;
    }
    const value = question.type === 'tf' ? selected.value === 'true' : Number(selected.value);
    if (value === question.answer) {
      correct += 1;
      feedback.textContent = `Correcto. ${question.explanation}`;
      feedback.className = 'feedback ok';
    } else {
      feedback.textContent = `Revisa: ${question.explanation}`;
      feedback.className = 'feedback bad';
    }
  });

  const percentage = Math.round((correct / module.quiz.length) * 100);
  state.scores[id] = percentage;
  save();
  const result = $('#quizResult');
  result.classList.remove('hidden');
  result.innerHTML = `<strong>Resultado:</strong> ${correct}/${module.quiz.length} (${percentage}%).`;
};

window.markComplete = function markComplete(id) {
  if (id === 5 && !state.simulation.completed) { alert('Completa primero la auditoría simulada de la Parte 5.'); document.querySelector('#auditSimulation')?.scrollIntoView({behavior:'smooth'}); return; }
  state.completed[id] = true;
  save();
  alert(`Parte ${id} marcada como completada.`);
  if (Object.values(state.completed).filter(Boolean).length === data.length) renderCertificate();
};

window.goModule = function goModule(id) {
  if (id === 0) {
    state.current = 0;
    save();
    buildNav();
    renderDiagnostic();
    window.scrollTo(0, 0);
    return;
  }
  if (!state.diagnostic.completed || id < 1 || id > data.length) return;
  state.current = id;
  save();
  buildNav();
  renderModule(id);
  window.scrollTo(0, 0);
};

function renderCertificate() {
  main.innerHTML = `<section class="certificate">
  <div class="small">DYM TRAINING SERIES</div>
  <h2>Constancia de finalización</h2>
  <p>Se reconoce que</p>
  <div class="name">${state.name || 'Participante'}</div>
  <p>completó el curso</p>
  <h3>ISO 19011:2018 — Directrices para auditorías de sistemas de gestión</h3>
  <p>Duración total estimada: 10 horas</p>
  <p>Fecha: ${new Date().toLocaleDateString('es-MX')}</p>
  <button class="btn" onclick="window.print()">Imprimir / Guardar PDF</button>
  </section>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

const resetButton = $('#reset');

if (resetButton) {
  resetButton.onclick = () => {
    const confirmed = confirm(
      '¿Deseas borrar el progreso, el diagnóstico y las calificaciones?'
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  };
}

if (!state.diagnostic.completed) state.current = 0;
buildNav();
updateProgress();
state.current === 0 ? renderDiagnostic() : renderModule(state.current);
