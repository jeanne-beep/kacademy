'use strict';
// Play & Learn (students) and NCE/NCMHCE daily prep (Mrs. K only)
const gs=q=>'https://www.google.com/search?q='+encodeURIComponent(q);
const PLAY=[
 {id:'p-khan',who:['jackson','ryley'],type:'🌐 Free site/app',name:'Khan Academy',why:'Free ACT-aligned math, grammar, economics and science lessons with instant practice.',url:'https://www.khanacademy.org/'},
 {id:'p-act',who:['jackson','ryley'],type:'🎯 Official',name:'ACT free prep & Question of the Day',why:'Official practice from the test makers.',url:'https://www.act.org/content/act/en/products-and-services/the-act/test-preparation.html'},
 {id:'p-quizlet',who:['jackson','ryley'],type:'📱 iPhone app',name:'Quizlet',why:'Flashcards and games. Make sets for ACT vocab, med terms or welding terms.',url:'https://quizlet.com/'},
 {id:'p-phet',who:['jackson','ryley'],type:'🧪 Simulation (web)',name:'PhET Interactive Simulations',why:'Free University of Colorado science simulations: forces, circuits, energy, chemistry. Works on iPhone browsers.',url:'https://phet.colorado.edu/'},
 {id:'p-invest',who:['jackson','ryley'],type:'💰 Simulation (web)',name:'Investopedia Stock Simulator',why:'Practice investing with virtual money to reinforce markets, risk and supply/demand.',url:'https://www.investopedia.com/simulator/'},
 {id:'p-lemon',who:['jackson','ryley'],type:'🍋 Web game',name:'Lemonade Stand-style business games',why:'Pricing, costs and profit: ties to your egg-market assignment.',url:gs('lemonade stand economics game for students')},
 {id:'p-planet',who:['jackson','ryley'],type:'🎧 Podcast',name:'Planet Money (NPR)',why:'Real-world economics told as stories.',url:gs('Planet Money NPR podcast')},
 {id:'r-pizza',who:['jackson','ryley'],type:'🎮 Roblox (parent vets)',name:'Work at a Pizza Place',why:'Jobs, wages, tips and teamwork: talk afterward about labor and opportunity cost.',url:gs('Roblox Work at a Pizza Place'),def:false},
 {id:'r-lumber',who:['jackson','ryley'],type:'🎮 Roblox (parent vets)',name:'Lumber Tycoon 2',why:'Gather resources, trade and build: scarcity, trade and production.',url:gs('Roblox Lumber Tycoon 2'),def:false},
 {id:'r-bee',who:['jackson','ryley'],type:'🎮 Roblox (parent vets)',name:'Bee Swarm Simulator',why:'Fun tie-in to our hive: pollination, resource loops and ecosystems.',url:gs('Roblox Bee Swarm Simulator'),def:false},
 {id:'j-weld',who:['jackson'],type:'▶️ YouTube',name:'Weld.com (Jody Collier)',why:'Clear beginner-to-pro welding tutorials: joints, positions, troubleshooting.',url:gs('Weld.com YouTube welding basics')},
 {id:'j-sol',who:['jackson'],type:'🥽 Simulation (info)',name:'Soldamatic augmented-reality welding trainer',why:'The AR trainer used in many tech schools. Ask your votech program about it.',url:gs('Soldamatic welding simulator')},
 {id:'j-aws',who:['jackson'],type:'🔥 Career',name:'American Welding Society (AWS) learning',why:'Certification paths and student resources.',url:'https://www.aws.org/'},
 {id:'j-rblx',who:['jackson'],type:'🎮 Roblox (parent vets)',name:'Search Roblox for welding/trades games',why:'Quality varies; Mrs. K should preview anything before approval.',url:gs('Roblox welding game'),def:false},
 {id:'y-pocus',who:['ryley'],type:'📱 iPhone app',name:'POCUS Simulator',why:'Guided ultrasound cases with probe position and image recognition (free to download; subscription costs extra, so check with Mrs. K).',url:gs('POCUS Simulator app Ultrasound Fanatic')},
 {id:'y-pocket',who:['ryley'],type:'📱 iPhone app',name:'PoCUS Pocket Trainer',why:'Shows how probe movement changes the ultrasound image; great for spatial thinking.',url:gs('PoCUS Pocket Trainer app')},
 {id:'y-kenhub',who:['ryley'],type:'🧠 Anatomy',name:'Kenhub',why:'Atlas, videos and spaced-repetition anatomy quizzes (free basic plan).',url:'https://www.kenhub.com/'},
 {id:'y-bodysmart',who:['ryley'],type:'🧠 Anatomy',name:'GetBodySmart',why:'Free anatomy & physiology tutorials and quizzes.',url:'https://www.getbodysmart.com/'},
 {id:'y-bio',who:['ryley'],type:'🧠 3D anatomy',name:'BioDigital Human',why:'3D body with conditions and procedures: great with medical terminology.',url:'https://www.biodigital.com/'},
 {id:'y-rblx',who:['ryley'],type:'🎮 Roblox (parent vets)',name:'Search Roblox for hospital/medical roleplay',why:'Casual fun tied to the field; preview first.',url:gs('Roblox hospital medical game'),def:false}];

function playOK(p){const v=(S.playOK||{})[p.id];return v===undefined?p.def!==false:v}
function vPlay(){const l=PLAY.filter(p=>p.who.includes(me)&&playOK(p));
  return`<h1>🎮 Play & Learn</h1><p class="mut sm">Fun ways to practice what you study. Games marked Roblox appear only after Mrs. K approves them. Keep it to the time Mrs. K sets.</p>
  ${l.map(p=>`<div class="card"><div class="sm mut">${esc(p.type)}</div><h3>${esc(p.name)}</h3><p class="sm">${esc(p.why)}</p><a class="btn g" href="${esc(p.url)}" target="_blank" rel="noopener">Open / find it</a></div>`).join('')}`}
function vApprove(){return`<div class="card"><h3>🎮 Approve Play & Learn items</h3><p class="sm mut">Roblox items are hidden from students until approved. Preview each before approving.</p>
  ${PLAY.map(p=>`<label class="opt"><input type="checkbox" ${playOK(p)?'checked':''} onchange="setPlay('${p.id}',this.checked)"> ${esc(p.name)} <span class="sm mut">(${p.who.join(' & ')}) ${esc(p.type)}</span></label>`).join('')}</div>`}
function setPlay(id,v){S.playOK=S.playOK||{};S.playOK[id]=v;save()}

// ---------- NCE / NCMHCE ----------
const EX=()=>{const p=S.private;return p.exam=p.exam||{res:{},days:{},cases:{},date:''}};
let ex=null;
const MS=864e5;
function pickDaily(n=10,domain){
  const E=EX(),pool=NCE.map((q,i)=>({i,q})).filter(o=>!domain||o.q[0]===domain);
  const pri=o=>{const r=E.res[o.i];if(!r)return 1;if(r.wrong)return 0;return 2+(r.n||0)};
  pool.sort((a,b)=>pri(a)-pri(b)||(((E.res[a.i]||{}).last||'')).localeCompare((E.res[b.i]||{}).last||'')||a.i-b.i);
  const head=pool.slice(0,Math.min(pool.length,n*2));
  head.sort(()=>Math.random()-.5);return head.slice(0,n).map(o=>o.i)}
function exStart(kind,arg){
  if(kind==='daily')ex={kind:'q',ids:pickDaily(10),i:0,sc:0,ans:null,title:'Daily 10'};
  else if(kind==='domain')ex={kind:'q',ids:pickDaily(10,arg),i:0,sc:0,ans:null,title:arg+' drill'};
  else if(kind==='case'){const c=CASES[arg??Math.floor(Date.now()/MS)%CASES.length];ex={kind:'case',c,i:0,sc:0,ans:null,title:c.title}}
  render()}
function exAnswer(j){if(ex.ans!==null)return;ex.ans=j;
  if(ex.kind==='q'){const id=ex.ids[ex.i],ok=j===NCE[id][3],E=EX(),r=E.res[id]=E.res[id]||{n:0,ok:0};
    r.n++;if(ok){r.ok++;ex.sc++}r.wrong=!ok;r.last=dkey();
    const d=E.days[dkey()]=E.days[dkey()]||{n:0,ok:0};d.n++;if(ok)d.ok++;save()}
  else{const s=ex.c.steps[ex.i];if(j===s.a)ex.sc++;const E=EX(),d=E.days[dkey()]=E.days[dkey()]||{n:0,ok:0};d.n++;if(j===s.a)d.ok++;save()}
  render()}
function exNext(){ex.i++;ex.ans=null;const total=ex.kind==='q'?ex.ids.length:ex.c.steps.length;
  if(ex.i>=total){const t=total,sc=ex.sc;if(ex.kind==='case'){const E=EX();E.cases[ex.title]={score:sc,of:t,date:dkey()};save()}
    ex={kind:'done',sc,t,title:ex.title}}
  render()}
function exQuit(){ex=null;render()}
function exStreak(){const E=EX();let n=0,d=new Date();if(!E.days[dkey(d)])d.setDate(d.getDate()-1);
  while(E.days[dkey(d)]&&E.days[dkey(d)].n>0){n++;d.setDate(d.getDate()-1)}return n}
function vExam(){const E=EX();
  if(ex&&ex.kind==='done')return`<div class="card good"><h2>Finished: ${esc(ex.title)}</h2><h1>${ex.sc}/${ex.t}</h1><p>${ex.sc/ex.t>=.8?'Excellent. Keep the streak going!':'Good work. Missed items come back in the next sets.'}</p><button class="btn g" onclick="ex=null;render()">Done</button></div>`;
  if(ex){const total=ex.kind==='q'?ex.ids.length:ex.c.steps.length,q=ex.kind==='q'?NCE[ex.ids[ex.i]]:null,c=ex.kind==='case'?ex.c.steps[ex.i]:null;
    const stem=q?q[1]:c.q,opts=q?q[2]:c.o,ans=q?q[3]:c.a,why=q?q[4]:c.r;
    return`<button class="btn s sm" onclick="exQuit()">✕ Quit</button><h3>${esc(ex.title)} · ${ex.i+1}/${total}</h3>
    ${ex.kind==='case'?`<div class="card"><b>Case:</b> ${esc(ex.c.intro)}</div>`:`<p class="sm mut">${esc(q[0])}</p>`}
    <div class="card"><b>${esc(stem)}</b>${opts.map((o,j)=>`<button class="btn ${ex.ans===null?'s':j===ans?'g':j===ex.ans?'r':'s'} full" ${ex.ans!==null?'disabled':''} onclick="exAnswer(${j})">${'ABCD'[j]}. ${esc(o)}</button>`).join('')}
    ${ex.ans!==null?`<p class="${ex.ans===ans?'okk':'bad'}"><b>${ex.ans===ans?'✅ Correct.':'❌ Best answer: '+'ABCD'[ans]+'.'}</b> ${esc(why)}</p><button class="btn g" onclick="exNext()">${ex.i+1>=total?'Finish':'Next →'}</button>`:''}</div>`}
  const days=E.days,td=days[dkey()]||{n:0,ok:0},tot=Object.values(days).reduce((a,d)=>({n:a.n+d.n,ok:a.ok+d.ok}),{n:0,ok:0});
  const dom=DOMAINS.map(d=>{let n=0,ok=0;NCE.forEach((q,i)=>{if(q[0]===d&&E.res[i]){n+=E.res[i].n;ok+=E.res[i].ok}});return[d,n,ok]});
  const seen=Object.keys(E.res).length,missed=Object.values(E.res).filter(r=>r.wrong).length;
  const dl=E.date?Math.ceil((new Date(E.date+'T12:00')-new Date())/MS):null;
  return`<h1>🎓 NCE & NCMHCE daily prep</h1><p class="mut sm">Original practice items modeled on the NBCC content outlines (not real exam questions). Private to you.</p>
  <div class="card"><div class="row"><span class="grow">🔥 Streak: <b>${exStreak()}</b> days</span><span>Today: <b>${td.ok}/${td.n}</b></span><span>Overall: <b>${tot.n?Math.round(tot.ok/tot.n*100):0}%</b></span></div>
  <button class="btn g" onclick="exStart('daily')">▶ Start today\u2019s 10 (missed ones first)</button> <button class="btn" onclick="exStart('case')">🩺 NCMHCE case of the day</button>
  <p class="sm mut">Question bank: ${seen}/${NCE.length} seen · ${missed} to review · ${CASES.length} case simulations${dl!==null?` · exam in ${dl} days`:''}</p></div>
  <div class="card"><h3>Domain accuracy (tap to drill)</h3>${dom.map(([d,n,ok])=>`<div class="row click" onclick="exStart('domain','${d}')"><span class="grow">${d}</span><div class="bar" style="width:120px"><i style="width:${n?ok/n*100:0}%"></i></div><span class="sm">${n?Math.round(ok/n*100)+'%':'new'}</span></div>`).join('')}</div>
  <div class="card"><h3>Case simulations</h3>${CASES.map((c,i)=>`<div class="row click" onclick="exStart('case',${i})"><span class="grow">${esc(c.title)}</span><span class="sm">${E.cases[c.title]?`best ${E.cases[c.title].score}/${E.cases[c.title].of}`:'new'}</span></div>`).join('')}</div>
  <div class="card"><h3>Quick study notes</h3>${STUDY.map(s=>`<p><b>${esc(s[0])}:</b> <span class="sm">${esc(s[1])}</span></p>`).join('')}</div>
  <div class="card"><h3>Exam date</h3><input type="date" value="${E.date||''}" onchange="EX().date=this.value;save();render()"></div>`}
