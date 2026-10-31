(function(global){
'use strict';
const clamp=(v,lo=0,hi=1)=>Math.min(hi,Math.max(lo,v));
function snap(v,grid=4){return Math.round(clamp(v)*grid)/grid;}
function validPoint(p){return p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1;}
function intervalDistance(v,range){return v<range[0]?range[0]-v:v>range[1]?v-range[1]:0;}
function pointScore(question,point,grid=4){
 if(!validPoint(point))return null;
 let squared=0,maxSquared=0,axes=0;
 question.reference.forEach((range,i)=>{
  if(!range)return;
  const value=snap(i===0?point.x:point.y,grid)*grid;
  squared+=intervalDistance(value,range)**2;
  maxSquared+=Math.max(range[0],grid-range[1])**2;axes++;
 });
 return axes&&maxSquared>0?Math.round(clamp(1-Math.sqrt(squared/maxSquared))*100):null;
}
function results(data,answers){
 const items=data.questions.map((q,i)=>({index:i,question:q,point:validPoint(answers[i])?answers[i]:null,score:pointScore(q,answers[i],data.grid)}));
 const dimensions=data.domains.map((domain,d)=>{
  const subset=items.filter(t=>t.question.domain===d),scored=subset.filter(t=>t.score!==null);
  return {...domain,index:d,answered:scored.length,total:subset.length,score:scored.length?Math.round(scored.reduce((a,t)=>a+t.score,0)/scored.length):null,items:subset};
 });
 const answered=items.filter(t=>t.score!==null).length;
 // Equal question weights within a dimension; skipped questions are omitted.
 // Partial dimension coverage reduces its contribution rather than filling skipped items with zero.
 const denominator=dimensions.reduce((n,d)=>n+(d.score===null?0:d.weight*d.answered/d.total),0);
 const weighted=dimensions.reduce((n,d)=>n+(d.score===null?0:d.score*d.weight*d.answered/d.total),0);
 const completeEnough=answered>=18&&dimensions.every(d=>d.answered>=2);
 const total=completeEnough&&denominator?Math.round(weighted/denominator):null;
 return {items,dimensions,answered,total,completeEnough,referenceStatus:data.referenceStatus,knownAxes:data.questions.reduce((n,q)=>n+q.reference.filter(Boolean).length,0)};
}
const api={snap,validPoint,pointScore,results};
if(typeof module==='object'&&module.exports)module.exports=api;else global.RelationshipScoring=api;
})(typeof window!=='undefined'?window:globalThis);
