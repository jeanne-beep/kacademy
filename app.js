'use strict';
const KEY='kae_v1',$=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const dkey=(d=new Date())=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const fdate=k=>new Date(k+'T12:00').toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
const weekStart=(d=new Date())=>{const x=new Date(d);x.setDate(x.getDate()-((x.getDay()+6)%7));return dkey(x)}; // Monday
const addDays=(k,n)=>{const d=new Date(k+'T12:00');d.setDate(d.getDate()+n);return dkey(d)};
const safeUrl=u=>/^https?:\/\//i.test(u)?u:'';
const person=id=>PEOPLE.find(p=>p.id===id);

function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}}
let S=Object.assign({sub:{},grade:{},custom:[],private:{hours:[],checkins:[],profile:{}}},load());
S.private=Object.assign({hours:[],checkins:[],profile:{}},S.private);
let me=sessionStorage.getItem('kae_me')||null,tab='week',sel=null,pins=JSON.parse(localStorage.getItem('kae_pins')||'{}');
const save=()=>{localStorage.setItem(KEY,JSON.stringify(S));if(typeof syncPush==='function')syncPush()};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}
const allAsg=()=>ASG.concat(S.custom||[]);
const asgFor=p=>allAsg().filter(a=>a.who.includes(p)).sort((a,b)=>a.due.localeCompare(b.due));
const subOf=(p,id)=>S.sub[p+'/'+id],gradeOf=(p,id)=>S.grade[p+'/'+id];
const quizName=a=>QUIZ[a.quiz]?.name||a.title;

function lateDays(a,s){if(!s)return 0;const end=new Date(a.due+'T23:59:59'),at=new Date(s.at);return at>end?Math.ceil((at-end)/864e5):0}
function stateOf(p,a){const s=subOf(p,a.id),g=gradeOf(p,a.id);
  if(a.quiz)return s?'done':(a.due<dkey()?'late':'todo');
  if(g)return'graded';if(s)return'submitted';return a.due<dkey()?'late':'todo'}
const CHIP={todo:['To do','c-todo'],late:['Past due','c-late'],submitted:['Submitted','c-sub'],graded:['Graded','c-ok'],done:['Done','c-ok']};
const chip=st=>`<span class="chip ${CHIP[st][1]}">${CHIP[st][0]}</span>`;

// ---------- shell ----------
const STU_TABS=[['week','📅 This Week'],['courses','📚 Courses'],['act','🎯 ACT'],['career','🛠️ Career'],['links','🔗 Links']];
const PAR_TABS=[['overview','📊 Overview'],['grade','✅ Grade'],['assign','➕ Assign'],['hours','⏱️ Hours'],['invoice','🧾 Invoices'],['checkin','💬 Check-in'],['settings','⚙️ Settings']];
function render(){
  const v=$('#view'),nav=$('#nav'),who=$('#who');
  if(!me){nav.innerHTML='';who.innerHTML='';v.innerHTML=vLogin();return}
  const p=person(me);who.innerHTML=`${p.e} ${esc(p.name)} <button class="btn s sm" onclick="logout()">Switch</button>`;
  const tabs=p.parent?PAR_TABS:STU_TABS;
  if(!tabs.some(t=>t[0]===tab))tab=tabs[0][0];
  nav.innerHTML=tabs.map(([k,l])=>`<button class="${k===tab?'on':''}" onclick="go('${k}')">${l}</button>`).join('');
  const M={week:vWeek,courses:vCourses,act:vAct,career:vCareer,links:vLinks,overview:vOverview,grade:vGrade,assign:vAssign,hours:vHours,invoice:vInvoice,checkin:vCheckin,settings:vSettings};
  v.innerHTML=(p.parent?'':vDueSoon())+M[tab]()}
function go(t){tab=t;sel=null;render();scrollTo(0,0)}
function vLogin(){return`<div class="card"><h1>🏫 K\u2019s Academy of Excellence</h1><p class="mut">Who is here?</p><div class="grid">${PEOPLE.map(p=>`<button class="tile" onclick="pickPerson('${p.id}')"><span class="big">${p.e}</span>${esc(p.name)}</button>`).join('')}</div></div>`}
function pickPerson(id){
  const has=pins[id];
  modal(`<h3>${has?'Enter your PIN':'Create a PIN (4+ digits)'}</h3><input id="pin" type="password" inputmode="numeric" maxlength="8" autofocus onkeydown="if(event.key==='Enter')checkPin('${id}')"><button class="btn g" onclick="checkPin('${id}')">Go</button>`)}
async function hash(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('kae'+s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function checkPin(id){const v=$('#pin').value;if(v.length<4)return toast('At least 4 digits');const h=await hash(v);
  if(!pins[id]){pins[id]=h;localStorage.setItem('kae_pins',JSON.stringify(pins))}else if(pins[id]!==h)return toast('Wrong PIN');
  me=id;sessionStorage.setItem('kae_me',id);tab=person(id).parent?'overview':'week';closeModal();render()}
function logout(){me=null;sessionStorage.removeItem('kae_me');render()}
function modal(h){$('#modal').innerHTML=`<div>${h}</div>`;$('#modal').classList.remove('hidden')}
function closeModal(){$('#modal').classList.add('hidden')}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});

// ---------- student: week ----------
function vDueSoon(){const t=dkey(),soon=addDays(t,2);
  const l=asgFor(me).filter(a=>['todo','late'].includes(stateOf(me,a))&&a.due<=soon);
  return l.length?`<div class="alert">⏰ <b>Due soon / past due:</b> ${l.map(a=>`${esc(a.title)} (${a.due<t?'past due':fdate(a.due)})`).join(' · ')}</div>`:''}
function vWeek(){
  if(sel)return vAsg(sel);
  const l=asgFor(me),open=l.filter(a=>['todo','late'].includes(stateOf(me,a))),rest=l.filter(a=>!['todo','late'].includes(stateOf(me,a)));
  const row=a=>`<div class="row click" onclick="openAsg('${a.id}')"><span class="e">${COURSES[a.course].e}</span><div class="grow"><b>${esc(a.title)}</b><div class="sm mut">${esc(COURSES[a.course].name)} · due ${fdate(a.due)}</div></div>${chip(stateOf(me,a))}</div>`;
  return`<h1>This week</h1><p class="mut sm">Weekly work is due Thursday 11:59 PM. Late work loses 10% per day unless you talk to Mrs. K first. Meetings: Mon 5\u20137 PM, Thu 3:30\u20135:30 PM.</p>
  <div class="card"><h3>To do (${open.length})</h3>${open.map(row).join('')||'<p class="mut">All caught up 🎉</p>'}</div>
  <div class="card"><h3>Turned in</h3>${rest.map(row).join('')||'<p class="mut">Nothing yet.</p>'}</div>`}
function openAsg(id){sel=id;render();scrollTo(0,0)}
function vAsg(id){
  const a=allAsg().find(x=>x.id===id);if(!a)return'';
  const p=me,s=subOf(p,id),g=gradeOf(p,id),back=`<button class="btn s sm" onclick="go('${person(p).parent?tab:'week'}')">← Back</button>`;
  if(a.quiz)return back+vQuiz(a);
  const stepsKey=p+'/steps:'+id,pl=S.sub[stepsKey]||{list:a.steps.map(t=>({t,day:'',done:false})),custom:false};
  const rub=RUB[a.rub]||RUB.gen,tot=rub.reduce((x,r)=>x+r[1],0);
  return`${back}<h1>${COURSES[a.course].e} ${esc(a.title)}</h1><p class="mut sm">${esc(COURSES[a.course].name)} · due ${fdate(a.due)} · ${esc(a.std||'')}</p>
  <div class="card"><p>${esc(a.desc)}</p></div>
  <div class="card"><h3>🧩 My plan (break it down your way)</h3>
   ${pl.list.map((st,i)=>`<div class="row"><input type="checkbox" ${st.done?'checked':''} onchange="stepDone('${id}',${i},this.checked)"><span class="grow ${st.done?'dn':''}">${esc(st.t)}</span><input type="date" class="dsm" value="${st.day||''}" onchange="stepDay('${id}',${i},this.value)"></div>`).join('')}
   <div class="row"><input id="newstep" placeholder="Add your own step"><button class="btn s sm" onclick="addStep('${id}')">Add</button></div>
   <p class="sm mut">Pick a day for each step. They show up under \u201CDue soon\u201D when the day arrives.</p></div>
  <div class="card"><h3>📏 Rubric (${tot} pts)</h3>${rub.map(r=>`<div class="row"><span class="grow">${esc(r[0])}</span><b>${r[1]}</b></div>`).join('')}</div>
  <div class="card"><h3>✍️ Your work</h3>
   <textarea id="work" rows="9" placeholder="Type your work here (or paste it) \u2026" oninput="liveCheck('${id}')">${esc(s?.text||'')}</textarea>
   <input id="wlink" placeholder="Optional: link to a Google Doc / photo / file" value="${esc(s?.link||'')}">
   <div id="check" class="check"></div>
   <button class="btn g" onclick="submitWork('${id}')">${s?'Resubmit':'Submit'}</button>
   ${s?`<span class="sm mut">Submitted ${new Date(s.at).toLocaleString()}${lateDays(a,s)?` · ${lateDays(a,s)} day(s) late`:''}</span>`:''}</div>
  ${g?vGradeCard(a,g,s):''}`}
function liveCheck(id){const a=allAsg().find(x=>x.id===id),t=$('#work').value,w=(t.match(/\b\w+\b/g)||[]).length,
  paras=t.split(/\n\s*\n/).filter(x=>x.trim()).length,quotes=(t.match(/[\u201C"][^\u201D"]{8,}[\u201D"]/g)||[]).length,
  sent=t.split(/[.!?]+/).filter(x=>x.trim()).length||1,avg=Math.round(w/sent);
  const min=a.min||0,out=[];
  out.push(`${w>=min?'✅':'⬜'} Words: ${w}/${min}`);
  if(['essay','compare','journal'].includes(a.rub)){out.push(`${quotes?'✅':'⬜'} Quotes: ${quotes}${a.rub==='essay'?' (aim for 4)':''}`);out.push(`${paras>=(a.rub==='essay'?4:1)?'✅':'⬜'} Paragraphs: ${paras}`)}
  out.push(`${avg>=10&&avg<=24?'✅':'⚠️'} Avg sentence length: ${avg} words${avg>24?' (try shorter sentences)':avg<10?' (add detail)':''}`);
  if(/\b(very|really|stuff|things|a lot)\b/i.test(t))out.push('⚠️ Swap vague words (very, really, stuff, things, a lot) for specific ones');
  if(/\bi think\b/i.test(t))out.push('⚠️ Cut \u201CI think\u201D; state your idea with confidence');
  $('#check').innerHTML='<b>Instant self-check</b><br>'+out.join('<br>')}
function stepPlan(id){const a=allAsg().find(x=>x.id===id),k=me+'/steps:'+id;return S.sub[k]=S.sub[k]||{list:a.steps.map(t=>({t,day:'',done:false}))}}
function stepDone(id,i,v){stepPlan(id).list[i].done=v;save();render()}
function stepDay(id,i,v){stepPlan(id).list[i].day=v;save()}
function addStep(id){const t=$('#newstep').value.trim();if(!t)return;stepPlan(id).list.push({t,day:'',done:false});save();render()}
function submitWork(id){const a=allAsg().find(x=>x.id===id),t=$('#work').value.trim(),l=safeUrl($('#wlink').value.trim());
  if(!t&&!l)return toast('Add your work or a link first');
  S.sub[me+'/'+id]={text:t,link:l,at:new Date().toISOString()};save();toast('Submitted ✅');render()}
function vGradeCard(a,g,s){const rub=RUB[a.rub]||RUB.gen,raw=g.scores.reduce((x,y)=>x+y,0),tot=rub.reduce((x,r)=>x+r[1],0),ld=lateDays(a,s),pen=Math.min(100,ld*10),final=Math.round(raw*(1-pen/100));
  return`<div class="card good"><h3>🌟 Feedback: ${final}/${tot} (${Math.round(final/tot*100)}%)</h3>${rub.map((r,i)=>`<div class="row"><span class="grow">${esc(r[0])}</span><b>${g.scores[i]}/${r[1]}</b></div>`).join('')}
  ${pen?`<p class="sm">Late penalty: −${pen}%</p>`:''}<p>${esc(g.comment||'')}</p></div>`}

// ---------- quizzes (instant) ----------
function vQuiz(a){const q=QUIZ[a.quiz],s=subOf(me,a.id);
  return`<h1>${COURSES[a.course].e} ${esc(q.name)}</h1><p class="mut sm">Instant results and explanations. You may retake it.</p>
  ${s?`<div class="card good"><h3>Last score: ${s.score}/${q.qs.length}</h3></div>`:''}
  <div class="card">${q.qs.map((x,i)=>`<div class="qq"><b>${i+1}. ${esc(x[0])}</b>${x[1].map((o,j)=>`<label class="opt"><input type="radio" name="q${i}" value="${j}" ${s&&s.ans?.[i]===j?'checked':''}> ${esc(o)}</label>`).join('')}<div id="fb${i}" class="fb"></div></div>`).join('')}
  <button class="btn g" onclick="gradeQuiz('${a.id}')">Check my answers</button></div>`}
function gradeQuiz(id){const a=allAsg().find(x=>x.id===id),q=QUIZ[a.quiz];let sc=0;const ans=[];
  q.qs.forEach((x,i)=>{const c=document.querySelector(`input[name=q${i}]:checked`),v=c?+c.value:-1;ans.push(v);const ok=v===x[2];if(ok)sc++;
    $('#fb'+i).innerHTML=ok?`<span class="okk">✅ Correct. ${esc(x[3])}</span>`:`<span class="bad">❌ Answer: ${esc(x[1][x[2]])}. ${esc(x[3])}</span>`});
  S.sub[me+'/'+id]={score:sc,ans,at:new Date().toISOString()};save();toast(`Score: ${sc}/${q.qs.length}`)}

// ---------- student: courses / act / career / links ----------
function vCourses(){const mine=Object.keys(COURSES).filter(c=>COURSE_WHO[c].includes(me));
  return`<h1>My courses</h1>`+mine.map(c=>{const o=COURSES[c],l=asgFor(me).filter(a=>a.course===c),dn=l.filter(a=>!['todo','late'].includes(stateOf(me,a))).length;
    return`<div class="card"><h3>${o.e} ${esc(o.name)}</h3><p class="sm mut">${esc(o.std)}</p><div class="bar"><i style="width:${l.length?dn/l.length*100:0}%"></i></div><p class="sm">${dn}/${l.length} assignments done</p>
    <ul class="sm">${(OUTLINES[c]||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`}).join('')}
function vAct(){return`<h1>🎯 ACT: schedule it now</h1>
  <div class="card"><a class="btn g" href="${LINKS.actReg}" target="_blank" rel="noopener">Register on act.org</a> <a class="btn s" href="${LINKS.actDates}" target="_blank" rel="noopener">Dates & fees</a> <a class="btn s" href="${LINKS.actPrep}" target="_blank" rel="noopener">Free prep</a>
  <table><tr><th>Test date</th><th>Register by</th><th>Late fee by</th></tr>${ACT_DATES.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table>
  <p class="sm mut">Deadlines from act.org; double-check there before paying.</p></div>
  <div class="card"><h3>Steps</h3><ol><li>Create an ACT account at act.org (use your legal name as on your ID).</li><li>Pick a date and search \u201CSlidell, LA\u201D for centers. Choose the one closest and quietest.</li><li>Upload a clear photo for your ticket.</li><li>Pay and save the confirmation.</li><li>Tell Mrs. K the date. She will add it to your calendar.</li></ol></div>
  ${me==='ryley'?`<div class="card good"><h3>💛 A calmer test day (Ryley)</h3><p class="sm">ACT tests are held on Saturdays. Sunday or other non-Saturday testing is only offered for a religious conflict, so Sunday isn\u2019t an option for anxiety. These can help instead:</p><ul class="sm"><li>Ask Mrs. K to request <b>accommodations</b> (separate or small-room testing, extended time). A counselor or doctor can support the request. <a href="${LINKS.actAccom}" target="_blank" rel="noopener">ACT accommodations</a></li><li>Choose a smaller school test center, and visit the building beforehand.</li><li>Take a full practice test at home first, timed, so test day feels familiar.</li></ul></div>`:''}
  <div class="card"><h3>Daily practice</h3><p class="sm">Do one mini-quiz each week: ACT English and Math are in <b>This Week</b>.</p></div>`}
function vCareer(){const w=me==='jackson';return`<h1>${w?'🔥 Welding path':'🩺 Ultrasound path'}</h1>
  <div class="card"><ul class="sm">${(w?OUTLINES.weld:OUTLINES.ultra).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
  <div class="card good"><p>${SIM_TEASER[w?'weld':'ultrasound']}</p></div>
  <div class="card"><h3>Checklist</h3>${(w?['Choose a votech school and list its start date','Ask about financial aid & Pell grant','Get OSHA 10 / first aid','Underwater welding: commercial diver school + welding certs (research with Mrs. K)']:['Pick your online institution and application date','List prerequisites (A&P, med term, math)','Ask about clinical placement near Slidell','Shadow a sonographer if possible']).map(x=>`<label class="opt"><input type="checkbox" ${S.sub[me+'/ck:'+x]?'checked':''} onchange="ck('${esc(x).replace(/'/g,'\\\'')}',this.checked)"> ${esc(x)}</label>`).join('')}</div>`}
function ck(x,v){S.sub[me+'/ck:'+x]=v;save()}
function vLinks(){return`<h1>🔗 Links</h1><div class="card"><a class="btn g" href="${LINKS.study}" target="_blank" rel="noopener">Open study.com</a><p class="sm mut">Do your self-paced study.com lessons first, then come back for the extension activities.</p></div>`}

// ---------- parent ----------
function vOverview(){return`<h1>Progress</h1>`+STUDENTS.map(p=>{const l=asgFor(p),done=l.filter(a=>!['todo','late'].includes(stateOf(p,a))).length,late=l.filter(a=>stateOf(p,a)==='late').length,sub=l.filter(a=>stateOf(p,a)==='submitted').length;
  const gr=l.map(a=>{const g=gradeOf(p,a.id);if(!g)return null;const t=(RUB[a.rub]||RUB.gen).reduce((x,r)=>x+r[1],0);return g.scores.reduce((x,y)=>x+y,0)/t}).filter(x=>x!==null);
  const qs=l.filter(a=>a.quiz&&subOf(p,a.id)).map(a=>subOf(p,a.id).score/QUIZ[a.quiz].qs.length),all=gr.concat(qs);
  return`<div class="card"><h3>${person(p).e} ${person(p).name}</h3><div class="bar"><i style="width:${l.length?done/l.length*100:0}%"></i></div><p class="sm">${done}/${l.length} done · ${sub} awaiting grading · ${late} past due · average ${all.length?Math.round(all.reduce((x,y)=>x+y,0)/all.length*100)+'%':'n/a'}</p>
  ${l.map(a=>`<div class="row click" onclick="reviewOpen('${p}','${a.id}')"><span class="grow">${COURSES[a.course].e} ${esc(a.title)} <span class="sm mut">due ${fdate(a.due)}</span></span>${chip(stateOf(p,a))}</div>`).join('')}</div>`}).join('')}
function reviewOpen(p,id){const a=allAsg().find(x=>x.id===id);if(a.quiz){const s=subOf(p,id);return toast(s?`Quiz ${s.score}/${QUIZ[a.quiz].qs.length}`:'Not taken yet')}tab='grade';sel=p+'|'+id;render()}
function vGrade(){
  if(sel&&sel.includes('|')){const[p,id]=sel.split('|'),a=allAsg().find(x=>x.id===id),s=subOf(p,id),g=gradeOf(p,id)||{scores:[],comment:''},rub=RUB[a.rub]||RUB.gen;
    return`<button class="btn s sm" onclick="sel=null;render()">← Back</button><h1>${esc(person(p).name)}: ${esc(a.title)}</h1>
    <div class="card"><p class="sm mut">${s?'Submitted '+new Date(s.at).toLocaleString()+(lateDays(a,s)?` · ${lateDays(a,s)} day(s) late (−${lateDays(a,s)*10}%)`:''):'Nothing submitted yet'}</p><div class="work">${esc(s?.text||'')}</div>${s?.link?`<a href="${esc(s.link)}" target="_blank" rel="noopener">Open linked file</a>`:''}</div>
    <div class="card"><h3>Rubric</h3>${rub.map((r,i)=>`<div class="row"><span class="grow">${esc(r[0])}</span><input type="number" id="sc${i}" min="0" max="${r[1]}" value="${g.scores[i]??''}" style="width:70px"> / ${r[1]}</div>`).join('')}
    <h4>Quick feedback</h4><div>${BANK.strong.concat(BANK.grow).map(t=>`<button class="btn s sm" onclick="addC(this)" data-t="${esc(t)}">${esc(t)}</button>`).join(' ')}</div>
    <textarea id="gc" rows="4" placeholder="Comment (student sees this instantly)">${esc(g.comment)}</textarea>
    <button class="btn g" onclick="saveGrade('${p}','${id}')">Save & send feedback</button></div>`}
  const q=[];STUDENTS.forEach(p=>asgFor(p).forEach(a=>{if(!a.quiz&&stateOf(p,a)==='submitted')q.push([p,a])}));
  return`<h1>To grade (${q.length})</h1><div class="card">${q.map(([p,a])=>`<div class="row click" onclick="sel='${p}|${a.id}';render()"><span class="grow">${person(p).e} ${esc(a.title)}</span><span class="sm mut">${person(p).name}</span></div>`).join('')||'<p class="mut">Nothing waiting.</p>'}</div>`}
function addC(b){const t=$('#gc');t.value=(t.value?t.value+' ':'')+b.dataset.t}
function saveGrade(p,id){const a=allAsg().find(x=>x.id===id),rub=RUB[a.rub]||RUB.gen;
  const scores=rub.map((r,i)=>Math.max(0,Math.min(r[1],+($('#sc'+i).value||0))));
  S.grade[p+'/'+id]={scores,comment:$('#gc').value,at:new Date().toISOString()};save();toast('Feedback saved');sel=null;render()}
function vAssign(){return`<h1>Post an assignment</h1><div class="card">
  <input id="at" placeholder="Title"><select id="ac">${Object.entries(COURSES).map(([k,c])=>`<option value="${k}">${c.name}</option>`).join('')}</select>
  <input id="ad" type="date" value="${addDays(dkey(),(4-new Date().getDay()+7)%7||7)}">
  <label class="opt"><input type="checkbox" id="aj" checked> Jackson</label><label class="opt"><input type="checkbox" id="ar" checked> Ryley</label>
  <select id="arub"><option value="journal">Journal rubric</option><option value="essay">Essay rubric</option><option value="creative">Creative rubric</option><option value="econ">Economics rubric</option><option value="gen">General rubric</option></select>
  <textarea id="adesc" rows="4" placeholder="Instructions / extension activity"></textarea><textarea id="asteps" rows="4" placeholder="Suggested steps, one per line"></textarea>
  <input id="alink" placeholder="Optional study.com lesson link">
  <button class="btn g" onclick="postAsg()">Post</button></div>
  <div class="card"><h3>Posted by you</h3>${S.custom.map(a=>`<div class="row"><span class="grow">${esc(a.title)} · ${fdate(a.due)}</span><button class="btn r sm" onclick="delAsg('${a.id}')">Delete</button></div>`).join('')||'<p class="mut">None yet</p>'}</div>`}
function postAsg(){const t=$('#at').value.trim();if(!t)return toast('Title?');const who=[];if($('#aj').checked)who.push('jackson');if($('#ar').checked)who.push('ryley');if(!who.length)return toast('Pick a student');
  const l=safeUrl($('#alink').value.trim());
  S.custom.push({id:'c'+Date.now(),course:$('#ac').value,title:t,due:$('#ad').value,who,rub:$('#arub').value,min:50,desc:$('#adesc').value+(l?`\nLesson: ${l}`:''),steps:$('#asteps').value.split('\n').map(x=>x.trim()).filter(Boolean),std:''});save();toast('Posted');render()}
function delAsg(id){S.custom=S.custom.filter(a=>a.id!==id);save();render()}

// ---------- hours & invoices ----------
const RATE={direct:30,admin:40},JFLAT=200;
function vHours(){const wk=weekStart(),hs=S.private.hours;
  return`<h1>Log hours</h1><div class="card"><div class="row"><input type="date" id="hd" value="${dkey()}"><select id="hs"><option value="ryley">Ryley</option><option value="jackson">Jackson</option></select></div>
  <div class="row"><select id="ht"><option value="direct">Direct teaching ($30/hr)</option><option value="admin">Curriculum / admin / records ($40/hr)</option></select><input type="number" id="hh" step="0.25" min="0" placeholder="Hours" style="width:90px"></div>
  <input id="hn" placeholder="Note (what you did)"><button class="btn g" onclick="addHrs()">Add</button></div>
  <div class="card"><h3>Recent</h3>${hs.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,25).map(h=>`<div class="row"><span class="grow">${fdate(h.date)} · ${person(h.who).name} · ${h.type==='direct'?'Direct':'Admin'} · ${h.hrs}h <span class="sm mut">${esc(h.note||'')}</span></span><button class="btn r sm" onclick="delHrs('${h.id}')">✕</button></div>`).join('')||'<p class="mut">No entries</p>'}</div>`}
function addHrs(){const h=+$('#hh').value;if(!h)return toast('Enter hours');S.private.hours.push({id:'h'+Date.now(),date:$('#hd').value,who:$('#hs').value,type:$('#ht').value,hrs:h,note:$('#hn').value});save();toast('Logged');render()}
function delHrs(id){S.private.hours=S.private.hours.filter(h=>h.id!==id);save();render()}
let invWk=weekStart(),invWho='ryley';
function invData(){const end=addDays(invWk,6),hs=S.private.hours.filter(h=>h.who===invWho&&h.date>=invWk&&h.date<=end),
  d=hs.filter(h=>h.type==='direct').reduce((a,h)=>a+h.hrs,0),ad=hs.filter(h=>h.type==='admin').reduce((a,h)=>a+h.hrs,0);
  const flat=invWho==='jackson';return{hs,d,ad,end,total:flat?JFLAT:d*RATE.direct+ad*RATE.admin,flat}}
function vInvoice(){const pr=S.private.profile,x=invData(),bill=pr[invWho]||{};
  return`<div class="noprint"><h1>Weekly invoice</h1><div class="row"><select onchange="invWho=this.value;render()"><option value="ryley" ${invWho==='ryley'?'selected':''}>Ryley (billed to ${esc(pr.ryley?.billTo||'Ryan Audibert')})</option><option value="jackson" ${invWho==='jackson'?'selected':''}>Jackson (flat $${JFLAT})</option></select>
  <button class="btn s sm" onclick="invWk=addDays(invWk,-7);render()">◀</button><b>${fdate(invWk)} – ${fdate(x.end)}</b><button class="btn s sm" onclick="invWk=addDays(invWk,7);render()">▶</button></div>
  <button class="btn g" onclick="window.print()">🖨️ Save as PDF / print</button>
  ${bill.phone?`<a class="btn s" href="sms:${esc(bill.phone)}&body=${encodeURIComponent(`Invoice for ${person(invWho).name}, week of ${fdate(invWk)}: $${x.total}. K\u2019s Academy of Excellence.`)}">💬 Text it</a>`:'<p class="sm mut">Add a phone number in Settings to enable Text.</p>'}
  <p class="sm mut">Tip: Print → Save as PDF, then share the file from your phone.</p></div>
  <div class="invoice"><h2>K\u2019s Academy of Excellence</h2><p>Jeanne Koniditsiotis, LA Certified Educator<br>Slidell, Louisiana</p><hr>
  <p><b>Bill to:</b> ${esc(bill.billTo||'')}<br>${esc(bill.addr||'')}<br><b>Student:</b> ${esc(person(invWho).name)}<br><b>Week:</b> ${fdate(invWk)} – ${fdate(x.end)}</p>
  <table><tr><th>Date</th><th>Type</th><th>Note</th><th>Hours</th></tr>${x.hs.sort((a,b)=>a.date.localeCompare(b.date)).map(h=>`<tr><td>${fdate(h.date)}</td><td>${h.type==='direct'?'Direct teaching':'Curriculum/admin'}</td><td>${esc(h.note||'')}</td><td>${h.hrs}</td></tr>`).join('')||'<tr><td colspan=4>No hours logged</td></tr>'}</table>
  ${x.flat?`<p>Weekly flat rate: <b>$${JFLAT.toFixed(2)}</b> (logged ${(x.d+x.ad).toFixed(2)} hrs)</p>`:`<p>Direct teaching: ${x.d} h × $30 = $${(x.d*30).toFixed(2)}<br>Curriculum/admin: ${x.ad} h × $40 = $${(x.ad*40).toFixed(2)}</p>`}
  <h2>Total due: $${x.total.toFixed(2)}</h2></div>`}

// ---------- parent-only check-in ----------
const PROMPTS=['What was the best part of your week?','What felt hardest, and what helped?','How are you sleeping and eating?','What are you looking forward to?','Is anything making school feel heavy right now?'];
function vCheckin(){const c=S.private.checkins;
  return`<h1>💬 Weekly check-in <span class="chip c-sub">private to you</span></h1><div class="card"><select id="cp"><option value="ryley">Ryley</option><option value="jackson">Jackson</option></select><input type="date" id="cd" value="${dkey()}">
  ${[['mood','Mood'],['stress','Stress'],['sleep','Sleep quality']].map(([k,l])=>`<div class="row"><span class="grow">${l} (1 low \u2013 5 high)</span><select id="c_${k}">${[1,2,3,4,5].map(n=>`<option ${n===3?'selected':''}>${n}</option>`).join('')}</select></div>`).join('')}
  <p class="sm mut">Try asking: ${PROMPTS.map(esc).join(' · ')}</p><textarea id="cn" rows="4" placeholder="What they shared, what you noticed, next step\u2026"></textarea><button class="btn g" onclick="addCheck()">Save</button>
  <p class="sm mut">This is a wellness log for you, not a clinical record. If Ryley\u2019s anxiety is affecting daily life, a licensed counselor can help; the ACT accommodations request also needs one.</p></div>
  <div class="card"><h3>History</h3>${c.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(x=>`<div class="row"><span class="grow"><b>${person(x.who).name}</b> ${fdate(x.date)} · mood ${x.mood} · stress ${x.stress} · sleep ${x.sleep}<div class="sm">${esc(x.note)}</div></span><button class="btn r sm" onclick="delCheck('${x.id}')">✕</button></div>`).join('')||'<p class="mut">No entries</p>'}</div>`}
function addCheck(){S.private.checkins.push({id:'k'+Date.now(),who:$('#cp').value,date:$('#cd').value,mood:+$('#c_mood').value,stress:+$('#c_stress').value,sleep:+$('#c_sleep').value,note:$('#cn').value});save();toast('Saved');render()}
function delCheck(id){S.private.checkins=S.private.checkins.filter(x=>x.id!==id);save();render()}
function vSettings(){const p=S.private.profile;
  return`<h1>Settings</h1>${['ryley','jackson'].map(k=>{const b=p[k]||{};return`<div class="card"><h3>${person(k).name} invoice details</h3><input id="bt_${k}" placeholder="Bill to name" value="${esc(b.billTo||(k==='ryley'?'Ryan Audibert':''))}"><textarea id="ba_${k}" rows="2" placeholder="Address">${esc(b.addr||'')}</textarea><input id="bp_${k}" placeholder="Phone (for Text)" value="${esc(b.phone||'')}"></div>`}).join('')}
  <button class="btn g" onclick="saveProfile()">Save</button><p class="sm mut">Addresses and phone numbers stay in the private database and are never in the app code.</p>
  <div class="card"><h3>Reset a PIN</h3>${PEOPLE.map(x=>`<button class="btn s sm" onclick="resetPin('${x.id}')">${x.name}</button>`).join(' ')}</div>`}
function saveProfile(){['ryley','jackson'].forEach(k=>S.private.profile[k]={billTo:$('#bt_'+k).value,addr:$('#ba_'+k).value,phone:$('#bp_'+k).value});save();toast('Saved')}
function resetPin(id){delete pins[id];localStorage.setItem('kae_pins',JSON.stringify(pins));toast('PIN reset')}

if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
render();
