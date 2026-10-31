(()=>{
'use strict';
const data=window.QUIZ_DATA;
const scoring=window.RelationshipScoring;
const {questions,domains,sources}=data;
const $=id=>document.getElementById(id);
const corners=['tl','tr','bl','br'],points=[[0,0],[1,0],[0,1],[1,1]];
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const storageKey='with-you-'+data.version;
let index=0,answers=Array(24).fill(null),completed=false,storageOK=true;
let submission=null;
let x=.5,y=.5,visualX=.5,visualY=.5,vx=0,vy=0,visualScale=1,scaleV=0;
let animation=0,lastFrame=0,dragging=false,activePointer=null,grabX=0,grabY=0;
const nodes=[];
function el(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;}
function snap(v){return scoring.snap(v,data.grid);}
function restore(){
 try{
  const state=JSON.parse(localStorage.getItem(storageKey)||'null');
  if(state?.version!==data.version||!Array.isArray(state.answers)||state.answers.length!==24)return;
  answers=state.answers.map(p=>scoring.validPoint(p)?{x:snap(p.x),y:snap(p.y)}:null);
  index=Number.isInteger(state.index)?Math.max(0,Math.min(23,state.index)):0;
  completed=state.completed===true;
  if(state.submission&&typeof state.submission==='object')submission=state.submission;
 }catch{storageOK=false;}
}
function persist(){try{localStorage.setItem(storageKey,JSON.stringify({version:data.version,index,answers,completed,submission}));storageOK=true;}catch{storageOK=false;}$('storage-warning').hidden=storageOK;}
function axisText(v,left,right){if(v===.5)return left+'与'+right+'兼顾';return (v===0||v===1?'更偏向':'稍偏向')+(v<.5?left:right);}
function selectedText(q,p){return axisText(p.x,q.axes[0],q.axes[1])+'；'+axisText(p.y,q.axes[2],q.axes[3]);}
function addSourceLinks(container,q){
 q.sources.forEach(key=>{const s=sources[key],a=el('a','',s.title);a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';container.append(a);});
}
function renderEvidence(){
 const box=$('question-sources');box.replaceChildren();
 box.append(el('p','','原创情境题。研究启发主题；参考区间与分值按站主自述推定，未经量表验证。'));
 addSourceLinks(box,questions[index]);
 $('question-evidence').open=false;
}
for(let row=0;row<=4;row++)for(let column=0;column<=4;column++){
 const n=el('span','grid-node');n.style.left=column*25+'%';n.style.top=row*25+'%';$('grid-nodes').append(n);nodes.push({node:n,x:column/4,y:row/4});
}
function draw(){
 const heart=$('choice-heart');heart.style.left=visualX*100+'%';heart.style.top=visualY*100+'%';
 const speed=Math.hypot(vx,vy),stretch=reduced.matches?0:Math.min(.12,speed*.018),tilt=reduced.matches?0:Math.max(-10,Math.min(10,vx*2.8));
 const scale=reduced.matches?1:visualScale;
 heart.style.transform='translate(-50%,-50%) rotate('+tilt+'deg) scale('+(scale+stretch)+','+(scale-stretch*.5)+')';
 corners.forEach((id,i)=>{const line=$('line-'+id);line.setAttribute('x2',visualX*100);line.setAttribute('y2',visualY*100);const near=1-Math.min(1,Math.hypot(visualX-points[i][0],visualY-points[i][1])/Math.SQRT2);line.style.opacity=.18+near*.52;$('star-'+id).style.transform='scale('+(1+near*.12)+')';});
}
function tick(time){
 const dt=Math.min((time-(lastFrame||time-16.667))/1000,.032);lastFrame=time;
 scaleV+=(((dragging?1.1:1)-visualScale)*230-scaleV*18)*dt;visualScale+=scaleV*dt;
 const stiffness=dragging?260:195,damping=dragging?26:20;
 vx+=((x-visualX)*stiffness-vx*damping)*dt;vy+=((y-visualY)*stiffness-vy*damping)*dt;
 visualX=Math.max(0,Math.min(1,visualX+vx*dt));visualY=Math.max(0,Math.min(1,visualY+vy*dt));
 if((visualX===0&&vx<0)||(visualX===1&&vx>0))vx*= -.18;
 if((visualY===0&&vy<0)||(visualY===1&&vy>0))vy*= -.18;
 draw();
 if(Math.hypot(x-visualX,y-visualY)>.0002||Math.hypot(vx,vy)>.002||Math.abs((dragging?1.1:1)-visualScale)>.0003||Math.abs(scaleV)>.002)animation=requestAnimationFrame(tick);
 else{visualX=x;visualY=y;vx=vy=0;visualScale=dragging?1.1:1;scaleV=0;animation=0;lastFrame=0;draw();}
}
function animate(immediate=false){
 if(immediate||reduced.matches){if(animation)cancelAnimationFrame(animation);animation=0;lastFrame=0;visualX=x;visualY=y;vx=vy=0;visualScale=dragging&&!reduced.matches?1.1:1;scaleV=0;draw();}
 else if(!animation){lastFrame=0;animation=requestAnimationFrame(tick);}
}
function paint(immediate=false){
 const q=questions[index],p={x:snap(x),y:snap(y)};
 animate(immediate);
 $('choice-heart').setAttribute('aria-label','爱心选择器：'+selectedText(q,p)+'。方向键移动一格。');
 nodes.forEach(n=>n.node.classList.toggle('selected',p.x===n.x&&p.y===n.y));
 corners.forEach((id,i)=>$('choice-'+id).classList.toggle('active',Math.hypot(p.x-points[i][0],p.y-points[i][1])<.5));
 $('selection-status').setAttribute('aria-live',dragging?'off':'polite');
 $('selection-status').textContent=answers[index]?(dragging?'松手吸附 · ':'已选定 · ')+selectedText(q,p):'中心表示兼顾；没有想法可以跳过。';
}
function render(){
 completed=false;dragging=false;activePointer=null;$('results-screen').hidden=true;$('quiz-screen').hidden=false;
 $('page-title').textContent='我们，会有怎样的缘分？';
 const q=questions[index];$('question-count').textContent=String(index+1).padStart(2,'0')+' / 24';
 $('question-domain').textContent=domains[q.domain].name;$('question-title').textContent=q.title;
 $('progress-fill').style.width=index/24*100+'%';document.querySelector('.progress-track').setAttribute('aria-valuenow',String(index));
 corners.forEach((id,i)=>{$('choice-'+id).textContent=q.options[i];$('choice-'+id).setAttribute('aria-label',q.options[i]+'，选择此角');});
 x=answers[index]?.x??.5;y=answers[index]?.y??.5;
 $('previous').disabled=index===0;$('next').textContent=index===23?'查看结果 →':'确认位置 →';
 renderEvidence();paint(true);$('storage-warning').hidden=storageOK;
}
function select(nx,ny,commit=false){
 x=Math.max(0,Math.min(1,nx));y=Math.max(0,Math.min(1,ny));
 if(commit){x=snap(x);y=snap(y);}
 answers[index]={x:snap(x),y:snap(y)};paint();
}
function fromPointer(e){const r=$('choice-board').getBoundingClientRect();select((e.clientX-r.left)/r.width-grabX,(e.clientY-r.top)/r.height-grabY);}
const board=$('choice-board');
board.addEventListener('pointerdown',e=>{
 if(e.button!==0||dragging)return;e.preventDefault();
 const r=board.getBoundingClientRect(),onHeart=$('choice-heart').contains(e.target);
 grabX=onHeart?(e.clientX-r.left)/r.width-visualX:0;grabY=onHeart?(e.clientY-r.top)/r.height-visualY:0;
 dragging=true;activePointer=e.pointerId;board.setPointerCapture(e.pointerId);$('choice-heart').focus({preventScroll:true});fromPointer(e);
});
board.addEventListener('pointermove',e=>{if(dragging&&e.pointerId===activePointer)fromPointer(e);});
function release(e,cancelled=false){
 if(!dragging||e.pointerId!==activePointer)return;
 if(!cancelled)fromPointer(e);
 dragging=false;activePointer=null;select(x,y,true);$('selection-status').setAttribute('aria-live','polite');persist();
}
board.addEventListener('pointerup',e=>release(e));board.addEventListener('pointercancel',e=>release(e,true));board.addEventListener('lostpointercapture',e=>release(e,true));
$('choice-heart').addEventListener('keydown',e=>{
 const d=e.shiftKey?.5:.25,m={ArrowLeft:[-d,0],ArrowRight:[d,0],ArrowUp:[0,-d],ArrowDown:[0,d]};
 if(m[e.key]){e.preventDefault();select(snap(x)+m[e.key][0],snap(y)+m[e.key][1],true);persist();}
});
corners.forEach((id,i)=>$('choice-'+id).addEventListener('click',()=>{select(...points[i],true);persist();}));
function scrollTop(){window.scrollTo({top:0,behavior:reduced.matches?'auto':'smooth'});}
function advance(){if(index<23){index++;render();persist();}else showResults();scrollTop();}
$('next').addEventListener('click',()=>{answers[index]={x:snap(x),y:snap(y)};advance();});
$('skip').addEventListener('click',()=>{answers[index]=null;advance();});
$('previous').addEventListener('click',()=>{if(index>0){index--;render();persist();scrollTop();}});
function addInsight(container,title,entries){
 if(!entries.length)return;
 const block=el('div','insight');block.append(el('h3','',title));
 entries.forEach(d=>{block.append(el('p','insight-topic',d.name+' · '+d.score+' 分'));const candidates=d.items.filter(t=>t.score!==null).sort((a,b)=>a.score-b.score);block.append(el('p','',candidates[0]?.question.conversation||d.talk));});
 container.append(block);
}
function addScoreTable(container,q,point){
 const table=el('table','score-grid');const cap=el('caption','','25 个位置的参考分（与答题方格方向一致）');table.append(cap);const body=el('tbody');
 for(let row=0;row<=4;row++){const tr=el('tr');for(let col=0;col<=4;col++){const value=scoring.pointScore(q,{x:col/4,y:row/4},4);const td=el('td','',String(value));td.setAttribute('aria-label','从上第'+(row+1)+'行，从左第'+(col+1)+'列，'+value+'分');if(point&&snap(point.x)===col/4&&snap(point.y)===row/4)td.classList.add('chosen');tr.append(td);}body.append(tr);}table.append(body);container.append(table);
}
function addAnswerDetails(container,result){
 const details=el('details','result-details');details.append(el('summary','','逐题得分与依据'));
 result.items.forEach(item=>{
  const q=item.question,d=el('details','answer-detail'),summary=el('summary');summary.append(document.createTextNode((item.index+1)+'. '+q.title+' '),el('strong','',item.score===null?'未作答':item.score+' 分'));d.append(summary);
  const content=el('div','answer-content');content.append(el('p','',item.point?selectedText(q,item.point):'这一题未作答，不计入分数。'));
  const excluded=[];if(!q.reference[0])excluded.push(q.axes[0]+'／'+q.axes[1]);if(!q.reference[1])excluded.push(q.axes[2]+'／'+q.axes[3]);
  if(excluded.length)content.append(el('p','','未设定评分偏好：'+excluded.join('；')+'。这一轴不加分也不扣分。'));
  content.append(el('p','','题目为原创；以下资料仅提供主题依据，分值为自述推定的自定义规则。'));addSourceLinks(content,q);content.append(el('p','',q.conversation));addScoreTable(content,q,item.point);d.append(content);details.append(d);
 });container.append(details);
}
function addMethod(container,result){
 const details=el('details','result-details');details.append(el('summary','','计分说明与研究来源'));
 details.append(el('p','','参考基准来自已提供的站主自述，尚未经站主逐题确认。分数衡量与这些推定偏好的接近程度，不代表恋爱成功概率，也不是标准化心理量表分数。'));
 details.append(el('p','','每题为 5 × 5 个吸附位置。越接近参考区间，分数越高；区间内部为 100 分，按到区间的距离逐渐递减。未明确的偏好轴不参与计分。'));
 details.append(el('p','','六个维度按陪伴亲密 24%、理解支持 22%、共同成长 18%、现实安全 16%、日常节奏 10%、人生方向 10% 加权；这些权重按自述重点人工设置，不来自研究的统计估计。'));
 details.append(el('p','','跳过不按零分计算。至少回答 18 题，且每个维度至少回答 2 题，才显示整体分；少量作答的维度仅供局部参考。当前基准覆盖 '+result.knownAxes+' / 48 条偏好轴。'));
 Object.values(sources).forEach(s=>{const p=el('p');const a=el('a','',s.title);a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';p.append(a,document.createTextNode(' · '+s.kind+'。'+s.scope));details.append(p);});container.append(details);
}
function exportAnswers(){
 const result=scoring.results(data,answers);
 const payload={version:data.version,referenceStatus:data.referenceStatus,overall:result.total,dimensions:result.dimensions.map(d=>({name:d.name,score:d.score,answered:d.answered})),answers:result.items.map(i=>({id:i.question.id,title:i.question.title,position:i.point,gridPosition:i.point?{column:Math.round(i.point.x*4),row:Math.round(i.point.y*4)}:null,score:i.score}))};
 const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'}));const a=el('a');a.href=url;a.download='我的多维同频结果.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function showResults(){
 completed=true;dragging=false;activePointer=null;if(animation){cancelAnimationFrame(animation);animation=0;lastFrame=0;}
 $('quiz-screen').hidden=true;$('results-screen').hidden=false;$('page-title').textContent='我们的同频图谱';$('question-count').textContent='已答 '+answers.filter(Boolean).length+' / 24';
 const result=scoring.results(data,answers),container=$('results-screen');container.replaceChildren();
 container.append(el('p','result-kicker','参考同频度'));
 const total=el('div','total-score',result.total===null?'—':String(result.total));total.append(el('small','',result.total===null?'待补充':'/ 100'));container.append(total);
 container.append(el('p','reference-note','按站主自述推定 · 尚未逐题确认 · 非恋爱成功率'));
 const eligible=result.dimensions.filter(d=>d.score!==null&&d.answered>=2).sort((a,b)=>b.score-a.score);
 if(result.total===null)container.append(el('p','result-summary','作答信息还不够，先展示已回答部分。至少回答 18 题，每个维度至少回答 2 题，才生成整体参考分。'));
 else if(eligible.length){const high=eligible[0],low=eligible[eligible.length-1];container.append(el('p','result-summary',high.score===low.score?'各维度接近程度相似。可以从下方具体情境里，看看哪些安排值得继续聊聊。':'你的选择在「'+high.name+'」更接近参考偏好。「'+low.name+'」仍有值得具体聊聊的安排。'));}
 result.dimensions.forEach(d=>{
  const block=el('div','dimension'),head=el('div','dimension-head');head.append(el('span','',d.name),el('span','dimension-score',d.score===null?'未作答':d.score+' / 100'));const track=el('div','dimension-track');track.setAttribute('role',d.score===null?'img':'meter');track.setAttribute('aria-label',d.name+(d.score===null?'，未作答':''));if(d.score!==null){track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');track.setAttribute('aria-valuenow',String(d.score));}const fill=el('div','dimension-fill');fill.style.width=(d.score??0)+'%';track.append(fill);block.append(head,track,el('p','dimension-caption',d.focus+' · 已答 '+d.answered+' / '+d.total+(d.answered<2?'，信息较少':'')));container.append(block);
 });
 addInsight(container,'可以从这里靠近',eligible.filter(d=>d.score>=75).slice(0,2));
 addInsight(container,'值得认真聊聊',eligible.filter(d=>d.score<75).slice(-2).reverse());
 const actions=el('div','result-actions');
 const back=el('button','button',result.total===null?'补充作答':'返回修改');back.type='button';back.addEventListener('click',()=>{completed=false;const first=answers.findIndex(a=>a===null);index=first>=0?first:23;render();persist();scrollTop();});
 const save=el('button','button','保存结果');save.type='button';save.addEventListener('click',exportAnswers);
 const restart=el('button','button','重新测试');restart.type='button';restart.addEventListener('click',()=>{completed=false;answers=Array(24).fill(null);submission=null;index=0;render();persist();scrollTop();});
 actions.append(back,save,restart);container.append(actions);appendSubmission(container,result);addAnswerDetails(container,result);addMethod(container,result);persist();
}
function appendSubmission(container,result){
 const section=el('section','submission-section');section.setAttribute('aria-label','提交答卷');
 const status=el('p','submit-status');status.setAttribute('role','status');
 if(!window.WithYouCloud?.configuration().enabled){status.textContent='暂未开放在线提交；本次结果仅保存在此浏览器。';section.append(status);container.append(section);return;}
 section.append(el('h3','','提交给站主'));
 const form=el('form','submission-form');
 const nameLabel=el('label','','昵称（选填，最多40字）');const nickname=el('input');nickname.type='text';nickname.name='nickname';nickname.maxLength=40;nickname.autocomplete='nickname';nickname.value=submission?.payload?.nickname||'';nameLabel.append(nickname);
 const consentLabel=el('label','consent-label');const consent=el('input');consent.type='checkbox';consent.required=true;consentLabel.append(consent,document.createTextNode('同意将本次答案、得分和昵称提交给站主，仅站主可查看。'));
 const send=el('button','button primary','提交答卷');send.type='submit';send.disabled=true;
 const signature=()=>JSON.stringify({version:data.version,answers,nickname:nickname.value.trim()});
 function update(){const already=submission?.signature===signature()&&!!submission?.receipt?.id;send.disabled=already||!consent.checked||result.answered===0;send.textContent=already?'已提交':'提交答卷';if(already)status.textContent='已提交给站主，无需重复提交。';else status.textContent=result.answered===0?'还没有作答内容，请先补充答案。':'';}
 consent.addEventListener('change',update);nickname.addEventListener('input',update);
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(!consent.checked||result.answered===0)return;
  const sig=signature();
  if(submission?.signature!==sig||!submission?.payload){submission={signature:sig,payload:{attempt_id:window.WithYouCloud.makeId(),version:data.version,nickname:nickname.value.trim(),answers:answers.map(p=>p?{x:p.x,y:p.y}:null),consent:true},receipt:null};persist();}
  if(submission.receipt){update();return;}
  const pending=submission;send.disabled=true;nickname.disabled=true;consent.disabled=true;status.textContent='正在提交…';
  try{pending.receipt=await window.WithYouCloud.submit(pending.payload);persist();status.textContent='已提交给站主，后台已保存本次答卷。';send.textContent='已提交';}
  catch(error){status.textContent=error.message||'提交未成功，请重试。';send.disabled=false;send.textContent='重试提交';}
  finally{nickname.disabled=false;consent.disabled=false;}
 });
 form.append(nameLabel,consentLabel,send);section.append(form,status);container.append(section);update();
}
restore();if(completed)showResults();else render();
})();
