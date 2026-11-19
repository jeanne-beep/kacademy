'use strict';
// ---------- Career simulators: welding bead lab (Jaxson) and ultrasound image lab (Ryley) ----------
let simBusy=false;
const simRec=k=>S.sub[me+'/sim:'+k];
function simSave(k,score){const o=S.sub[me+'/sim:'+k]||{best:0,tries:0};S.sub[me+'/sim:'+k]={best:Math.max(o.best,score),tries:o.tries+1,last:score,at:new Date().toISOString()};save()}
function simLine(p){const r=['weld','us'].map(k=>S.sub[p+'/sim:'+k]).filter(Boolean)[0];
  return r?`<p class="sm mut">🧪 Simulator: best ${r.best}% in ${r.tries} tries (last ${r.last}%)</p>`:`<p class="sm mut">🧪 Simulator: not tried yet</p>`}
const vSim=()=>me==='jackson'?vWeldSim():vUsSim();

// mini quiz helper: instant feedback, nothing stored but the score
const MQ={};
function mqHtml(set,items,pre){return items.map((q,i)=>{const k=set+i,got=MQ[k];
  return`<div class="qq"><b>${i+1}.</b> ${pre?pre(q,i):''}${esc(q.q)}${q.opts.map((o,j)=>`<button class="btn full ${got===undefined?'s':j===q.a?'g':got===j?'r':'s'}" ${got!==undefined?'disabled':''} onclick="mqPick('${set}',${i},${j})">${esc(o)}</button>`).join('')}
  ${got!==undefined?`<div class="fb ${got===q.a?'okk':'bad'}">${got===q.a?'✔ Correct. ':'✘ Not quite. '}${esc(q.why)}</div>`:''}</div>`}).join('')}
function mqPick(set,i,j){MQ[set+i]=j;render()}

// ===== WELDING =====
const WB={arc:[38,62],ang:[40,60],spd:[35,65]};
const WN={arc:'Arc length',ang:'Work angle',spd:'Travel speed'};
const WH={arc:['too short: electrode sticks, spatter','too long: porosity (gas holes), spatter, weak weld'],ang:['angle off: uneven bead, undercut on one side','angle off: uneven bead, undercut on one side'],spd:['too slow: pile-up, excess buildup, burn-through','too fast: thin ropey bead, lack of fusion']};
const WTIPS={arc:'Hold the arc about the width of the electrode core wire.',ang:'Keep a steady work angle (about 10\u201315\u00b0 drag) and let your wrist stay relaxed.',spd:'Watch the puddle: move at the speed that keeps it about 2\u00d7 the electrode width.'};
let W={on:false,t:0,max:150,g:{arc:50,ang:50,spd:50},dr:{arc:0,ang:0,spd:0},good:0,faults:{},seg:[],done:null},wTimer=0;
const wBad=(k,v)=>v<WB[k][0]?0:v>WB[k][1]?1:-1;
function swReset(){W={on:false,t:0,max:150,g:{arc:50,ang:50,spd:50},dr:{arc:0,ang:0,spd:0},good:0,faults:{},seg:[],done:null};clearInterval(wTimer);simBusy=false}
function swStep(rnd=Math.random){
  const bad=[];
  for(const k in W.g){W.dr[k]=W.dr[k]*.8+(rnd()-.5)*1.6;W.g[k]=Math.max(0,Math.min(100,W.g[k]+W.dr[k]));
    const b=wBad(k,W.g[k]);if(b>=0){bad.push(k);W.faults[k+b]=(W.faults[k+b]||0)+1}}
  W.t++;if(!bad.length)W.good++;
  W.seg.push({ok:!bad.length,w:8+Math.round(W.g.spd/100*14)});
  if(W.t>=W.max)swFinish();}
function swFinish(){clearInterval(wTimer);simBusy=false;W.on=false;const s=Math.round(W.good/W.max*100);W.done=s;simSave('weld',s);render()}
function swAdj(k,d){if(!W.on)return;W.g[k]=Math.max(0,Math.min(100,W.g[k]+d*7));swPaint()}
function swStart(){const ok=[...document.querySelectorAll('.wchk')].every(c=>c.checked);if(!ok)return toast('Finish the safety check first');
  swReset();W.on=true;simBusy=true;render();wTimer=setInterval(()=>{swStep();swPaint()},200)}
function swPaint(){if(!W.on)return;
  for(const k in W.g){const el=document.getElementById('wg_'+k);if(el){el.style.left=W.g[k]+'%';el.className='needle '+(wBad(k,W.g[k])<0?'ok':'no')}}
  const bar=document.getElementById('wbead');if(bar){bar.innerHTML=W.seg.slice(-60).map(s=>`<i style="height:${s.w}px;background:${s.ok?'#f97316':'#6b7280'}"></i>`).join('')}
  const t=document.getElementById('wtime');if(t)t.textContent=Math.max(0,Math.round((W.max-W.t)/5))+' s'}
function vWeldSim(){
  const r=simRec('weld');
  if(W.on)return`<h1>🔥 Bead lab</h1><div class="card"><p class="sm">Keep all three needles inside the green zone. Tap − / + to correct them as they drift. <b id="wtime"></b></p>
  ${['arc','ang','spd'].map(k=>`<div class="gauge"><div class="gl"><b>${WN[k]}</b> <span class="sm mut">${WTIPS[k]}</span></div>
   <div class="gtrack"><div class="gzone" style="left:${WB[k][0]}%;width:${WB[k][1]-WB[k][0]}%"></div><div id="wg_${k}" class="needle ok" style="left:${W.g[k]}%"></div></div>
   <div class="row"><button class="btn s grow" onclick="swAdj('${k}',-1)">−</button><button class="btn s grow" onclick="swAdj('${k}',1)">+</button></div></div>`).join('')}
  <h3>Your bead</h3><div class="bead" id="wbead"></div><p class="sm mut">Orange = good weld. Gray = defect.</p></div>`;
  if(W.done!==null){const f=Object.entries(W.faults).sort((a,b)=>b[1]-a[1]);
    return`<h1>🔥 Bead lab results</h1><div class="card ${W.done>=70?'good':''}"><h2>${W.done}%</h2>
    <p>${W.done>=85?'Shop ready! Clean, consistent bead.':W.done>=70?'Solid. A little more control and you are there.':'Keep practicing. Everyone starts here.'}</p>
    ${f.length?`<h3>What went wrong</h3><ul>${f.slice(0,3).map(([k,n])=>`<li><b>${WN[k.slice(0,3)]}</b> ${WH[k.slice(0,3)][+k[3]]} <span class="mut">(${Math.round(n/W.max*100)}% of the bead)</span></li>`).join('')}</ul>`:'<p>No defects. 🎉</p>'}
    <button class="btn g" onclick="swReset();render()">Try again</button></div>`+vWeldQ()}
  return`<h1>🔥 Welding bead lab</h1>
  <div class="card"><p>You are running a bead on mild steel plate. Three things decide whether the weld is strong: <b>arc length</b>, <b>work angle</b> and <b>travel speed</b>. They drift, and your job is to keep them in range for 30 seconds.</p>
  ${r?`<p class="sm mut">Best score: ${r.best}% · ${r.tries} tries</p>`:''}</div>
  <div class="card"><h3>✅ Safety check first</h3><p class="sm mut">You would never strike an arc without these.</p>
  ${['Welding helmet down with the correct shade lens','Dry welding gloves and flame-resistant long sleeves','Combustibles cleared (35 ft) and extinguisher within reach','Ventilation or fume extraction on','Ground clamp on clean bare metal'].map(x=>`<label class="opt"><input type="checkbox" class="wchk"> ${x}</label>`).join('')}
  <button class="btn g" onclick="swStart()">▶ Start welding</button></div>`+vWeldQ()}
const WQ=[
 {q:'Your bead has small holes (porosity). The most likely cause?',opts:['Arc held too long or shielding gas disturbed','Travel too slowly','Plate too thick','Gloves too thick'],a:0,why:'A long arc or wind lets air into the weld pool, leaving gas holes.'},
 {q:'The bead is thin and ropey with poor fusion at the edges. What do you change?',opts:['Slow down your travel speed','Speed up','Lengthen the arc','Change the helmet'],a:0,why:'Too fast leaves too little heat and metal at the joint. Slow down.'},
 {q:'The electrode keeps sticking to the plate. Likely cause?',opts:['Arc too short or amperage too low','Arc too long','Too much shielding gas','Wrong gloves'],a:0,why:'A short arc or low heat makes the rod freeze to the work.'},
 {q:'Undercut (a groove melted into the edge of the plate) usually comes from…',opts:['Too much heat/speed or a poor work angle','Too little heat','Clean metal','A short arc'],a:0,why:'Excess heat or the wrong angle melts away the edge without filling it.'},
 {q:'Why grind off mill scale and rust before welding?',opts:['Contamination causes porosity and weak welds','It makes the metal heavier','It is only cosmetic','It cools the metal'],a:0,why:'Clean base metal gives a clean, strong weld.'},
 {q:'Which hazard is unique to the arc itself?',opts:['UV/IR light that burns eyes and skin','Noise only','Cold metal','Lack of oxygen from the sun'],a:0,why:'Arc flash can burn unprotected skin and cause arc eye within seconds.'}];
const vWeldQ=()=>`<div class="card"><h3>🔍 Defect detective</h3>${mqHtml('wq',WQ)}</div>`;

// ===== ULTRASOUND =====
let usN=0;
function usSvg(kind,opt={}){
  const id='u'+(++usN),bg='#2d2d2d',fan='M100 4 L8 150 Q100 182 192 150 Z';
  const speck=`<filter id="f${id}"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${usN%9+2}"/><feColorMatrix type="saturate" values="0"/></filter>`;
  const body={
   cyst:`<ellipse cx="100" cy="80" rx="22" ry="16" fill="#050505"/><rect x="70" y="96" width="60" height="50" fill="#7a7a7a" opacity=".45"/>`,
   gall:`<ellipse cx="100" cy="72" rx="30" ry="22" fill="#050505"/><ellipse cx="100" cy="88" rx="7" ry="3" fill="#f5f5f5"/><rect x="93" y="91" width="14" height="60" fill="#030303" opacity=".9"/>`,
   bladder:`<ellipse cx="100" cy="100" rx="52" ry="36" fill="#050505"/><ellipse cx="100" cy="100" rx="52" ry="36" fill="none" stroke="#d8d8d8" stroke-width="2"/>`,
   kidney:`<ellipse cx="100" cy="85" rx="48" ry="26" fill="#4a4a4a"/><ellipse cx="100" cy="85" rx="22" ry="10" fill="#e8e8e8"/><ellipse cx="82" cy="78" rx="6" ry="4" fill="#202020"/><ellipse cx="118" cy="92" rx="6" ry="4" fill="#202020"/>`,
   mass:`<path d="M72 70 Q100 48 130 72 Q138 96 104 104 Q74 100 72 70Z" fill="#1d1d1d" stroke="#8a8a8a" stroke-width="1.5" stroke-dasharray="3 2"/>`,
   rib:`<path d="M30 55 Q100 35 170 55" fill="none" stroke="#fafafa" stroke-width="4"/><rect x="30" y="58" width="140" height="95" fill="#050505" opacity=".85"/>`}[kind];
  const gain=opt.gain??50,bright=(.35+gain/60).toFixed(2),sc=opt.scale||1;
  return`<svg viewBox="0 0 200 170" class="us" role="img" aria-label="ultrasound image"><defs>${speck}<clipPath id="c${id}"><path d="${fan}"/></clipPath></defs>
  <rect width="200" height="170" fill="#000"/><g clip-path="url(#c${id})" style="filter:brightness(${bright})"><rect width="200" height="170" fill="${bg}"/><g transform="translate(100 80) scale(${sc}) translate(-100 -80)">${body}</g><rect width="200" height="170" filter="url(#f${id})" opacity=".35"/></g>
  <text x="6" y="12" fill="#9ca3af" font-size="7">${opt.label||'Abdomen'}</text></svg>`}
const USQ=[
 {k:'cyst',q:'This image shows a black, round, smooth structure with a bright area beneath it. What is it?',opts:['Simple cyst (posterior enhancement)','Gallstone','Rib','Solid mass'],a:0,why:'Fluid lets sound through, so the tissue behind looks brighter: posterior acoustic enhancement.'},
 {k:'gall',q:'A black gallbladder with a bright echo at the bottom and a black stripe behind it. What is this?',opts:['Gallstone with acoustic shadowing','Kidney','Bladder','Cyst'],a:0,why:'Stones reflect nearly all the sound, leaving a dark acoustic shadow behind.'},
 {k:'bladder',q:'A large black area with a thin bright wall in the pelvis. What is this?',opts:['Fluid-filled bladder','Solid tumor','Bone','Kidney'],a:0,why:'Urine is anechoic (no echoes), so it appears black, and a full bladder is a good acoustic window.'},
 {k:'kidney',q:'An oval organ with a bright center and darker outer tissue. What is this?',opts:['Kidney (bright renal sinus)','Gallstone','Bladder','Rib'],a:0,why:'The renal sinus fat reflects strongly. The cortex and pyramids are darker.'},
 {k:'mass',q:'A dark, irregular area with uneven borders and no posterior enhancement. What is the best description?',opts:['Hypoechoic solid-appearing mass','Anechoic cyst','Bone','Normal bladder'],a:0,why:'Gray (hypoechoic), irregular, and no enhancement suggests solid tissue. It needs the sonographer\u2019s and a radiologist\u2019s follow-up.'},
 {k:'rib',q:'A bright curved line with a dark area under it. What is this?',opts:['Rib or bone causing shadowing','Cyst','Kidney sinus','Fluid'],a:0,why:'Bone reflects almost all sound. Nothing deeper can be seen behind it.'}];
const USK=[
 {q:'Which probe do you choose for a deep adult abdomen scan?',opts:['Curvilinear, low frequency (about 2\u20135 MHz)','Linear, high frequency (7\u201312 MHz)','Any, it makes no difference','Phased array only'],a:0,why:'Low frequency penetrates deeper. High frequency gives finer detail but only for shallow structures.'},
 {q:'The image is too dark overall. What do you adjust first?',opts:['Gain','Gel','Probe marker','Patient age'],a:0,why:'Gain controls the overall brightness of the received echoes.'},
 {q:'"Anechoic" means…',opts:['No echoes (black)','Very bright','Moving','Calcified'],a:0,why:'Fluid-filled structures are anechoic.'},
 {q:'Why do we use gel?',opts:['To remove air between probe and skin','To cool the probe','To numb the skin','To make the image brighter'],a:0,why:'Air blocks ultrasound. Gel couples the sound into the body.'},
 {q:'Increasing frequency (MHz) generally…',opts:['Improves detail but reduces depth','Improves depth but reduces detail','Does nothing','Makes everything brighter'],a:0,why:'There is a trade-off between resolution and penetration.'},
 {q:'A dark band behind a very bright structure is called…',opts:['Acoustic shadowing','Posterior enhancement','Reverberation','Gain'],a:0,why:'Strong reflectors such as stones and bone block sound.'}];
let UL={probe:0,depth:14,gain:50,done:null};
const UP=['Linear, 7\u201312 MHz (superficial)','Curvilinear, 2\u20135 MHz (abdomen)','Phased array, 1\u20134 MHz (heart)'];
function usUpdate(){UL.probe=+document.getElementById('ul_p').value;UL.depth=+document.getElementById('ul_d').value;UL.gain=+document.getElementById('ul_g').value;
  document.getElementById('ul_img').innerHTML=usSvg('gall',{gain:UL.gain,scale:Math.min(1.5,Math.max(.55,12/UL.depth)),label:'Abdomen \u00b7 '+UL.depth+' cm'});
  document.getElementById('ul_dv').textContent=UL.depth+' cm';document.getElementById('ul_gv').textContent=UL.gain}
function usCheck(){usUpdate();const f=[],ok=[];
  UL.probe===1?ok.push('Probe: curvilinear is right for a deep abdomen.'):f.push('Probe: for the gallbladder in an adult abdomen use the curvilinear low-frequency probe.');
  UL.depth>=10&&UL.depth<=16?ok.push('Depth: the gallbladder sits mid-screen with room to see behind it.'):f.push(UL.depth<10?'Depth too shallow: you cut off the structures behind the gallbladder.':'Depth too deep: the gallbladder is small on the screen. Pull the depth back.');
  UL.gain>=40&&UL.gain<=65?ok.push('Gain: the tissue is mid-gray and the gallbladder is black.'):f.push(UL.gain<40?'Gain too low: the tissue is too dark to see the borders.':'Gain too high: the fluid fills in with false echoes.');
  const s=Math.round(ok.length/3*100);UL.done={s,f,ok};simSave('us',s);render()}
function vUsSim(){const r=simRec('us');
  return`<h1>🩺 Ultrasound image lab</h1>
  <div class="card"><h3>Part 1: Set up the scan</h3><p class="sm">Patient: adult, right upper abdomen. Goal: a clear image of the <b>gallbladder</b>. Pick the probe and adjust depth and gain.${r?` <span class="mut">Best: ${r.best}%.</span>`:''}</p>
  <div id="ul_img" class="usbox">${usSvg('gall',{gain:UL.gain,scale:Math.min(1.5,Math.max(.55,12/UL.depth)),label:'Abdomen \u00b7 '+UL.depth+' cm'})}</div>
  <label class="sm mut">Probe</label><select id="ul_p" onchange="usUpdate()">${UP.map((o,i)=>`<option value="${i}"${UL.probe===i?' selected':''}>${o}</option>`).join('')}</select>
  <label class="sm mut">Depth: <b id="ul_dv">${UL.depth} cm</b></label><input type="range" id="ul_d" min="4" max="24" value="${UL.depth}" oninput="usUpdate()">
  <label class="sm mut">Gain: <b id="ul_gv">${UL.gain}</b></label><input type="range" id="ul_g" min="0" max="100" value="${UL.gain}" oninput="usUpdate()">
  <button class="btn g" onclick="usCheck()">Check my settings</button>
  ${UL.done?`<div class="check"><b>${UL.done.s}%</b><br>${UL.done.ok.map(x=>'✔ '+esc(x)).join('<br>')}${UL.done.f.length?'<br>'+UL.done.f.map(x=>'✘ '+esc(x)).join('<br>'):''}</div>`:''}</div>
  <div class="card"><h3>Part 2: Name that finding</h3>${mqHtml('uq',USQ,q=>`<div class="usbox sm">${usSvg(q.k,{label:'Image '})}</div>`)}</div>
  <div class="card"><h3>Part 3: Knobology</h3>${mqHtml('uk',USK)}</div>`}

