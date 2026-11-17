'use strict';
const CAL_TYPES={appt:'🩺 Appointment',work:'💼 Work shift',class:'🎓 Class',school:'📚 School',test:'🎯 Test / ACT',other:'📌 Other'};
let calView='week',calFilter='all';
const calList=()=>(S.cal=S.cal||[]);
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
  calList().push({id:'e'+Date.now(),title,date,who:$('#ce_w').value,type:$('#ce_y').value,start:$('#ce_s').value,end:$('#ce_e').value,rep:$('#ce_r').checked,note:$('#ce_n').value.trim(),by:me});
  save();toast('Added');render();
}
function calDel(id){S.cal=calList().filter(e=>e.id!==id);save();render()}
