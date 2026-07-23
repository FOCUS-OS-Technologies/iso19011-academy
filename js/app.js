
const data = window.COURSE_DATA;
let state = JSON.parse(localStorage.getItem('iso19011_state') || '{"completed":{},"scores":{},"current":1,"name":""}');
const $ = s => document.querySelector(s);
const main = $('#content');
const nav = $('#moduleNav');

function save(){ localStorage.setItem('iso19011_state', JSON.stringify(state)); updateProgress(); }
function totalModules(){ return data.length; }
function updateProgress(){
  const done = Object.values(state.completed).filter(Boolean).length;
  const pct = Math.round(done/totalModules()*100);
  $('#progressFill').style.width = pct+'%';
  $('#progressLabel').textContent = `${done} de ${totalModules()} partes completadas · ${pct}%`;
}
function buildNav(){
  nav.innerHTML='';
  data.forEach(m=>{
    const b=document.createElement('button');
    b.textContent=`Parte ${m.id}: ${m.title}`;
    b.className = Number(state.current)===m.id ? 'active':'';
    b.onclick=()=>{state.current=m.id;save();renderModule(m.id);buildNav();window.scrollTo(0,0)};
    nav.appendChild(b);
  });
}
function renderModule(id){
  const m=data.find(x=>x.id===Number(id));
  let html=`<section class="hero">
    <div class="meta">PARTE ${m.id} · ${m.duration}</div>
    <h2>${m.title}</h2>
    <h4>Objetivos de aprendizaje</h4>
    <ul class="objectives">${m.objectives.map(x=>`<li>${x}</li>`).join('')}</ul>
  </section>`;
  m.lessons.forEach(l=>html+=`<section class="lesson"><h3>${l.title}</h3>${l.content}</section>`);
  html += renderQuiz(m);
  html += `<div class="module-footer">
    <button class="btn secondary" ${m.id===1?'disabled':''} onclick="goModule(${m.id-1})">← Parte anterior</button>
    <button class="btn" onclick="markComplete(${m.id})">Marcar parte como completada</button>
    <button class="btn secondary" ${m.id===data.length?'disabled':''} onclick="goModule(${m.id+1})">Parte siguiente →</button>
  </div>`;
  main.innerHTML=html;
}
function renderQuiz(m){
  return `<section class="quiz"><h3>Autoevaluación de la Parte ${m.id}</h3>
  <p>Contesta y presiona “Calificar”. Recibirás retroalimentación inmediata.</p>
  ${m.quiz.map((q,i)=>`<div class="question" data-q="${i}">
    <strong>${i+1}. ${q.q}</strong>
    ${q.type==='tf'
      ? `<label><input type="radio" name="q${i}" value="true"> Verdadero</label><label><input type="radio" name="q${i}" value="false"> Falso</label>`
      : q.options.map((o,j)=>`<label><input type="radio" name="q${i}" value="${j}"> ${o}</label>`).join('')}
    <div class="feedback" id="fb${i}"></div>
  </div>`).join('')}
  <button class="btn" onclick="gradeQuiz(${m.id})">Calificar autoevaluación</button>
  <div id="quizResult" class="callout key hidden"></div></section>`;
}
window.gradeQuiz=function(id){
  const m=data.find(x=>x.id===id); let correct=0;
  m.quiz.forEach((q,i)=>{
    const sel=document.querySelector(`input[name=q${i}]:checked`);
    const fb=document.querySelector(`#fb${i}`);
    if(!sel){fb.textContent='Sin respuesta.';fb.className='feedback bad';return;}
    let val=q.type==='tf' ? sel.value==='true' : Number(sel.value);
    if(val===q.answer){correct++;fb.textContent='Correcto. '+q.explanation;fb.className='feedback ok';}
    else{fb.textContent='Revisa: '+q.explanation;fb.className='feedback bad';}
  });
  const pct=Math.round(correct/m.quiz.length*100);
  state.scores[id]=pct; save();
  const r=$('#quizResult'); r.classList.remove('hidden'); r.innerHTML=`<strong>Resultado:</strong> ${correct}/${m.quiz.length} (${pct}%).`;
}
window.markComplete=function(id){
  state.completed[id]=true; save();
  alert(`Parte ${id} marcada como completada.`);
  if(Object.values(state.completed).filter(Boolean).length===data.length){ renderCertificate(); }
}
window.goModule=function(id){ if(id<1||id>data.length)return; state.current=id; save(); buildNav(); renderModule(id); window.scrollTo(0,0); }
function renderCertificate(){
  main.innerHTML=`<section class="certificate">
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
$('#setName').onclick=()=>{ const n=prompt('Nombre del participante:',state.name||''); if(n!==null){state.name=n.trim();save();} };
$('#reset').onclick=()=>{ if(confirm('¿Borrar progreso y calificaciones?')){localStorage.removeItem('iso19011_state');location.reload();} };
$('#certificate').onclick=()=>renderCertificate();
buildNav(); updateProgress(); renderModule(state.current);
