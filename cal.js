'use strict';
const CAL_TYPES={appt:'🩺 Appointment',work:'💼 Work shift',class:'🎓 Class',school:'📚 School',test:'🎯 Test / ACT',other:'📌 Other'};
let calView='week',calFilter='all';
const calList=()=>{if(!S.cal||Array.isArray(S.cal)){const o={};(S.cal||[]).forEach(e=>o[e.id]=e);S.cal=o}return Object.values(S.cal)};
function calExpand(from,to){
  const out=[];
  calList().forEach(e=>{
    if(!e.rep){if(e.date>=from&&e.date<=to)out.push({...e,on:e.date});return}
    const until=e.until||addDays(e.date,180);
    for(let d=e.date;d<=to&&d<=until;d=addDays(d,7))if(d>=from)out.push({...e,on:d});
  });
  allAsg().forEach(a=>{if(a.due>=from&&a.due<=to)a.who.forEach(w=>out.push({id:'a:'+a.id+w,title:'Due: '+a.title,date:a.due,on:a.due,who:w,type:'school',auto:true}))});
  return out.filter(e=>calFilter==='all'||e.who===calFilter||e.who==='all')
    .sort((a,b)=>a.on.localeCompare(b.on)||(a.start||'').localeCompare(b.start||''));
}
const whoDot=w=>w==='all'?'👨‍👩‍👧':(person(w)?.e||'•');
const fmtT=t=>{if(!t)return'';const[h,m]=t.split(':').map(Number);return`${h%12||12}:${pad(m)} ${h<12?'AM':'PM'}`};
function vCal(){
  const t=dkey(),from=calView==='week'?weekStart():t,to=addDays(from,calView==='week'?6:29),ev=calExpand(from,to);
  const names=[['all','Everyone'],...PEOPLE.map(p=>[p.id,p.name])];
  let days='';
  for(let d=from;d<=to;d=addDays(d,1)){
    const l=ev.filter(e=>e.on===d);
    if(!l.length&&calView==='month')continue;
    days+=`<div class="card"><b>${fdate(d)}${d===t?' · today':''}</b>${l.length?l.map(e=>`<div class="row"><span>${whoDot(e.who)} <b>${esc(e.title)}</b><br><span class="sm mut">${CAL_TYPES[e.type]||''}${e.start?' · '+fmtT(e.start)+(e.end?'–'+fmtT(e.end):''):''}${e.rep?' · weekly':''}${e.note?' · '+esc(e.note):''}</span></span>${!e.auto&&(me==='jeanne'||e.by===me)?`<button class="btn s" onclick="calDel('${e.id}')">✕</button>`:''}</div>`).join(''):'<p class="sm mut">Nothing scheduled</p>'}</div>`;
  }
  return`<h1>🗓️ Shared Calendar</h1>
<div class="card"><div class="row">
<button class="btn ${calView==='week'?'g':''}" onclick="calView='week';render()">This week</button>
<button class="btn ${calView==='month'?'g':''}" onclick="calView='month';render()">Next 30 days</button></div>
<select onchange="calFilter=this.value;render()">${names.map(n=>`<option value="${n[0]}"${calFilter===n[0]?' selected':''}>${n[1]}</option>`).join('')}</select>
<p class="sm mut">Assignment due dates show up automatically.</p></div>
${days}
<div class="card"><h3>➕ Add an event</h3>
<input id="ce_t" placeholder="What is it? (e.g. Work shift, dentist)">
<select id="ce_w"><option value="all">Everyone</option>${PEOPLE.map(p=>`<option value="${p.id}"${p.id===me?' selected':''}>${p.name}</option>`).join('')}</select>
<select id="ce_y">${Object.entries(CAL_TYPES).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select>
<label class="sm mut">Date</label><input id="ce_d" type="date" value="${t}">
<label class="sm mut">Start / end (optional)</label><input id="ce_s" type="time"><input id="ce_e" type="time">
<label class="sm"><input id="ce_r" type="checkbox"> Repeats every week (like a class or regular shift)</label>
<input id="ce_n" placeholder="Note (optional)">
<button class="btn g" onclick="calAdd()">Save event</button></div>`;
}
function calAdd(){
  const title=$('#ce_t').value.trim(),date=$('#ce_d').value;
  if(!title||!date)return toast('Add a title and date');
  calList();const id='e'+Date.now();S.cal[id]={id,title,date,who:$('#ce_w').value,type:$('#ce_y').value,start:$('#ce_s').value,end:$('#ce_e').value,rep:$('#ce_r').checked,note:$('#ce_n').value.trim(),by:me};
  save();toast('Added');render();
}
function calDel(id){calList();delete S.cal[id];save();render()}

const THEMES={
 night:{n:'Night blue',bg:'#0f172a',card:'#1e293b',tx:'#e2e8f0',mut:'#94a3b8',ac:'#34d399',ac2:'#6366f1',top:'#1e1b4b',nav:'#161e36',pill:'#243258'},
 forest:{n:'Forest',bg:'#0b1f17',card:'#14352a',tx:'#e6f4ea',mut:'#9bc3ad',ac:'#a3e635',ac2:'#15803d',top:'#0a3d2a',nav:'#0e2a1f',pill:'#1c4a39'},
 ocean:{n:'Ocean',bg:'#06202b',card:'#0c3445',tx:'#e0f2fe',mut:'#8fbfd6',ac:'#22d3ee',ac2:'#0284c7',top:'#083a52',nav:'#082a39',pill:'#10506b'},
 sunset:{n:'Sunset',bg:'#2a1020',card:'#3d1a30',tx:'#ffe9ef',mut:'#e0a3b8',ac:'#fb923c',ac2:'#e11d48',top:'#5b1a3a',nav:'#35132a',pill:'#5a2646'},
 grape:{n:'Grape',bg:'#1c1033',card:'#2c1b4d',tx:'#f1e8ff',mut:'#b9a3e0',ac:'#f0abfc',ac2:'#9333ea',top:'#3b1a6b',nav:'#251445',pill:'#43286f'},
 steel:{n:'Steel & ember',bg:'#18181b',card:'#27272a',tx:'#f4f4f5',mut:'#a1a1aa',ac:'#f97316',ac2:'#52525b',top:'#3f3f46',nav:'#202023',pill:'#3a3a40'},
 light:{n:'Light',bg:'#f4f6fb',card:'#ffffff',tx:'#1e293b',mut:'#64748b',ac:'#059669',ac2:'#4f46e5',top:'#c7d2fe',nav:'#e2e8f0',pill:'#cbd5e1'}
};
function applyTheme(){
  const k=me&&localStorage.getItem('kae_theme_'+me),t=THEMES[k]||THEMES.night,r=document.documentElement.style;
  ['bg','card','tx','mut','ac','ac2','top','nav','pill'].forEach(x=>r.setProperty('--'+x,t[x]));
}
function themePicker(){modal(`<h3>🎨 Pick your colors</h3><div class="grid">${Object.entries(THEMES).map(([k,t])=>`<button class="tile" style="background:${t.card};color:${t.tx};border:3px solid ${t.ac}" onclick="setTheme('${k}')">${t.n}</button>`).join('')}</div><button class="btn s" onclick="closeModal()">Close</button>`)}
function setTheme(k){localStorage.setItem('kae_theme_'+me,k);applyTheme();closeModal()}

