-- Apply once to a dedicated Supabase Free project. No answer data belongs in GitHub.
begin;
create schema if not exists with_you_private;
revoke all on schema with_you_private from public, anon, authenticated;
create table if not exists with_you_private.questionnaires (
  version text primary key,
  rubric jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists with_you_private.admin_emails (
  email text primary key check (email = lower(email))
);
create table if not exists with_you_private.responses (
  id uuid primary key,
  created_at timestamptz not null default now(),
  version text not null references with_you_private.questionnaires(version),
  nickname text not null default '' check (char_length(nickname)<=40),
  answers jsonb not null,
  scores jsonb not null,
  consent_version text not null default 'submit-v1',
  consent_at timestamptz not null default now()
);
create index if not exists with_you_response_cursor on with_you_private.responses(created_at desc,id desc);
alter table with_you_private.questionnaires enable row level security;
alter table with_you_private.admin_emails enable row level security;
alter table with_you_private.responses enable row level security;
revoke all on all tables in schema with_you_private from public, anon, authenticated;

create or replace function with_you_private.evaluate_answers(p_version text,p_answers jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 r jsonb; q jsonb; a jsonb; bounds jsonb; ds jsonb; dims jsonb:='[]'; items jsonb:='[]';
 sums numeric[]:=array_fill(0::numeric,array[6]); counts integer[]:=array_fill(0,array[6]);
 i integer; j integer; d integer; answered integer:=0; dimension_score integer; question_score integer; overall integer:=null;
 value numeric; lower_bound numeric; upper_bound numeric; distance numeric; squared numeric; max_squared numeric;
 effective_weight numeric; numerator numeric:=0; denominator numeric:=0; enough boolean:=true;
begin
 select rubric into r from with_you_private.questionnaires where version=p_version;
 if r is null then raise exception 'unknown_questionnaire' using errcode='22023'; end if;
 if jsonb_typeof(p_answers) is distinct from 'array' or jsonb_array_length(p_answers)<>24 then
  raise exception 'invalid_answers' using errcode='22023';
 end if;
 for i in 0..23 loop
  q:=r->'questions'->i; a:=p_answers->i; d:=(q->>'domain')::integer+1; question_score:=null;
  if a <> 'null'::jsonb then
   if jsonb_typeof(a) is distinct from 'object' or jsonb_typeof(a->'x') is distinct from 'number' or jsonb_typeof(a->'y') is distinct from 'number' then
    raise exception 'invalid_position' using errcode='22023';
   end if;
   if (select count(*) from jsonb_object_keys(a))<>2 then raise exception 'invalid_position' using errcode='22023'; end if;
   if (a->>'x')::numeric not between 0 and 1 or (a->>'y')::numeric not between 0 and 1
      or mod((a->>'x')::numeric*4,1)<>0 or mod((a->>'y')::numeric*4,1)<>0 then
    raise exception 'position_not_on_grid' using errcode='22023';
   end if;
   squared:=0;max_squared:=0;
   for j in 0..1 loop
    bounds:=q->'reference'->j;
    if bounds <> 'null'::jsonb then
     value:=(a->>(case when j=0 then 'x' else 'y' end))::numeric*4;
     lower_bound:=(bounds->>0)::numeric;upper_bound:=(bounds->>1)::numeric;
     distance:=greatest(lower_bound-value,value-upper_bound,0);
     squared:=squared+distance*distance;
     max_squared:=max_squared+power(greatest(lower_bound,4-upper_bound),2);
    end if;
   end loop;
   if max_squared>0 then
    question_score:=round(greatest(0,least(1,1-sqrt(squared/max_squared)))*100)::integer;
    sums[d]:=sums[d]+question_score;counts[d]:=counts[d]+1;answered:=answered+1;
   end if;
  end if;
  items:=items||jsonb_build_array(jsonb_build_object('id',q->>'id','score',question_score));
 end loop;
 for d in 1..6 loop
  ds:=r->'domains'->(d-1);dimension_score:=null;
  if counts[d]>0 then
   dimension_score:=round(sums[d]/counts[d])::integer;
   effective_weight:=(ds->>'weight')::numeric*counts[d]/4;
   numerator:=numerator+dimension_score*effective_weight;denominator:=denominator+effective_weight;
  end if;
  if counts[d]<2 then enough:=false;end if;
  dims:=dims||jsonb_build_array(jsonb_build_object('id',ds->>'id','name',ds->>'name','score',dimension_score,'answered',counts[d],'total',4));
 end loop;
 if answered>=18 and enough and denominator>0 then overall:=round(numerator/denominator)::integer;end if;
 return jsonb_build_object('overall',overall,'answered',answered,'dimensions',dims,'items',items,'reference_status','self-report-inferred','score_source','server');
end;
$$;
revoke all on function with_you_private.evaluate_answers(text,jsonb) from public,anon,authenticated;

create or replace function public.with_you_submit(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare attempt uuid; quiz_version text; nick text; result jsonb; existing with_you_private.responses%rowtype;
begin
 if jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>16384 then
  raise exception 'invalid_submission' using errcode='22023';
 end if;
 if p_payload->'consent' is distinct from 'true'::jsonb then raise exception 'consent_required' using errcode='22023';end if;
 attempt:=(p_payload->>'attempt_id')::uuid;
 if attempt is null then raise exception 'missing_attempt_id' using errcode='22023';end if;
 quiz_version:=p_payload->>'version';nick:=btrim(coalesce(p_payload->>'nickname',''));
 if char_length(nick)>40 or nick ~ '[[:cntrl:]]' then raise exception 'invalid_nickname' using errcode='22023';end if;
 result:=with_you_private.evaluate_answers(quiz_version,p_payload->'answers');
 if (result->>'answered')::integer=0 then raise exception 'empty_submission' using errcode='22023';end if;
 perform pg_advisory_xact_lock(782164102::bigint);
 select * into existing from with_you_private.responses where id=attempt;
 if found then
  if existing.version<>quiz_version or existing.answers<>p_payload->'answers' or existing.nickname<>nick then
   raise exception 'submission_already_exists' using errcode='22023';
  end if;
  return jsonb_build_object('id',existing.id,'created_at',existing.created_at,'scores',existing.scores,'duplicate',true);
 end if;
 if (select count(*) from with_you_private.responses where created_at>now()-interval '10 minutes')>=200 then
  raise exception 'too_many_submissions' using errcode='P0001';
 end if;
 insert into with_you_private.responses(id,version,nickname,answers,scores) values(attempt,quiz_version,nick,p_payload->'answers',result);
 return jsonb_build_object('id',attempt,'created_at',now(),'scores',result,'duplicate',false);
end;
$$;
revoke all on function public.with_you_submit(jsonb) from public,anon,authenticated;
grant execute on function public.with_you_submit(jsonb) to anon,authenticated;

create or replace function public.with_you_admin_list(p_before timestamptz default null,p_before_id uuid default null,p_limit integer default 50)
returns jsonb language plpgsql security definer set search_path='' as $$
declare records jsonb; total_count bigint; last_record jsonb; page_size integer:=greatest(1,least(coalesce(p_limit,50),100));
begin
 if not exists(
  select 1 from auth.users u join with_you_private.admin_emails allowed on allowed.email=lower(u.email)
  where u.id=auth.uid() and u.email_confirmed_at is not null
 ) then raise exception 'admin_only' using errcode='42501';end if;
 if (p_before is null)<>(p_before_id is null) then raise exception 'invalid_cursor' using errcode='22023';end if;
 select count(*) into total_count from with_you_private.responses;
 select coalesce(jsonb_agg(to_jsonb(page) order by page.created_at desc,page.id desc),'[]'::jsonb) into records from (
  select id,created_at,version,nickname,answers,scores,consent_at,consent_version
  from with_you_private.responses
  where p_before is null or (created_at,id)<(p_before,p_before_id)
  order by created_at desc,id desc limit page_size
 ) page;
 last_record:=records->(jsonb_array_length(records)-1);
 return jsonb_build_object('records',records,'total',total_count,'next_cursor',
  case when jsonb_array_length(records)=page_size then jsonb_build_object('created_at',last_record->>'created_at','id',last_record->>'id') else null end);
end;
$$;
revoke all on function public.with_you_admin_list(timestamptz,uuid,integer) from public,anon,authenticated;
grant execute on function public.with_you_admin_list(timestamptz,uuid,integer) to authenticated;

-- RUBRIC_SEED
insert into with_you_private.questionnaires(version,rubric) values ('personal-grid-24-v3',$rubric${"domains":[{"id":"closeness","name":"陪伴亲密","weight":24},{"id":"support","name":"理解支持","weight":22},{"id":"growth","name":"共同成长","weight":18},{"id":"security","name":"现实安全","weight":16},{"id":"daily","name":"日常节奏","weight":10},{"id":"values","name":"人生方向","weight":10}],"questions":[{"id":"q01","domain":0,"reference":[[3,4],[1,3]],"title":"工作日晚间，你更期待怎样相处？","axes":["各自充电","一起活动","安静共处","认真交流"],"options":["各自放松，安静待在同一空间","一起做点事，安静享受陪伴","各自留些时间，再好好聊聊","一起做饭吃饭，分享这一天"]},{"id":"q02","domain":0,"reference":[[0,2],[0,2]],"title":"空出一个周末，你更想怎么过？","axes":["在家放松","出门活动","两个人相处","和朋友一起"],"options":["两个人宅家，做饭看电影","两个人出门，逛逛走走","叫朋友来家里，轻松聚一聚","约上朋友，一起出去玩"]},{"id":"q03","domain":0,"reference":[[1,3],[2,4]],"title":"你向往哪一种日常浪漫？","axes":["熟悉的日常","新鲜的小变化","温柔认真","打闹逗趣"],"options":["熟悉的关心，认真表达喜欢","偶尔换种方式，温柔制造惊喜","有专属玩笑，在日常互相逗趣","常玩点新花样，一起笑一起闹"]},{"id":"q04","domain":0,"reference":[[0,1],[0,1]],"title":"哪一种伴侣相处方式更打动你？","axes":["温柔安稳","彼此激励","倾听陪伴","并肩做事"],"options":["温柔听我说，让彼此安心","认真听我说，也鼓励我进步","细心照顾彼此，一起把事做好","并肩解决问题，一起变得更强"]},{"id":"q05","domain":1,"reference":[[0,2],[3,4]],"title":"遇到烦心事，你希望我怎样陪你？","axes":["情绪陪伴","实际协助","暂时转移注意","把事情聊开"],"options":["陪我做点轻松的事，先缓一缓","帮我处理眼前的事，暂不深聊","听我完整倾诉，理解我的感受","一起深入分析，找出可行办法"]},{"id":"q06","domain":1,"reference":[[0,2],[0,1]],"title":"两个人对一个选择意见不同时，你倾向？","axes":["先分析利弊","先聊感受","优先寻找兼顾","接受明确取舍"],"options":["分析各方利弊，再找兼顾办法","先了解彼此感受，再找兼顾办法","分析利弊后，接受有所取舍","聊清各自感受后，接受有所取舍"]},{"id":"q07","domain":1,"reference":[[0,2],null],"title":"我想尝试一个新点子，你更愿意怎样支持？","axes":["讨论与倾听","参与具体事情","主动加入","受邀再加入"],"options":["主动问问，听我聊聊思路","主动问问，有什么能一起做","我想聊时，认真听我说说","我需要时，帮忙做些具体的事"]},{"id":"q08","domain":1,"reference":[[1,3],[1,3]],"title":"一段努力暂时没出成绩，你更希望怎样被鼓励？","axes":["看与他人的差距","看自己的进步","肯定阶段成果","肯定投入过程"],"options":["看见已经做出的成绩，也对照同行","看见已经做出的成绩，也对照过去","认可一路的努力，也看看外界反馈","认可一路的努力，也看见自己的成长"]},{"id":"q09","domain":2,"reference":[[3,4],[0,2]],"title":"选择一份工作，你更看重什么？","axes":["稳定熟悉","挑战成长","能力与成果","收入与认可"],"options":["做熟悉的事，慢慢积累专业成果","解决新难题，持续积累专业成果","做熟悉的事，获得稳定回报","接受新挑战，争取更好的回报"]},{"id":"q10","domain":2,"reference":[[0,2],[0,2]],"title":"一个陌生领域引起兴趣，你更想怎样了解？","axes":["深入理解","轻量体验","提前安排学习","随兴趣边走边看"],"options":["安排时间，系统理解原理","安排一次体验，先看看是否喜欢","跟着好奇心，慢慢追问原理","跟着好奇心，先体验再决定"]},{"id":"q11","domain":2,"reference":[[0,1],[0,1]],"title":"如果有机会做自己的产品，你希望怎样投入？","axes":["先业余尝试","转为全职投入","先小规模试水","打磨后再推出"],"options":["保留工作，先做小尝试验证","全职投入，先做小尝试验证","保留工作，打磨完善再推出","全职投入，打磨完善再推出"]},{"id":"q12","domain":2,"reference":[[0,1],[0,2]],"title":"有件一直想尝试的事，你更倾向？","axes":["先亲自试过","先把握结果","主动创造机会","等合适时机"],"options":["主动安排一次，亲自试试看","主动准备条件，较有把握再试","时机合适就试，接受结果未定","等条件与时机都成熟，再投入"]},{"id":"q13","domain":3,"reference":[[0,1],[0,1]],"title":"认真追一个事业机会前，你更希望？","axes":["先留足储备","边做边积累","分阶段投入","集中投入"],"options":["先留好生活储备，再逐步尝试","边积累储备，边逐步尝试","先留好生活储备，再集中投入","集中投入，储备在过程中积累"]},{"id":"q14","domain":3,"reference":[null,[0,1]],"title":"必要开支留足后，一笔余钱你更想？","axes":["两个人共同安排","各自安排份额","留给未来","用于当下"],"options":["一起商量，把更多钱存下来","各自安排，自己的份额多存一点","一起商量，把更多钱改善生活","各自安排，自己的份额多享受一点"]},{"id":"q15","domain":3,"reference":[[1,3],[0,1]],"title":"两人的发展机会不在同一座城，你更倾向？","axes":["争取新的机会","维持现有发展","尽量保持同城","接受阶段异地"],"options":["争取新机会，也争取一起搬迁","优先现有发展，尽量继续同城","争取新机会，接受一段异地","优先现有发展，也能接受异地"]},{"id":"q16","domain":3,"reference":[[0,1],[0,2]],"title":"持续努力没有回报，你更希望怎样调整？","axes":["继续原方向","尝试新方向","保持行动","先休整再出发"],"options":["保持行动，在原方向里改进","保持行动，尽快试试新方向","先休整，再回原方向继续","先休整，再尝试新的方向"]},{"id":"q17","domain":4,"reference":[[0,1],null],"title":"事情没做完但已经很晚，你通常更愿意？","axes":["保证睡眠","优先收尾","固定起睡时间","灵活调整作息"],"options":["到点先睡，明天按时继续","今晚做完，仍按原时间起床","今晚先睡，明天灵活调整","今晚先收尾，之后灵活补休"]},{"id":"q18","domain":4,"reference":[[0,1],[0,2]],"title":"普通的一顿晚饭，你更偏爱？","axes":["清淡口味","浓郁口味","自己做饭","外食点餐"],"options":["在家做一顿清淡的饭","在家做一顿浓郁下饭的菜","找家口味清淡的店吃饭","找家味道浓郁的店吃饭"]},{"id":"q19","domain":4,"reference":[[0,2],[0,1]],"title":"你希望怎样把运动放进生活？","axes":["按周安排","随状态安排","适度持续","追求更高强度"],"options":["每周安排几次，适度保持","看当天状态，适度保持","每周安排训练，持续挑战强度","状态来了多练些，挑战更高强度"]},{"id":"q20","domain":4,"reference":[[0,1],[0,2]],"title":"朋友聚会时，你更喜欢怎样的氛围？","axes":["基本不饮酒","可以喝一点","安静小聚","热闹聚会"],"options":["三两好友安静聊，基本不饮酒","三两好友慢慢聊，可以喝一点","热热闹闹一起玩，基本不饮酒","热热闹闹一起玩，可以喝一点"]},{"id":"q21","domain":5,"reference":[[0,1],[2,4]],"title":"你心里最接近幸福的画面是？","axes":["亲密关系更重要","事业成就更重要","物质积累","共同经历"],"options":["身边有人相伴，也有安稳的家底","事业有所成，也有安稳的家底","有爱人与朋友，共同经历生活","事业有所成，也有丰富人生经历"]},{"id":"q22","domain":5,"reference":[[1,3],[1,3]],"title":"回望一段人生，你更看重哪一种满足？","axes":["内心认可","外界认可","做成的事情","走过的过程"],"options":["做成自己认定重要的事情","做成得到广泛认可的事情","经历自己真心喜欢的生活","一路收获他人的欣赏与肯定"]},{"id":"q23","domain":5,"reference":[[3,4],null],"title":"对于人生留下的东西，你更看重？","axes":["当下生活本身","为未来留下传承","作品与成果","经历与思想"],"options":["把眼前的事做好，成果随生活积累","主动留下作品，让它持续产生价值","认真经历当下，保留自己的感悟","主动整理故事，把思想传给后来人"]},{"id":"q24","domain":5,"reference":[[0,2],[0,2]],"title":"未来十年，你更愿意怎样安排人生？","axes":["先定长远方向","边经历边选择","更重自主选择","更重既定安稳"],"options":["先有长远方向，也保留调整自由","不急着定长远方向，保留选择自由","按清晰的长远路线，建立确定生活","边经历边选择，同时维持安稳生活"]}]}$rubric$::jsonb) on conflict(version) do nothing;
commit;
