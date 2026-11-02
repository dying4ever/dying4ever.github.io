(async()=>{
'use strict';
const $=id=>document.getElementById(id),config=window.WITH_YOU_CONFIG||{},data=window.QUIZ_DATA;
let client=null,records=[],cursor=null,total=0,loading=false,initializing=true,sending=false,cooldownUntil=0;
const storageKey='with-you-admin-session',verifierKey=storageKey+'-code-verifier',cooldownKey=storageKey+'-send-after';
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function status(message){$('admin-status').textContent=message;}
if(!config.enabled||!config.supabaseUrl||!config.publishableKey){status('数据库尚未启用，当前无法登录或查看答卷。');$('login-panel').hidden=true;return;}
if(!window.supabase?.createClient){status('登录组件未加载，请检查网络后刷新。');$('login-button').disabled=true;return;}
// Exchange callback codes explicitly so initialization failures reach the page.
client=window.supabase.createClient(config.supabaseUrl,config.publishableKey,{auth:{storageKey,flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
function readStored(key){try{return localStorage.getItem(key);}catch{return null;}}
function writeStored(key,value){try{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}catch{}}
function authError(error){
 const code=error?.code||'',http=Number(error?.status)||0;
 if(code==='over_email_send_rate_limit')return '登录邮件发送额度暂时用尽，请稍后再试。答卷仍正常保存；反复点击不会提前恢复。';
 if(code==='over_request_rate_limit'||http===429)return '登录请求过于频繁，请稍后再试，暂时不要重复发送。';
 if(code==='email_address_not_authorized')return '当前免费邮件服务只允许向项目成员发信，请使用站主邮箱。';
 if(code==='otp_expired'||code==='flow_state_expired'||code==='flow_state_not_found')return '这个登录链接已过期或已使用。请回到后台重新发送，并打开最新一封邮件。';
 if(['bad_code_verifier','pkce_verifier_not_found','missing_verifier'].includes(code)||/verifier|PKCE/i.test(error?.message||''))return '这封邮件与当前浏览器的登录请求不匹配。请在本页面重新发送一次，并在同一个浏览器窗口打开最新链接。';
 if(code==='user_not_found'||code==='signup_disabled')return '这个邮箱尚未开通后台登录，请使用站主邮箱。';
 if(error?.name==='AuthRetryableFetchError'||error instanceof TypeError)return '无法连接登录服务，请检查网络后重试。';
 return '登录暂未成功，请稍后重试'+(code?'（'+code+'）':http?'（'+http+'）':'')+'。';
}
function updateSendButton(){const seconds=Math.max(0,Math.ceil((cooldownUntil-Date.now())/1000));$('login-button').disabled=initializing||sending||seconds>0;$('login-button').textContent=initializing?'正在检查登录…':sending?'正在发送…':seconds>0?seconds+' 秒后可重发':'发送登录链接';}
cooldownUntil=Number(readStored(cooldownKey))||0;
function startCooldown(){cooldownUntil=Date.now()+60000;writeStored(cooldownKey,String(cooldownUntil));}
setInterval(()=>{cooldownUntil=Number(readStored(cooldownKey))||cooldownUntil;updateSendButton();},1000);
async function withLoginLock(task){return navigator.locks?.request?navigator.locks.request('with-you-admin-login',task):task();}
function clearCallback(){const url=new URL(location.href);url.searchParams.delete('code');url.searchParams.delete('error');url.searchParams.delete('error_code');url.searchParams.delete('error_description');url.hash='';history.replaceState(null,'',url.pathname+url.search);}
function humanTime(value){const d=new Date(value);return Number.isNaN(d.getTime())?'时间未知':d.toLocaleString('zh-CN',{hour12:false});}
function preference(q,p){if(!p)return '未作答';const f=(v,a,b)=>v===.5?a+'与'+b+'兼顾':(v<.5?'偏向'+a:'偏向'+b);return f(p.x,q.axes[0],q.axes[1])+'；'+f(p.y,q.axes[2],q.axes[3]);}
function render(){
 const target=$('records');target.replaceChildren();$('record-count').textContent='共 '+total+' 份 · 已加载 '+records.length+' 份';
 if(!records.length)target.append(el('p','admin-note','还没有收到答卷。'));
 records.forEach(r=>{
  const card=el('article','record');card.append(el('h2','',(r.nickname||'匿名答卷')+' · '+(r.scores.overall===null?'信息不足，未生成总分':r.scores.overall+' 分')));
  card.append(el('p','record-meta',humanTime(r.created_at)+' · 已答 '+r.scores.answered+' / 24 · '+r.version),el('p','record-meta','记录编号：'+r.id));
  const dims=el('div','record-dimensions');r.scores.dimensions.forEach(d=>{const cell=el('div','',d.name);cell.append(el('strong','',d.score===null?'未作答':String(d.score)));dims.append(cell);});card.append(dims);
  const detail=el('details');detail.append(el('summary','','查看逐题记录'));const ol=el('ol');
  r.answers.forEach((p,i)=>{const q=r.version===data.version?data.questions[i]:null;const li=el('li','',q?.title||'第 '+(i+1)+' 题');li.append(el('span','',q?preference(q,p):JSON.stringify(p)),el('span','',(r.scores.items[i]?.score===null?'不计分':r.scores.items[i]?.score+' 分')+(p?' · 网格位置（从左、从上）：'+(p.x*4+1)+'，'+(p.y*4+1):'')));ol.append(li);});detail.append(ol);card.append(detail);target.append(card);
 });$('load-more').hidden=!cursor;$('export-csv').disabled=records.length===0;
}
async function load(reset=false){
 if(loading)return;loading=true;status('正在读取答卷…');$('refresh').disabled=true;$('load-more').disabled=true;
 try{
  const {data:page,error}=await client.rpc('with_you_admin_list',{p_before:reset?null:cursor?.created_at||null,p_before_id:reset?null:cursor?.id||null,p_limit:50});
  if(error)throw error;
  if(!page||!Array.isArray(page.records))throw new Error('invalid_response');
  const existing=new Set(reset?[]:records.map(r=>r.id));const fresh=page.records.filter(r=>!existing.has(r.id));records=reset?fresh:records.concat(fresh);cursor=page.next_cursor;total=Number(page.total)||0;
  $('login-panel').hidden=true;$('records-panel').hidden=false;render();status('仅已授权的站主账号可以查看这些记录。');
 }catch(error){status(error.code==='42501'||error.message?.includes('admin_only')?'这个邮箱没有答卷查看权限。请退出后使用站主邮箱登录。':'读取失败，请检查数据库配置或稍后重试。');$('login-panel').hidden=true;$('records-panel').hidden=false;}
 finally{loading=false;$('refresh').disabled=false;$('load-more').disabled=false;}
}
$('login-form').addEventListener('submit',async e=>{
 e.preventDefault();if(initializing||sending||Date.now()<cooldownUntil)return;sending=true;updateSendButton();status('正在发送登录链接…');
 try{await withLoginLock(async()=>{
  cooldownUntil=Number(readStored(cooldownKey))||0;if(Date.now()<cooldownUntil){status('请等待上一封邮件，暂时无需重复发送。');return;}
  // The SDK replaces its verifier before sending. A rejected resend must not break an already-sent link.
  const previousVerifier=readStored(verifierKey);let sent=false;
  try{const {error}=await client.auth.signInWithOtp({email:$('admin-email').value.trim(),options:{emailRedirectTo:new URL('admin.html',location.href).href,shouldCreateUser:false}});if(error)throw error;sent=true;startCooldown();status('登录链接已发送。请在当前浏览器窗口中打开最新邮件里的链接。');}
  finally{if(!sent)writeStored(verifierKey,previousVerifier);}
 });}
 catch(error){if(error?.status===429)startCooldown();status(authError(error));}
 finally{sending=false;updateSendButton();}
});
// Never await another Supabase call while holding its auth-event callback lock.
client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_IN'&&session&&!initializing)setTimeout(()=>load(true),0);if(event==='SIGNED_OUT'){records=[];cursor=null;total=0;$('records').replaceChildren();$('records-panel').hidden=true;$('login-panel').hidden=false;}});
$('refresh').addEventListener('click',()=>load(true));$('load-more').addEventListener('click',()=>load(false));
$('logout').addEventListener('click',async()=>{await client.auth.signOut();records=[];cursor=null;total=0;$('records').replaceChildren();$('records-panel').hidden=true;$('login-panel').hidden=false;status('已退出登录。');});
function csvCell(v){let s=String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
$('export-csv').addEventListener('click',()=>{
 const columns=['记录编号','提交时间','昵称','整体分',...data.domains.map(d=>d.name),...data.questions.map((q,i)=>(i+1)+'. '+q.title)];
 const rows=records.map(r=>[r.id,r.created_at,r.nickname,r.scores.overall,...r.scores.dimensions.map(d=>d.score),...r.answers.map((p,i)=>r.version===data.version?preference(data.questions[i],p):(p?JSON.stringify(p):'未作答'))]);
 const content='\ufeff'+[columns,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));const a=el('a');a.href=url;a.download='答题记录.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
});
try{
 const callback=new URL(location.href),code=callback.searchParams.get('code'),fragment=new URLSearchParams(callback.hash.slice(1));
 const {data:sessionData,error:sessionError}=await client.auth.getSession();if(sessionError)throw sessionError;
 if(sessionData.session){if(code||callback.hash)clearCallback();await load(true);}
 else if(code){
  status('邮件已验证，正在建立后台登录…');
  await withLoginLock(async()=>{
   // A second callback tab may have finished while this one waited for the lock.
   const {data:current,error:currentError}=await client.auth.getSession();if(currentError)throw currentError;
   if(!current.session){if(!readStored(verifierKey))throw {code:'missing_verifier'};const {data:exchanged,error}=await client.auth.exchangeCodeForSession(code);if(error)throw error;if(!exchanged?.session)throw {code:'session_not_created'};}
  });clearCallback();await load(true);
 }
 else if(callback.searchParams.has('error')||fragment.has('error'))throw {code:callback.searchParams.get('error_code')||fragment.get('error_code')||'otp_expired'};
 else status('请用站主邮箱验证身份。');
}catch(error){clearCallback();status(authError(error));}
finally{initializing=false;updateSendButton();}
})();
