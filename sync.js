'use strict';
// ---------- K's Academy sync (Supabase) ----------
// Every key of S (objects split one level deeper) is one row in `kv`. Row-level security decides who can read/write what.
let sb=null,syncOn=false,syncState='',snap=JSON.parse(localStorage.getItem('kae_snap')||'{}'),pushT=0,pushing=false,renderT=0;
const saveSnap=()=>localStorage.setItem('kae_snap',JSON.stringify(snap));
const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);
const canWrite=p=>me==='jeanne'||(!!me&&(p.startsWith('sub/'+me+'/')||p.startsWith('cal/')));

function flat(){const o={};
  for(const k in S){const v=S[k];
    if(isObj(v)){for(const s in v)if(v[s]!==undefined)o[k+'/'+s]=JSON.stringify(v[s])}
    else if(v!==undefined)o[k]=JSON.stringify(v)}
  return o}
function setPath(p,v){const i=p.indexOf('/');if(i<0){S[p]=v;return}
  const a=p.slice(0,i),b=p.slice(i+1);if(!isObj(S[a]))S[a]={};S[a][b]=v}
function delPath(p){const i=p.indexOf('/');if(i>0){const a=p.slice(0,i);if(isObj(S[a]))delete S[a][p.slice(i+1)]}}

function setSyncState(s){syncState=s;let d=document.getElementById('syncdot');
  if(!d){d=document.createElement('div');d.id='syncdot';d.className='syncdot';document.body.appendChild(d)}
  d.textContent=s==='ok'?'☁️ synced':s==='offline'?'⚠️ offline, will retry':'☁️ …';d.classList.toggle('bad',s==='offline')}

function softRender(){
  const a=document.activeElement,busy=a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName),modalOpen=!$('#modal').classList.contains('hidden');
  if(busy||modalOpen){clearTimeout(renderT);renderT=setTimeout(softRender,3000);return}
  render()}

async function syncPull(){
  const {data,error}=await sb.from('kv').select('key,value');if(error)throw error;
  const srv={};data.forEach(r=>srv[r.key]=JSON.stringify(r.value));
  const loc=flat();let changed=false;
  for(const p in srv){
    if(loc[p]===srv[p]){snap[p]=srv[p];continue}
    if(p in snap&&p in loc&&loc[p]!==snap[p]&&canWrite(p))continue; // edited here while offline; will be pushed
    setPath(p,JSON.parse(srv[p]));snap[p]=srv[p];changed=true}
  for(const p in snap)if(!(p in srv)){
    if(p in loc&&loc[p]===snap[p]){delPath(p);changed=true}
    delete snap[p]}
  saveSnap();if(changed){localStorage.setItem(KEY,JSON.stringify(S));softRender()}}

function syncPush(){if(!syncOn)return;clearTimeout(pushT);pushT=setTimeout(doPush,700)}
async function doPush(){
  if(pushing){pushT=setTimeout(doPush,700);return}
  pushing=true;
  try{const loc=flat(),up=[],del=[];
    for(const p in loc)if(canWrite(p)&&snap[p]!==loc[p])up.push({key:p,value:JSON.parse(loc[p]),updated_at:new Date().toISOString()});
    for(const p in snap)if(!(p in loc)&&canWrite(p))del.push(p);
    for(let i=0;i<up.length;i+=100){const {error}=await sb.from('kv').upsert(up.slice(i,i+100));if(error)throw error}
    if(del.length){const {error}=await sb.from('kv').delete().in('key',del);if(error)throw error}
    up.forEach(r=>snap[r.key]=loc[r.key]);del.forEach(p=>delete snap[p]);saveSnap();setSyncState('ok')
  }catch(e){setSyncState('offline')}finally{pushing=false}}

function onRemote(pl){
  const old=pl.eventType==='DELETE',p=(old?pl.old:pl.new).key;if(!p)return;
  const loc=flat();
  if(old){if(p in loc&&loc[p]===snap[p]){delPath(p);delete snap[p];saveSnap();localStorage.setItem(KEY,JSON.stringify(S));softRender()}return}
  const js=JSON.stringify(pl.new.value);
  if(snap[p]===js)return;
  if(p in loc&&loc[p]!==snap[p]&&canWrite(p))return;
  if(loc[p]!==js){setPath(p,pl.new.value);localStorage.setItem(KEY,JSON.stringify(S));softRender()}
  snap[p]=js;saveSnap()}

function logout(){
  if(!sb){me=null;sessionStorage.removeItem('kae_me');render();return}
  if(!confirm('Sign out of K\u2019s Academy on this phone?'))return;
  sb.auth.signOut().then(()=>{me=null;sessionStorage.removeItem('kae_me');snap={};saveSnap();syncOn=false;location.reload()})}

function syncGate(msg){
  let g=document.getElementById('gate');if(!g){g=document.createElement('div');g.id='gate';g.className='modal';document.body.appendChild(g)}
  g.innerHTML=`<div><h2>🏫 K\u2019s Academy</h2><p class="sm mut">Sign in with your name and password.</p>
    <select id="gwho">${PEOPLE.map(p=>`<option value="${p.id}">${p.e} ${esc(p.name)}</option>`).join('')}</select>
    <input id="gpw" type="password" placeholder="Password" autocomplete="current-password" onkeydown="if(event.key==='Enter')syncLogin()">
    <p class="sm" style="color:#f87171">${esc(msg||'')}</p><button class="btn g" onclick="syncLogin()">Sign in</button></div>`}
async function syncLogin(){
  const {error}=await sb.auth.signInWithPassword({email:$('#gwho').value+'@'+KAE_CFG.domain,password:$('#gpw').value});
  if(error)return syncGate('Could not sign in: '+error.message);
  document.getElementById('gate').remove();const {data}=await sb.auth.getSession();syncStart(data.session)}

async function syncStart(session){
  const who=session?.user?.app_metadata?.person;
  if(!who||!person(who)){await sb.auth.signOut();return syncGate('This account is not set up.')}
  if(me!==who){me=who;sessionStorage.setItem('kae_me',who);tab=person(who).parent?'overview':'week'}
  setSyncState('');
  try{await syncPull();syncOn=true;setSyncState('ok');syncPush()}catch(e){syncOn=true;setSyncState('offline')}
  sb.channel('kv-live').on('postgres_changes',{event:'*',schema:'public',table:'kv'},onRemote).subscribe();
  setInterval(()=>{if(!document.hidden)syncPull().then(()=>{if(syncState!=='ok')setSyncState('ok');syncPush()}).catch(()=>setSyncState('offline'))},60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncPull().then(()=>{setSyncState('ok');syncPush()}).catch(()=>setSyncState('offline'))});
  addEventListener('online',()=>{syncPull().then(syncPush).catch(()=>{})});
  render()}

async function syncInit(){
  if(!KAE_CFG.url||!KAE_CFG.anonKey||typeof supabase==='undefined')return;
  sb=supabase.createClient(KAE_CFG.url,KAE_CFG.anonKey);
  const {data}=await sb.auth.getSession();
  if(data.session)syncStart(data.session);else{me=null;sessionStorage.removeItem('kae_me');render();syncGate()}
  sb.auth.onAuthStateChange((ev,s)=>{if(ev==='SIGNED_OUT'&&!s&&!document.getElementById('gate'))syncGate()})}
syncInit();
