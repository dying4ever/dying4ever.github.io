(function(global){
'use strict';
function configuration(){const c=global.WITH_YOU_CONFIG||{};return {enabled:c.enabled===true&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(c.supabaseUrl||'')&&typeof c.publishableKey==='string'&&c.publishableKey.length>20,url:(c.supabaseUrl||'').replace(/\/$/,''),key:c.publishableKey||''};}
function makeId(){if(global.crypto?.randomUUID)return global.crypto.randomUUID();if(!global.crypto?.getRandomValues)throw new Error('当前浏览器不能安全生成提交编号，请换一个浏览器。');const a=new Uint8Array(16);global.crypto.getRandomValues(a);a[6]=(a[6]&15)|64;a[8]=(a[8]&63)|128;const s=Array.from(a,x=>x.toString(16).padStart(2,'0')).join('');return `${s.slice(0,8)}-${s.slice(8,12)}-${s.slice(12,16)}-${s.slice(16,20)}-${s.slice(20)}`;}
async function submit(payload){
 const c=configuration();if(!c.enabled)throw new Error('站主尚未开启在线提交；结果仍保存在此浏览器。');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{
  const headers={'apikey':c.key,'Content-Type':'application/json'};
  if(c.key.startsWith('eyJ'))headers.Authorization='Bearer '+c.key;
  const response=await fetch(c.url+'/rest/v1/rpc/with_you_submit',{method:'POST',headers,body:JSON.stringify({p_payload:payload}),signal:controller.signal,credentials:'omit'});
  const body=await response.json().catch(()=>null);
  if(!response.ok){const message=body?.message||'';if(message.includes('too_many_submissions'))throw new Error('暂时提交较多，请稍后重试。');if(message.includes('unknown_questionnaire'))throw new Error('题库已更新，请刷新后再提交。');throw new Error('提交暂未成功，请稍后重试；本地答案不会丢失。');}
  if(!body?.id||!body?.scores)throw new Error('提交结果未确认，请稍后重试。');
  return body;
 }catch(error){if(error.name==='AbortError')throw new Error('提交超时，请重试。重复重试不会新增同一条记录。');if(error instanceof TypeError)throw new Error('暂时无法连接，请检查网络后重试；本地答案不会丢失。');throw error;}
 finally{clearTimeout(timer);}
}
global.WithYouCloud={configuration,makeId,submit};
})(window);
