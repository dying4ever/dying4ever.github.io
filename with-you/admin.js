(async()=>{
'use strict';
const $=id=>document.getElementById(id),config=window.WITH_YOU_CONFIG||{},data=window.QUIZ_DATA;
let client=null,records=[],cursor=null,total=0,loading=false;
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function status(message){$('admin-status').textContent=message;}
if(!config.enabled||!config.supabaseUrl||!config.publishableKey){status('数据库尚未启用，当前无法登录或查看答卷。');$('login-panel').hidden=true;return;}
if(!window.supabase?.createClient){status('登录组件未加载，请检查网络后刷新。');$('login-button').disabled=true;return;}
client=window.supabase.createClient(config.supabaseUrl,config.publishableKey,{auth:{storageKey:'with-you-admin-session',flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
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
 e.preventDefault();$('login-button').disabled=true;status('正在发送登录链接…');
 try{const {error}=await client.auth.signInWithOtp({email:$('admin-email').value.trim(),options:{emailRedirectTo:new URL('admin.html',location.href).href,shouldCreateUser:true}});if(error)throw error;status('登录链接已发送，请在同一浏览器打开邮件中的链接。');}
 catch{status('发送失败，请确认邮箱与站主账号一致，稍后重试。');}
 finally{$('login-button').disabled=false;}
});
$('refresh').addEventListener('click',()=>load(true));$('load-more').addEventListener('click',()=>load(false));
$('logout').addEventListener('click',async()=>{await client.auth.signOut();records=[];cursor=null;total=0;$('records').replaceChildren();$('records-panel').hidden=true;$('login-panel').hidden=false;status('已退出登录。');});
function csvCell(v){let s=String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
$('export-csv').addEventListener('click',()=>{
 const columns=['记录编号','提交时间','昵称','整体分',...data.domains.map(d=>d.name),...data.questions.map((q,i)=>(i+1)+'. '+q.title)];
 const rows=records.map(r=>[r.id,r.created_at,r.nickname,r.scores.overall,...r.scores.dimensions.map(d=>d.score),...r.answers.map((p,i)=>r.version===data.version?preference(data.questions[i],p):(p?JSON.stringify(p):'未作答'))]);
 const content='\ufeff'+[columns,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));const a=el('a');a.href=url;a.download='答题记录.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
});
const {data:sessionData,error:sessionError}=await client.auth.getSession();
if(sessionError){status('登录验证未完成，请重新发送登录链接。');return;}
if(sessionData.session)await load(true);else status('请用站主邮箱验证身份。');
})();
