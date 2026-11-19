'use strict';
// ---------- phone reminders (Web Push) ----------
const b64u=s=>{const p='='.repeat((4-s.length%4)%4),b=atob((s+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(b,c=>c.charCodeAt(0))};
const pushCapable=()=>'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window;
const at=(dk,h,m=0)=>{const[y,mo,d]=dk.split('-').map(Number);return new Date(y,mo-1,d,h,m)};
async function savePushSub(sub){await sb.from('push_subs').upsert({endpoint:sub.endpoint,person:me,sub:sub.toJSON()})}

function remindersFor(person){
  const rows=[],now=Date.now(),R=(id,when,title,body,task)=>{if(when.getTime()>now)rows.push({id,person,task_id:task||null,fire_at:when.toISOString(),title,body})};
  const today=dkey();
  for(let i=0;i<3;i++){const dk=addDays(today,i),dow=new Date(dk+'T12:00').getDay(),wk=dow>0&&dow<6;
    if(person==='jeanne'){
      R(`nce:${dk}`,at(dk,19),'🎓 Daily NCE/NCMHCE prep','Ten questions keeps the streak alive.');
      if(dow===5)R(`inv:${dk}`,at(dk,16),'🧾 Friday','Log this week\u2019s hours and send the invoices.');
    }else if(wk)R(`am:${dk}`,at(dk,9),'🏫 K\u2019s Academy','Open This Week and pick your first task.');
  }
  if(person!=='jeanne'){
    asgFor(person).forEach(a=>{
      if(subOf(person,a.id))return;
      const t=a.quiz?quizName(a):a.title;
      R(`due0:${a.id}:${person}`,at(a.due,7),'📌 Due today',t,a.id);
      R(`due1:${a.id}:${person}`,at(addDays(a.due,-1),18),'⏳ Due tomorrow',t,a.id)})}
  const keep=calFilter;calFilter='all';
  try{calExpand(today,addDays(today,2)).filter(e=>!e.auto&&e.start&&(e.who==='all'||e.who===person)).forEach(e=>{
    const[h,m]=e.start.split(':').map(Number);R(`ev:${e.id}:${e.on}:${person}`,at(e.on,h,m-30),'🗓️ In 30 min: '+fmtT(e.start),e.title)})}
  finally{calFilter=keep}
  return rows}

async function syncReminders(){
  if(!sb||!syncOn||!me)return;
  const rows=remindersFor(me);
  try{
    for(let i=0;i<rows.length;i+=150){const {error}=await sb.from('reminders').upsert(rows.slice(i,i+150));if(error)throw error}
    const keep=new Set(rows.map(r=>r.id)),{data}=await sb.from('reminders').select('id').eq('sent',false).gt('fire_at',new Date().toISOString()).limit(2000);
    const stale=(data||[]).map(r=>r.id).filter(id=>!keep.has(id));
    for(let i=0;i<stale.length;i+=100)await sb.from('reminders').delete().in('id',stale.slice(i,i+100))
  }catch(e){}}

const pushOn=()=>localStorage.getItem('kae_push')===me&&pushCapable()&&Notification.permission==='granted';
async function enablePush(){
  if(!pushCapable())return alert('On iPhone: open this link in Safari, tap Share, then Add to Home Screen. Open K\u2019s Academy from your Home Screen and tap 🔔 again.');
  try{
    if(await Notification.requestPermission()!=='granted')return toast('Notifications are blocked in Settings');
    const reg=await navigator.serviceWorker.ready;
    const sub=await reg.pushManager.getSubscription()||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(KAE_CFG.vapidPublic)});
    await savePushSub(sub);localStorage.setItem('kae_push',me);syncReminders();closeModal();toast('Phone alerts are on 🔔')
  }catch(e){alert('Could not turn on alerts: '+e.message)}}
async function testPush(){
  const {error}=await sb.from('reminders').upsert({id:'test:'+me+':'+Date.now(),person:me,fire_at:new Date().toISOString(),title:'🔔 K\u2019s Academy test',body:'Phone alerts work!'});
  toast(error?'Could not queue test':'Test alert sent. It arrives within a minute.');closeModal()}
function pushPrompt(){
  if(!sb)return toast('Sign in first');
  modal(`<h3>🔔 Phone alerts</h3><p class="sm">Get reminders on your phone, even when the app is closed: assignments due, calendar events${me==='jeanne'?', daily NCE/NCMHCE prep and Friday invoices':', and a morning nudge'}.</p>
  ${pushOn()?'<button class="btn g" onclick="testPush()">Send me a test alert</button><p class="sm mut">Alerts are on for this phone.</p>':'<button class="btn g" onclick="enablePush()">Turn on alerts</button>'}
  ${pushCapable()?'':'<p class="sm mut">iPhone: Safari → Share → Add to Home Screen. Then open the app from the Home Screen to enable alerts.</p>'}
  <button class="btn s" onclick="closeModal()">Close</button>`)}
