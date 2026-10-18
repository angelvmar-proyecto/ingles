// Lógica principal de la app

// Unir los dos archivos de datos en uno solo
const DATA = Object.assign({}, DATA_CORE, DATA_NUEVOS);

// Normalizador (por si acaso algún array no tiene el formato esperado)
function normalizeData(D){
  for(const mod of Object.values(D)){
    if(!mod.levels) continue;
    for(const lvl of mod.levels){
      if(!lvl.items) continue;
      lvl.items = lvl.items.map(it=>{
        if(Array.isArray(it)){
          const o={en:it[0],es:it[1]};
          if(it[2])o.emoji=it[2];
          return o;
        }
        if(it.a && Array.isArray(it.a)) it.a={en:it.a[0],es:it.a[1]};
        if(it.b && Array.isArray(it.b)) it.b={en:it.b[0],es:it.b[1]};
        return it;
      });
    }
  }
  return D;
}
normalizeData(DATA);

// ===== ESTADO =====
const save=(k,v)=>{try{localStorage.setItem('oi_'+k,JSON.stringify(v))}catch(e){}};
const load=(k,d)=>{try{const v=localStorage.getItem('oi_'+k);return v?JSON.parse(v):d}catch(e){return d}};
const state={
  screen:'home',module:null,level:null,levelIdx:0,
  learnIdx:0,exercises:[],qIdx:0,correct:0,answers:[],
  xp:load('xp',0),kid:load('kid',false),progress:load('progress',{}),
  voicesReady:false
};

// ===== AUDIO (Blindado contra WebView sin TTS) =====
let voices=[];
let ttsAvailable=false;
try{
  ttsAvailable = (typeof window.speechSynthesis!=='undefined') && (typeof window.SpeechSynthesisUtterance!=='undefined');
}catch(e){ttsAvailable=false}

function loadVoices(){
  if(!ttsAvailable){state.voicesReady=false;return}
  try{
    voices=window.speechSynthesis.getVoices().filter(v=>v.lang&&v.lang.startsWith('en'));
    state.voicesReady=voices.length>0;
  }catch(e){voices=[];state.voicesReady=false}
}

if(ttsAvailable){
  try{
    window.speechSynthesis.onvoiceschanged=loadVoices;
    loadVoices();
  }catch(e){}
}

async function speak(text){
  try{
    if(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech){
      await window.Capacitor.Plugins.TextToSpeech.speak({text:text, lang:'en-US', rate:0.85, pitch:1.0, volume:1.0, category:'ambient'});
      return;
    }
  }catch(e){console.log('Plugin TTS error',e)}

  if(!ttsAvailable){console.log('TTS no disponible');return}
  try{
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang='en-US';u.rate=0.85;
    const pref=voices.find(v=>/Samantha|Google US|Karen|Daniel|Alex|en-US/i.test(v.name))||voices[0];
    if(pref)u.voice=pref;
    window.speechSynthesis.speak(u);
  }catch(e){console.log('Web TTS error',e)}
}

// ===== BEEPS (Sonidos del sistema) =====
const AC=window.AudioContext||window.webkitAudioContext;
let ac;
function beep(f,d,t='sine'){
  try{
    if(!AC)return;
    if(!ac)ac=new AC();
    const o=ac.createOscillator(),g=ac.createGain();
    o.type=t;o.frequency.value=f;o.connect(g);g.connect(ac.destination);
    g.gain.setValueAtTime(.15,ac.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);
    o.start();o.stop(ac.currentTime+d);
  }catch(e){}
}
const ok=()=>{beep(660,.08);setTimeout(()=>beep(880,.12),70)};
const err=()=>beep(180,.25,'sawtooth');

// ===== UTILIDADES =====
const $=s=>document.querySelector(s);
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const starsFor=p=>p>=100?3:p>=80?2:p>=60?1:0;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function confetti(){
  const em=['🎉','⭐','✨','🎊','💫'];
  for(let i=0;i<24;i++){
    const el=document.createElement('div');
    el.className='confetti';
    el.textContent=em[Math.floor(Math.random()*em.length)];
    el.style.left=Math.random()*100+'vw';
    el.style.animationDelay=Math.random()*1.2+'s';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),4500);
  }
}

// ===== RENDER PRINCIPAL =====
function render(){
  const app=$('#app');
  if(state.screen==='home')app.innerHTML=viewHome();
  else if(state.screen==='module')app.innerHTML=viewModule();
  else if(state.screen==='learn')app.innerHTML=viewLearn();
  else if(state.screen==='quiz')app.innerHTML=viewQuiz();
  else if(state.screen==='game'){app.innerHTML=viewGame();bind();setTimeout(initSnake,60);return}
  else if(state.screen==='result')app.innerHTML=viewResult();
  bind();
  app.classList.remove('fade');void app.offsetWidth;app.classList.add('fade');
}

function viewHome(){
  let mods='';
  for(const [id,m] of Object.entries(DATA)){
    const total=m.levels.length;
    let done=0;
    m.levels.forEach((_,i)=>{const p=state.progress[id+'-'+i];if(p&&p.stars>0)done++});
    mods+=`<div class="card" data-mod="${id}">
      <span class="emoji">${m.emoji}</span>
      <div class="name">${m.name}</div>
      <div class="sub">${done}/${total} niveles</div>
      <div class="bar"><div style="width:${done/total*100}%;background:${m.color}"></div></div>
    </div>`;
  }
  return `
    <div class="header">
      <div><h1>Oído Inglés</h1><p>Entrena tu oído, no tu memoria</p></div>
      <div class="stats"><span class="pill">⭐ ${state.xp} XP</span></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <h3>Módulos</h3>
      <div class="toggle">
        <button data-kid="0" class="${!state.kid?'active':''}">Adulto</button>
        <button data-kid="1" class="${state.kid?'active':''}">Niño</button>
      </div>
    </div>
    <div class="grid">${mods}</div>
    ${!state.voicesReady?'<div class="tip">🔇 La voz aún no está lista. Toca cualquier botón de audio para activarla. Si no suena, instala el motor de voz en inglés desde Play Store (Google Text-to-Speech).</div>':''}
  `;
}

function viewModule(){
  const m=DATA[state.module];
  const levels=m.levels.map((l,i)=>{
    const p=state.progress[state.module+'-'+i];
    const st=p?p.stars:0;
    const stars='★'.repeat(st)+'☆'.repeat(3-st);
    return `<div class="level-row" data-lvl="${i}">
      <div><div style="font-weight:700">${l.name}</div>
      <div style="font-size:12px;color:#7a7a95;margin-top:2px">${l.items.length} ${m.pairs?'pares':'palabras'}</div></div>
      <div class="stars">${stars}</div>
    </div>`;
  }).join('');
  return `
    <div class="back" data-nav="home">← Atrás</div>
    <h1>${m.emoji} ${m.name}</h1>
    <p style="margin-bottom:16px">${m.desc}</p>
    ${levels}
  `;
}

function viewLearn(){
  const m=DATA[state.module],l=m.levels[state.level];
  const idx=state.learnIdx;
  const item=l.items[idx];
  const total=l.items.length;
  let center;
  if(m.pairs){
    center=`<div style="font-size:22px;font-weight:700;line-height:1.4">
      <div style="color:#4ade80;margin-bottom:12px">A: ${esc(item.a.en)} <span style="color:#7a7a95;font-size:14px;font-weight:400">(${esc(item.a.es)})</span></div>
      <div style="color:#f87171">B: ${esc(item.b.en)} <span style="color:#7a7a95;font-size:14px;font-weight:400">(${esc(item.b.es)})</span></div>
    </div>
    <div style="display:flex;gap:12px;justify-content:center;margin:24px 0">
      <button class="speak-btn" data-hear="a" style="width:64px;height:64px;font-size:22px">A</button>
      <button class="speak-btn" data-hear="b" style="width:64px;height:64px;font-size:22px;background:linear-gradient(135deg,#EF4444,#F59E0B)">B</button>
    </div>
    <div class="tip">${esc(item.tip)}</div>`;
  }else{
    center=`<span class="big-emoji">${item.emoji||'🔊'}</span>
      <div class="word-en">${esc(item.en)}</div>
      <div class="word-es">${esc(item.es)}</div>
      <button class="speak-btn" data-hear="word">🔊</button>`;
  }
  return `
    <div class="back" data-nav="module">← ${m.name}</div>
    <div class="q-progress">${l.items.map((_,i)=>`<div class="${i<=idx?'done':''}"></div>`).join('')}</div>
    <h3 style="margin-bottom:4px">Aprende · ${idx+1}/${total}</h3>
    <div class="learn-box">${center}</div>
    <button class="btn" data-next="learn">${idx<total-1?'Siguiente →':'Empezar quiz →'}</button>
    <button class="btn btn-ghost" data-hear="word" style="margin-top:8px">🔊 Repetir</button>
  `;
}

function buildExercises(){
  const m=DATA[state.module],l=m.levels[state.level];
  const ex=[];
  const items=shuffle(l.items);
  const n=Math.min(6,items.length);
  for(let i=0;i<n;i++){
    const item=items[i];
    if(m.pairs){
      const which=Math.random()<.5?'a':'b';
      ex.push({type:'pair',item,which});
    }else{
      const dir=i%2===0?'en2es':'es2en';
      const pool=l.items.filter(x=>x!==item);
      const wrongs=shuffle(pool).slice(0,3);
      const opts=shuffle([item,...wrongs]);
      ex.push({type:'quiz',item,dir,opts});
    }
  }
  if(!state.kid&&!m.pairs&&l.items.length>=6){
    const t=shuffle(l.items).slice(0,2);
    t.forEach(item=>ex.push({type:'type',item}));
  }
  return ex;
}

function viewQuiz(){
  const ex=state.exercises[state.qIdx];
  const total=state.exercises.length;
  const progress=state.exercises.map((_,i)=>{
    if(i<state.qIdx){const a=state.answers[i];return `<div class="${a?'correct':'wrong'}"></div>`}
    if(i===state.qIdx)return '<div class="done"></div>';
    return '<div></div>';
  }).join('');
  let body='';
  if(ex.type==='quiz'){
    const showEN=ex.dir==='en2es';
    const question=showEN?ex.item.en:ex.item.es;
    const opts=ex.opts.map((o,i)=>{
      const label=showEN?o.es:o.en;
      return `<button class="option" data-ans="${i}">${esc(label)}</button>`;
    }).join('');
    body=`
      <div style="text-align:center;margin-bottom:24px">
        <p style="margin-bottom:12px">${showEN?'¿Qué significa?':'Escucha y elige'}</p>
        ${showEN?`<div class="word-en" style="font-size:30px">${esc(question)}</div>
          <button class="speak-btn" data-hear="word" style="margin-top:12px">🔊</button>`
        :`<button class="speak-btn" data-hear="word" style="margin:0 auto">🔊</button>`}
      </div>${opts}`;
    if(!showEN)setTimeout(()=>speak(ex.item.en),300);
  }else if(ex.type==='pair'){
    body=`
      <div style="text-align:center;margin-bottom:24px">
        <p style="margin-bottom:12px">¿Cuál escuchaste?</p>
        <button class="speak-btn" data-hear="word" style="margin:0 auto">🔊</button>
      </div>
      <button class="option" data-ans="a">${esc(ex.item.a.en)} <span style="color:#7a7a95;font-size:13px">(${esc(ex.item.a.es)})</span></button>
      <button class="option" data-ans="b">${esc(ex.item.b.en)} <span style="color:#7a7a95;font-size:13px">(${esc(ex.item.b.es)})</span></button>
      <div class="tip">${esc(ex.item.tip)}</div>`;
    setTimeout(()=>speak(ex.which==='a'?ex.item.a.en:ex.item.b.en),300);
  }else if(ex.type==='type'){
    body=`
      <div style="text-align:center;margin-bottom:24px">
        <p style="margin-bottom:12px">Escribe lo que escuchas</p>
        <button class="speak-btn" data-hear="word" style="margin:0 auto">🔊</button>
      </div>
      <input type="text" id="typeInput" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="escribe en inglés...">
      <button class="btn" data-check="1">Comprobar</button>`;
    setTimeout(()=>{speak(ex.item.en);setTimeout(()=>{const el=$('#typeInput');if(el)el.focus()},400)},300);
  }
  return `
    <div class="back" data-nav="module">← Salir</div>
    <div class="q-progress">${progress}</div>
    <h3 style="margin-bottom:16px">Pregunta ${state.qIdx+1}/${total}</h3>
    ${body}
  `;
}

function viewResult(){
  const total=state.exercises.length;
  const pct=Math.round(state.correct/total*100);
  const s=starsFor(pct);
  const msgs=['¡Sigue intentando!','¡Buen trabajo!','¡Muy bien!','¡Perfecto!'];
  const key=state.module+'-'+state.level;
  const prev=state.progress[key]?.stars||0;
  if(s>prev){state.progress[key]={stars:s,pct};save('progress',state.progress)}
  const gained=s*10;
  state.xp+=gained;save('xp',state.xp);
  if(pct>=80)setTimeout(confetti,200);
  return `
    <div class="result">
      <div class="big">${s===3?'🏆':s===2?'🎉':s===1?'👍':'💪'}</div>
      <h1 style="margin-bottom:8px">${msgs[s]}</h1>
      <div class="stars" style="font-size:32px;margin:16px 0">${'★'.repeat(s)}${'☆'.repeat(3-s)}</div>
      <p style="font-size:17px;margin-bottom:6px">${state.correct} de ${total} correctas</p>
      <p>+${gained} XP</p>
      <button class="btn" data-nav="module" style="margin-top:32px">Volver a niveles</button>
      <button class="btn btn-ghost" data-replay="1" style="margin-top:8px">Repetir nivel</button>
    </div>
  `;
}

function viewGame(){
  const total=state.exercises.length;
  const correct=state.correct;
  return `
    <div class="game-screen">
      <div class="back" data-nav="module">← Niveles</div>
      <h1>🐍 SNAKE 🐍</h1>
      <p class="quiz-summary">Terminaste el quiz: <b>${correct}/${total}</b> correctas. ¡Ahora a jugar!</p>
      <div class="game-box">
        <canvas id="snakeCanvas" width="330" height="330"></canvas>
        <div class="dpad">
          <button class="empty"></button>
          <button data-dir="up">▲</button>
          <button class="empty"></button>
          <button data-dir="left">◀</button>
          <button class="empty"></button>
          <button data-dir="right">▶</button>
          <button class="empty"></button>
          <button data-dir="down">▼</button>
          <button class="empty"></button>
        </div>
      </div>
      <button class="btn" data-nav="module">Volver a niveles</button>
    </div>
  `;
}

function initSnake(){
  const canvas=document.getElementById('snakeCanvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const grid=15;
  const cw=canvas.width/grid, ch=canvas.height/grid;
  let snake=[{x:7,y:7}],dir={x:1,y:0},food,score=0;
  let speed=180,lastTick=0,running=true,gameOver=false;

  function spawnFood(){
    let p,tries=0;
    do{p={x:Math.floor(Math.random()*grid),y:Math.floor(Math.random()*grid)};tries++}
    while(tries<200&&snake.some(s=>s.x===p.x&&s.y===p.y));
    return p;
  }
  food=spawnFood();

  function tick(now){
    if(!running)return;
    if(!lastTick)lastTick=now;
    if(now-lastTick<speed){requestAnimationFrame(tick);return}
    lastTick=now;
    const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
    if(head.x<0||head.x>=grid||head.y<0||head.y>=grid){endGame();return}
    if(snake.some(s=>s.x===head.x&&s.y===head.y)){endGame();return}
    snake.unshift(head);
    if(head.x===food.x&&head.y===food.y){
      score++;
      try{beep(880,.06);setTimeout(()=>beep(1100,.08),50)}catch(e){}
      food=spawnFood();
      speed=Math.max(70,speed-6);
    }else{
      snake.pop();
    }
    draw();
    requestAnimationFrame(tick);
  }

  function endGame(){
    gameOver=true;
    try{beep(150,.4,'sawtooth')}catch(e){}
    draw();
  }

  function draw(){
    ctx.fillStyle='#0a3d0a';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle='rgba(0,255,0,0.05)';
    ctx.lineWidth=1;
    for(let i=1;i<grid;i++){
      ctx.beginPath();ctx.moveTo(i*cw,0);ctx.lineTo(i*cw,canvas.height);ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,i*ch);ctx.lineTo(canvas.width,i*ch);ctx.stroke();
    }
    const fx=food.x*cw+cw/2, fy=food.y*ch+ch/2;
    ctx.fillStyle='#ff3b3b';
    ctx.beginPath();ctx.arc(fx,fy,cw/2-2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#9dff9d';
    ctx.fillRect(fx-1,fy-cw/2,2,4);
    snake.forEach((s,i)=>{
      const x=s.x*cw+1.5,y=s.y*ch+1.5,w=cw-3,h=ch-3;
      if(i===0){ctx.fillStyle='#9dff9d';ctx.shadowColor='#7dff7d';ctx.shadowBlur=8;}
      else{ctx.fillStyle=i%2===0?'#4dd14d':'#3dd13d';ctx.shadowBlur=0;}
      ctx.beginPath();
      if(ctx.roundRect){ctx.roundRect(x,y,w,h,4)}else{ctx.rect(x,y,w,h)}
      ctx.fill();
      ctx.shadowBlur=0;
    });
    if(!gameOver){
      const h=snake[0];
      ctx.fillStyle='#0a3d0a';
      const ox=h.x*cw, oy=h.y*ch;
      ctx.beginPath();ctx.arc(ox+cw*0.65,oy+ch*0.35,1.6,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(ox+cw*0.65,oy+ch*0.65,1.6,0,Math.PI*2);ctx.fill();
    }
    ctx.fillStyle='#7dff7d';
    ctx.font='bold 15px monospace';
    ctx.fillText('SCORE '+score,10,20);
    if(gameOver){
      ctx.fillStyle='rgba(0,0,0,0.78)';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='#7dff7d';
      ctx.textAlign='center';
      ctx.font='bold 32px monospace';
      ctx.fillText('GAME OVER',canvas.width/2,canvas.height/2-15);
      ctx.font='bold 22px monospace';
      ctx.fillText('SCORE '+score,canvas.width/2,canvas.height/2+25);
      ctx.font='bold 14px monospace';
      ctx.fillStyle='#9dff9d';
      ctx.fillText('▶ TOCA PARA REINTENTAR',canvas.width/2,canvas.height/2+65);
      ctx.textAlign='left';
    }
  }

  function setDir(nd){
    if(nd.x===-dir.x&&nd.y===-dir.y)return;
    dir=nd;
  }
  function restart(){
    snake=[{x:7,y:7}];dir={x:1,y:0};score=0;speed=180;
    lastTick=0;running=true;gameOver=false;
    food=spawnFood();
    draw();
    requestAnimationFrame(tick);
  }
  window._snakeDir=setDir;
  window._snakeRestart=restart;
  canvas.onclick=()=>{if(gameOver)restart()};
  let tsx=0,tsy=0;
  canvas.addEventListener('touchstart',e=>{const t=e.touches[0];tsx=t.clientX;tsy=t.clientY;},{passive:true});
  canvas.addEventListener('touchend',e=>{
    const t=e.changedTouches[0];
    const dx=t.clientX-tsx,dy=t.clientY-tsy;
    if(Math.abs(dx)<20&&Math.abs(dy)<20){if(gameOver)restart();return}
    if(Math.abs(dx)>Math.abs(dy))setDir({x:dx>0?1:-1,y:0});
    else setDir({x:0,y:dy>0?1:-1});
  },{passive:true});
  draw();
  requestAnimationFrame(tick);
}

// ===== BIND (Eventos de botones) =====
function bind(){
  document.querySelectorAll('[data-nav]').forEach(el=>{
    el.onclick=()=>{state.screen=el.dataset.nav;if(el.dataset.nav==='home')state.module=null;render()};
  });
  document.querySelectorAll('[data-mod]').forEach(el=>{
    el.onclick=()=>{state.module=el.dataset.mod;state.screen='module';render()};
  });
  document.querySelectorAll('[data-lvl]').forEach(el=>{
    el.onclick=()=>{
      state.level=+el.dataset.lvl;state.learnIdx=0;state.screen='learn';render();
      setTimeout(()=>speakCurrentLearn(),350);
    };
  });
  document.querySelectorAll('[data-kid]').forEach(el=>{
    el.onclick=()=>{state.kid=el.dataset.kid==='1';save('kid',state.kid);render()};
  });
  document.querySelectorAll('[data-hear]').forEach(el=>{
    el.onclick=e=>{e.stopPropagation();hearCurrent()};
  });
  document.querySelectorAll('[data-next="learn"]').forEach(el=>{
    el.onclick=()=>{
      const m=DATA[state.module],l=m.levels[state.level];
      if(state.learnIdx<l.items.length-1){
        state.learnIdx++;render();setTimeout(()=>speakCurrentLearn(),250);
      }else{
        state.exercises=buildExercises();
        state.qIdx=0;state.correct=0;state.answers=[];
        state.screen='quiz';render();
      }
    };
  });
  document.querySelectorAll('[data-ans]').forEach(el=>{
    el.onclick=()=>handleAnswer(el);
  });
  document.querySelectorAll('[data-check]').forEach(el=>{
    el.onclick=()=>{
      const ex=state.exercises[state.qIdx];
      const val=($('#typeInput')?.value||'').trim().toLowerCase();
      const correct=val===ex.item.en.toLowerCase();
      if(correct){ok();state.correct++}else err();
      state.answers[state.qIdx]=correct;
      setTimeout(()=>{
        state.qIdx++;
        if(state.qIdx>=state.exercises.length){finishLevel();}
        else render();
      },600);
    };
  });
  document.querySelectorAll('[data-replay]').forEach(el=>{
    el.onclick=()=>{state.learnIdx=0;state.screen='learn';render();setTimeout(()=>speakCurrentLearn(),350)};
  });
  document.querySelectorAll('[data-dir]').forEach(el=>{
    el.onclick=()=>{
      if(!window._snakeDir)return;
      const d=el.dataset.dir;
      if(d==='up')window._snakeDir({x:0,y:-1});
      if(d==='down')window._snakeDir({x:0,y:1});
      if(d==='left')window._snakeDir({x:-1,y:0});
      if(d==='right')window._snakeDir({x:1,y:0});
    };
  });
}

function finishLevel(){
  if(state.kid){state.screen='game';}
  else{state.screen='result';}
  render();
}

function hearCurrent(){
  const m=DATA[state.module];
  if(state.screen==='learn'){
    const l=m.levels[state.level],item=l.items[state.learnIdx];
    if(m.pairs)speak(item.a.en);else speak(item.en);
  }else if(state.screen==='quiz'){
    const ex=state.exercises[state.qIdx];
    if(ex.type==='quiz')speak(ex.item.en);
    else if(ex.type==='pair')speak(ex.which==='a'?ex.item.a.en:ex.item.b.en);
    else if(ex.type==='type')speak(ex.item.en);
  }
}
function speakCurrentLearn(){
  const m=DATA[state.module],l=m.levels[state.level],item=l.items[state.learnIdx];
  if(m.pairs)speak(item.a.en);else speak(item.en);
}

function handleAnswer(el){
  const ex=state.exercises[state.qIdx];
  let correct=false;
  if(ex.type==='quiz'){
    const chosen=ex.opts[+el.dataset.ans];
    correct=chosen===ex.item;
    el.classList.add(correct?'correct':'wrong');
    if(!correct){
      document.querySelectorAll('[data-ans]').forEach(b=>{
        if(ex.opts[+b.dataset.ans]===ex.item)b.classList.add('correct');
      });
    }
  }else if(ex.type==='pair'){
    correct=el.dataset.ans===ex.which;
    el.classList.add(correct?'correct':'wrong');
    if(!correct){
      document.querySelectorAll('[data-ans]').forEach(b=>{
        if(b.dataset.ans===ex.which)b.classList.add('correct');
      });
    }
  }
  if(correct){ok();state.correct++}else err();
  state.answers[state.qIdx]=correct;
  document.querySelectorAll('[data-ans]').forEach(b=>b.disabled=true);
  setTimeout(()=>{
    state.qIdx++;
    if(state.qIdx>=state.exercises.length){finishLevel();}
    else render();
  },correct?700:1400);
}

// ===== INICIALIZACIÓN =====
render();
function initNativeTTS(){
  if(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech){
    state.voicesReady=true;
  }
}
document.addEventListener('deviceready',initNativeTTS,false);
setTimeout(initNativeTTS,800);
setTimeout(initNativeTTS,2000);
