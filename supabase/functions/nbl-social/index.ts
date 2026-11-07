import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";
import { unsafeSocialMediaReason, urgentSafetyAllegation, safeSafetyQueueItem } from "./nbl-ugc-safety.mjs";

const BASE=(Deno.env.get("SUPABASE_URL")||"").replace(/\/+$/,"");
const SERVICE=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const db=createClient(BASE,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}});
const ISSUER="https://clerk.newbeansland.org";
const jwks=createRemoteJWKSet(new URL(ISSUER+"/.well-known/jwks.json"));
const ALLOWED=new Set([
  "https://newbeansland.org","https://www.newbeansland.org",
  "https://foundernbl.github.io","https://nblworld.com","https://www.nblworld.com"
]);
const ACTIVE_ENROLLMENTS=new Set(["paid","materials_ready","books_ordered","books_shipped","active","coursework_complete","final_eligible","completed"]);

function clean(v:unknown,max=8000){return typeof v==="string"?v.replace(/\s+/g," ").trim().slice(0,max):"";}
function origin(req:Request){return (req.headers.get("origin")||"").replace(/\/$/,"");}
function headers(req:Request){
  const o=origin(req);
  const h:Record<string,string>={
    "content-type":"application/json; charset=utf-8","cache-control":"no-store","vary":"origin",
    "access-control-allow-methods":"POST, OPTIONS",
    "access-control-allow-headers":"authorization, content-type, apikey, x-client-info"
  };
  if(o&&ALLOWED.has(o))h["access-control-allow-origin"]=o;
  return h;
}
function json(req:Request,body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:headers(req)});}
function bearer(req:Request){const h=req.headers.get("authorization")||"";return h.toLowerCase().startsWith("bearer ")?h.slice(7).trim():"";}
function uuid(v:unknown){const s=clean(v,80);return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)?s:"";}
function handleInput(v:unknown){return clean(v,80).replace(/^@/,"").replace(/[^A-Za-z0-9_-]/g,"").toLowerCase();}
const FOUNDER_PUBLIC_HANDLE="NBLFounderOfficial";
const FOUNDER_ALIASES=new Set(["nblfounderofficial","foundernbl","nblfounder"]);
function isFounderAlias(v:unknown){return FOUNDER_ALIASES.has(handleInput(v));}
function course(v:unknown){return clean(v,40).toUpperCase().replace(/[^A-Z0-9 &/.-]/g,"").slice(0,40);}
function directKey(a:string,b:string){return [a,b].sort().join(":");}

async function actor(req:Request){
  const token=bearer(req);
  if(!token)return null;
  try{
    const {payload}=await jwtVerify(token,jwks,{issuer:ISSUER});
    const userId=typeof payload.sub==="string"?payload.sub:"";
    if(!userId)return null;
    await db.from("nbl_account_profiles").upsert(
      {clerk_user_id:userId,updated_at:new Date().toISOString()},
      {onConflict:"clerk_user_id",ignoreDuplicates:true}
    );
    const [profile,usage]=await Promise.all([
      db.from("nbl_account_profiles").select("username").eq("clerk_user_id",userId).maybeSingle(),
      db.from("nbl_chat_usage_accounts").select("role").eq("clerk_user_id",userId).maybeSingle()
    ]);
    return {userId,token,username:clean(profile.data?.username,30)||null,role:String(usage.data?.role||"ordinary")};
  }catch{return null;}
}

async function universityAccess(userId:string){
  const [guided,enrollment]=await Promise.all([
    db.from("university_guided_access").select("status,role,sequence").eq("clerk_user_id",userId).maybeSingle(),
    db.from("university_enrollments").select("id,status,program_id").eq("clerk_user_id",userId).order("updated_at",{ascending:false}).limit(1).maybeSingle()
  ]);
  if(guided.data?.status==="approved")return {allowed:true,role:String(guided.data.role||"student"),sequence:String(guided.data.sequence||"foundation")};
  const status=String(enrollment.data?.status||"");
  return {allowed:Boolean(enrollment.data?.id)&&ACTIVE_ENROLLMENTS.has(status),role:"student",sequence:String(enrollment.data?.program_id||"foundation")};
}
async function assessmentLocked(userId:string){
  const r=await db.from("university_learner_state").select("assessment_status").eq("clerk_user_id",userId).maybeSingle();
  return String(r.data?.assessment_status||"")==="in_progress";
}
async function roleMap(ids:string[]){
  if(!ids.length)return new Map<string,string>();
  const r=await db.from("nbl_chat_usage_accounts").select("clerk_user_id,role").in("clerk_user_id",ids);
  return new Map((r.data||[]).map((x:any)=>[String(x.clerk_user_id),String(x.role||"ordinary")]));
}
async function universitySet(ids:string[]){
  if(!ids.length)return new Set<string>();
  const set=new Set<string>();
  const [g,e]=await Promise.all([
    db.from("university_guided_access").select("clerk_user_id,status").in("clerk_user_id",ids).eq("status","approved"),
    db.from("university_enrollments").select("clerk_user_id,status").in("clerk_user_id",ids)
  ]);
  for(const x of g.data||[])set.add(String((x as any).clerk_user_id));
  for(const x of e.data||[])if(ACTIVE_ENROLLMENTS.has(String((x as any).status||"")))set.add(String((x as any).clerk_user_id));
  return set;
}
function publicHandle(username:string|null,role:string,_isUniversity:boolean){
  if(role==="founder")return FOUNDER_PUBLIC_HANDLE;
  const base=(username||"").replace(/^@/,"");
  // One public identity on Beans, NBL Messenger and NBL University.
  // A student number is separate; enrollment must never rename the user's handle.
  if(!base||isFounderAlias(base)||isFounderAlias(base.replace(/nblu$/i,"")))return null;
  return base;
}
async function userCard(userId:string){
  if(userId==="nbl:grey")return {userId:null,handle:"greyhart",displayName:"Professor Grey",verified:true,officialRole:"grey"};
  const [p,r,u]=await Promise.all([
    db.from("nbl_account_profiles").select("username").eq("clerk_user_id",userId).maybeSingle(),
    db.from("nbl_chat_usage_accounts").select("role").eq("clerk_user_id",userId).maybeSingle(),
    universityAccess(userId)
  ]);
  const role=String(r.data?.role||"ordinary");
  return {userId,handle:publicHandle(clean(p.data?.username,30)||null,role,u.allowed),displayName:null,verified:role==="founder",officialRole:role==="founder"?"founder":null};
}
async function resolveHandle(raw:unknown){
  const wanted=handleInput(raw);
  if(!wanted)return null;
  if(isFounderAlias(wanted)){
    const r=await db.from("nbl_chat_usage_accounts").select("clerk_user_id").eq("role","founder").limit(1).maybeSingle();
    return r.data?.clerk_user_id?String(r.data.clerk_user_id):null;
  }
  let p=await db.from("nbl_account_profiles").select("clerk_user_id,username").ilike("username",wanted).limit(1).maybeSingle();
  if(!p.data&&wanted.endsWith("nblu")&&wanted.length>4){
    p=await db.from("nbl_account_profiles").select("clerk_user_id,username").ilike("username",wanted.slice(0,-4)).limit(1).maybeSingle();
    if(p.data){
      const u=await universityAccess(String(p.data.clerk_user_id));
      if(!u.allowed)return null;
    }
  }
  return p.data?.clerk_user_id?String(p.data.clerk_user_id):null;
}

/* Pulse friendships are private, server-managed, and never authorize DMs. */
const PULSE_FRIENDS="nbl_pulse_friend_requests";
async function pulseBlocked(a:string,b:string){
  const [ab,ba]=await Promise.all([
    db.from("nbl_social_blocks").select("blocker_user_id").eq("blocker_user_id",a).eq("blocked_user_id",b).maybeSingle(),
    db.from("nbl_social_blocks").select("blocker_user_id").eq("blocker_user_id",b).eq("blocked_user_id",a).maybeSingle()
  ]);
  if(ab.error||ba.error)throw new Error("pulse_block_check_failed");
  return Boolean(ab.data||ba.data);
}
async function pulsePair(a:string,b:string){
  const [ab,ba]=await Promise.all([
    db.from(PULSE_FRIENDS).select("requester_id,recipient_id,status").eq("requester_id",a).eq("recipient_id",b).maybeSingle(),
    db.from(PULSE_FRIENDS).select("requester_id,recipient_id,status").eq("requester_id",b).eq("recipient_id",a).maybeSingle()
  ]);
  if(ab.error||ba.error)throw new Error("pulse_friend_query_failed");
  return ab.data||ba.data||null;
}
async function pulseTarget(me:{userId:string;role:string},target:string){
  if(!/^user_[A-Za-z0-9_-]+$/.test(target)||target===me.userId)throw new Error("invalid_friend_target");
  if(await pulseBlocked(me.userId,target))throw new Error("blocked");
  const [tu,mu,r]=await Promise.all([
    universityAccess(target),universityAccess(me.userId),
    db.from("nbl_chat_usage_accounts").select("role").eq("clerk_user_id",target).maybeSingle()
  ]);
  if(tu.allowed&&!mu.allowed&&me.role!=="founder"&&String(r.data?.role||"")!=="founder")
    throw new Error("user_not_found");
}
async function pulseFriendList(me:{userId:string;role:string}){
  const [sent,incoming]=await Promise.all([
    db.from(PULSE_FRIENDS).select("requester_id,recipient_id,status").eq("requester_id",me.userId).limit(100),
    db.from(PULSE_FRIENDS).select("requester_id,recipient_id,status").eq("recipient_id",me.userId).limit(100)
  ]);
  if(sent.error||incoming.error)throw new Error("pulse_friends_unavailable");
  const connections=[];
  for(const pair of [...(sent.data||[]),...(incoming.data||[])]){
    const target=pair.requester_id===me.userId?pair.recipient_id:pair.requester_id;
    if(await pulseBlocked(me.userId,target))continue;
    try{await pulseTarget(me,target);}catch{continue;}
    const card=await userCard(target);
    if(!card?.handle)continue;
    connections.push({handle:card.handle,verified:Boolean(card.verified),
      direction:pair.status==="accepted"?"friends":pair.recipient_id===me.userId?"incoming":"outgoing"});
  }
  return connections;
}

async function member(threadId:string,userId:string){
  const r=await db.from("nbl_social_thread_members").select("member_role,muted").eq("thread_id",threadId).eq("clerk_user_id",userId).maybeSingle();
  return r.data||null;
}
async function thread(threadId:string){
  const r=await db.from("nbl_social_threads").select("id,thread_type,title,course_code,room_key,direct_key,created_by,metadata,created_at,updated_at").eq("id",threadId).maybeSingle();
  return r.data||null;
}
async function blockedEither(a:string,b:string){
  const r=await db.from("nbl_social_blocks").select("blocker_user_id,blocked_user_id")
    .or(`and(blocker_user_id.eq.${a},blocked_user_id.eq.${b}),and(blocker_user_id.eq.${b},blocked_user_id.eq.${a})`).limit(1);
  return Boolean(r.data?.length);
}
async function messageView(row:any){
  const sender=await userCard(String(row.sender_user_id||""));
  return {
    id:row.id,threadId:row.thread_id,body:row.deleted_at?"Message removed.":row.body,
    sender,officialRole:row.official_role||null,replyTo:row.reply_to||null,
    createdAt:row.created_at,editedAt:row.edited_at||null,deleted:Boolean(row.deleted_at)
  };
}


// LOCKE's established University entitlement is the sole source of student status.
// Regular Messenger is free; nonstudents cannot contact students through direct messages.
async function mayContactStudent(senderId:string,recipientId:string){
  const recipient=await universityAccess(recipientId);
  if(!recipient.allowed)return true;
  // The verified Founder is the public first member of NBL Messenger.
  // Allow ordinary members to message that account without granting access
  // to other enrolled students or protected University conversations.
  const targetRole=await db.from("nbl_chat_usage_accounts")
    .select("role").eq("clerk_user_id",recipientId).maybeSingle();
  if(targetRole.data?.role==="founder")return true;
  const sender=await universityAccess(senderId);
  return sender.allowed;
}

async function ensureDirect(me:any,targetId:string){
  if(!(await mayContactStudent(me.userId,targetId)))throw new Error("student_contact_restricted");
  if(targetId===me.userId)throw new Error("self_dm");
  if(await blockedEither(me.userId,targetId))throw new Error("blocked");
  const key=directKey(me.userId,targetId);
  let found=await db.from("nbl_social_threads").select("id").eq("direct_key",key).maybeSingle();
  let id=found.data?.id?String(found.data.id):"";
  if(!id){
    const made=await db.from("nbl_social_threads").insert({
      thread_type:"direct",direct_key:key,created_by:me.userId,metadata:{kind:"direct"}
    }).select("id").single();
    if(made.error){
      found=await db.from("nbl_social_threads").select("id").eq("direct_key",key).maybeSingle();
      id=String(found.data?.id||"");
    }else id=String(made.data.id);
  }
  if(!id)throw new Error("thread_create_failed");
  const rows=[
    {thread_id:id,clerk_user_id:me.userId,member_role:me.role==="founder"?"official":"member"},
    {thread_id:id,clerk_user_id:targetId,member_role:"member"}
  ];
  const up=await db.from("nbl_social_thread_members").upsert(rows,{onConflict:"thread_id,clerk_user_id"});
  if(up.error)throw new Error("thread_member_failed");
  return id;
}
async function ensureRoom(me:any,type:string,courseCode:string,title:string){
  const access=await universityAccess(me.userId);
  if(!access.allowed)throw new Error("university_required");
  const normalized=type==="study_hall"?"study_hall":type==="semester"?"semester":"class";
  const key=normalized+":"+(courseCode||access.sequence||"foundation").toLowerCase().replace(/\s+/g,"-");
  let found=await db.from("nbl_social_threads").select("id").eq("room_key",key).maybeSingle();
  let id=String(found.data?.id||"");
  if(!id){
    const made=await db.from("nbl_social_threads").insert({
      thread_type:normalized,title:title||(
        normalized==="study_hall"?(courseCode?courseCode+" Study Hall":"NBLU Study Hall"):
        normalized==="semester"?"Semester Chat":"Class Chat"
      ),
      course_code:courseCode||null,room_key:key,created_by:me.userId,
      metadata:{sequence:access.sequence}
    }).select("id").single();
    if(made.error){
      found=await db.from("nbl_social_threads").select("id").eq("room_key",key).maybeSingle();
      id=String(found.data?.id||"");
    }else id=String(made.data.id);
  }
  if(!id)throw new Error("room_create_failed");
  const up=await db.from("nbl_social_thread_members").upsert({
    thread_id:id,clerk_user_id:me.userId,member_role:"member"
  },{onConflict:"thread_id,clerk_user_id"});
  if(up.error)throw new Error("room_join_failed");
  return id;
}
async function sendMessage(me:any,threadId:string,body:string,replyTo:string|null=null,officialRole:string|null=null){
  if(me.role!=="founder" && unsafeSocialMediaReason(body))throw new Error("media_sharing_unavailable");
  const membership=await member(threadId,me.userId);
  if(!membership)throw new Error("thread_access_denied");
  const t=await thread(threadId);
  if(!t)throw new Error("thread_not_found");
  if(["study_hall","class","semester"].includes(t.thread_type)&&!(await universityAccess(me.userId)).allowed)throw new Error("university_required");
  if(t.thread_type==="study_hall"&&await assessmentLocked(me.userId))throw new Error("assessment_help_locked");
  if(t.thread_type==="direct"){
    const members=await db.from("nbl_social_thread_members").select("clerk_user_id").eq("thread_id",threadId);
    const other=(members.data||[]).map((x:any)=>String(x.clerk_user_id)).find((x:string)=>x!==me.userId);
    if(other&&!(await mayContactStudent(me.userId,other)))throw new Error("student_contact_restricted");
    if(other&&await blockedEither(me.userId,other))throw new Error("blocked");
  }
  const role=me.role==="founder"?"founder":officialRole;
  const inserted=await db.from("nbl_social_messages").insert({
    thread_id:threadId,sender_user_id:me.userId,body,official_role:role||null,reply_to:replyTo||null
  }).select("*").single();
  if(inserted.error)throw new Error("message_send_failed");
  await db.from("nbl_social_threads").update({updated_at:new Date().toISOString()}).eq("id",threadId);
  // Use the EXISTING NBL Messenger message pipeline. Phone push is a separate
  // best-effort notification, never a prerequisite for saving/sending a DM.
  // No message text, recipient ID, credentials, or browser-supplied URL travels
  // in this request. The push worker rechecks recipient membership and mute.
  if(t.thread_type==="direct"&&SERVICE){
    const delivery=fetch(BASE+"/functions/v1/nbl-messenger-push",{
      method:"POST",
      headers:{"content-type":"application/json",authorization:"Bearer "+SERVICE},
      body:JSON.stringify({action:"deliver",messageId:String(inserted.data.id)}),
      signal:AbortSignal.timeout(8000)
    }).then(()=>{}).catch(()=>{});
    if(typeof EdgeRuntime!=="undefined"&&typeof EdgeRuntime.waitUntil==="function"){
      EdgeRuntime.waitUntil(delivery);
    }else await delivery;
  }
  return await messageView(inserted.data);
}

async function greyEscalation(req:Request,me:any,caseId:string){
  if(await assessmentLocked(me.userId))throw new Error("assessment_help_locked");
  const c=await db.from("university_help_cases")
    .select("id,thread_id,asker_user_id,course_code,question_message_id,status")
    .eq("id",caseId).maybeSingle();
  if(!c.data)throw new Error("help_case_not_found");
  if(String(c.data.asker_user_id)!==me.userId)throw new Error("asker_required");
  if(String(c.data.status)!=="open")throw new Error("help_case_not_open");
  const q=await db.from("nbl_social_messages").select("body").eq("id",c.data.question_message_id).maybeSingle();
  const question=clean(q.data?.body,3500);
  if(!question)throw new Error("help_question_missing");

  const response=await fetch(BASE+"/functions/v1/nbl-foundation-runtime",{
    method:"POST",
    headers:{"content-type":"application/json","authorization":"Bearer "+me.token},
    body:JSON.stringify({
      action:"grey",courseCode:String(c.data.course_code||""),messages:[{role:"user",content:question}]
    })
  });
  const payload=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(payload?.message||"grey_escalation_failed");
  const answer=clean(payload?.message,8000);
  if(!answer)throw new Error("grey_escalation_empty");

  const posted=await db.from("nbl_social_messages").insert({
    thread_id:c.data.thread_id,sender_user_id:"nbl:grey",body:answer,official_role:"grey",
    reply_to:c.data.question_message_id,metadata:{helpCaseId:caseId,route:"study_hall_escalation"}
  }).select("*").single();
  if(posted.error)throw new Error("grey_message_record_failed");

  await db.from("university_help_cases").update({
    status:"escalated",escalated_at:new Date().toISOString(),updated_at:new Date().toISOString()
  }).eq("id",caseId).eq("asker_user_id",me.userId).eq("status","open");
  return await messageView(posted.data);
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(req)});
  if(req.method!=="POST")return json(req,{ok:false,reason:"method_not_allowed"},405);
  const o=origin(req);if(o&&!ALLOWED.has(o))return json(req,{ok:false,reason:"origin_not_allowed"},403);
  const me=await actor(req);if(!me)return json(req,{ok:false,reason:"sign_in_required"},401);

  let body:any={};try{body=await req.json();}catch{return json(req,{ok:false,reason:"invalid_json"},400);}
  const action=clean(body?.action,50).toLowerCase();

  try{

    // NBL Pulse public author lookup: no private profile fields.
    if(action==="social_profile"){
      const id=clean(body?.userId,90);
      if(!/^user_[A-Za-z0-9_-]+$/.test(id)||await pulseBlocked(me.userId,id))
        return json(req,{ok:false,reason:"profile_not_found"},404);
      try{await pulseTarget(me,id);}catch{return json(req,{ok:false,reason:"profile_not_found"},404);}
      const card=await userCard(id);
      if(!card?.handle)return json(req,{ok:false,reason:"profile_not_found"},404);
      return json(req,{ok:true,profile:{handle:card.handle,verified:Boolean(card.verified)}});
    }
    if(action==="friends_list")return json(req,{ok:true,connections:await pulseFriendList(me)});
    if(["friend_request","friend_accept","friend_decline","friend_remove"].includes(action)){
      const target=await resolveHandle(body?.handle);
      if(!target)return json(req,{ok:false,reason:"user_not_found"},404);
      try{await pulseTarget(me,target);}catch(e:any){
        return json(req,{ok:false,reason:e.message||"invalid_friend_target"},403);
      }
      const pair=await pulsePair(me.userId,target);
      if(action==="friend_request"){
        if(pair)return json(req,{ok:true,state:pair.status==="accepted"?"friends":
          pair.recipient_id===me.userId?"incoming":"outgoing"});
        const since=new Date(Date.now()-24*60*60*1000).toISOString();
        const count=await db.from(PULSE_FRIENDS).select("requester_id",{head:true,count:"exact"})
          .eq("requester_id",me.userId).gte("created_at",since);
        if(count.error)throw new Error("pulse_friend_limit_unavailable");
        if((count.count||0)>=20)return json(req,{ok:false,reason:"friend_request_daily_limit"},429);
        const made=await db.from(PULSE_FRIENDS).insert({
          requester_id:me.userId,recipient_id:target,status:"pending"
        });
        if(made.error)throw new Error("pulse_friend_request_failed");
        return json(req,{ok:true,state:"outgoing"});
      }
      if(!pair)return json(req,{ok:false,reason:"friend_not_found"},404);
      if(action==="friend_accept"){
        if(pair.status!=="pending"||pair.recipient_id!==me.userId)
          return json(req,{ok:false,reason:"friend_not_pending"},403);
        const changed=await db.from(PULSE_FRIENDS).update({status:"accepted",updated_at:new Date().toISOString()})
          .eq("requester_id",target).eq("recipient_id",me.userId).eq("status","pending")
          .select("status").maybeSingle();
        if(changed.error||!changed.data)throw new Error("pulse_accept_failed");
        return json(req,{ok:true,state:"friends"});
      }
      if(action==="friend_decline"&&(pair.status!=="pending"||pair.recipient_id!==me.userId))
        return json(req,{ok:false,reason:"friend_not_pending"},403);
      if(action==="friend_remove"&&pair.status!=="accepted")
        return json(req,{ok:false,reason:"friend_not_found"},404);
      const removed=await db.from(PULSE_FRIENDS).delete()
        .eq("requester_id",pair.requester_id).eq("recipient_id",pair.recipient_id);
      if(removed.error)throw new Error("pulse_remove_failed");
      return json(req,{ok:true,state:action==="friend_decline"?"declined":"removed"});
    }

    if(action==="me"){
      const [u,locked,profile,wallet]=await Promise.all([
        universityAccess(me.userId),assessmentLocked(me.userId),
        db.from("university_scoreboard_profiles").select("helper_mode,helper_level").eq("clerk_user_id",me.userId).maybeSingle(),
        db.rpc("nbl_studios_wallet_state",{p_clerk_user_id:me.userId})
      ]);
      return json(req,{ok:true,me:{
        handle:publicHandle(me.username,me.role,u.allowed),role:me.role,university:u.allowed,
        assessmentHelpLocked:locked,helperMode:Boolean(profile.data?.helper_mode),
        helperLevel:profile.data?.helper_level||null,studioCredits:Number(wallet.data?.balanceCredits||0)
      }});
    }

    if(action==="find_users"){
      const q=handleInput(body?.q);
      if(q.length<2)return json(req,{ok:true,users:[]});
      const search=q;
      const profiles=await db.from("nbl_account_profiles").select("clerk_user_id,username")
        .ilike("username","%"+search+"%").limit(20);
      const ids=(profiles.data||[]).map((x:any)=>String(x.clerk_user_id));
      const [roles,students]=await Promise.all([roleMap(ids),universitySet(ids)]);
      const requesterUniversity=(await universityAccess(me.userId)).allowed;
      const users=(profiles.data||[]).filter((x:any)=>requesterUniversity||!students.has(String(x.clerk_user_id))||roles.get(String(x.clerk_user_id))==="founder").map((x:any)=>{
        const id=String(x.clerk_user_id),role=roles.get(id)||"ordinary";
        return {handle:publicHandle(clean(x.username,30)||null,role,students.has(id)),verified:role==="founder",university:students.has(id)};
      }).filter((x:any)=>x.handle&&x.handle.toLowerCase().includes(q));
      if("nblfounderofficial".includes(q)||"foundernbl".includes(q)||"nblfounder".includes(q)){
        const f=await db.from("nbl_chat_usage_accounts").select("clerk_user_id").eq("role","founder").limit(1).maybeSingle();
        if(f.data?.clerk_user_id&&!users.some((x:any)=>x.handle===FOUNDER_PUBLIC_HANDLE))
          users.unshift({handle:FOUNDER_PUBLIC_HANDLE,verified:true,university:true});
      }
      return json(req,{ok:true,users:users.slice(0,20)});
    }

    if(action==="direct"){
      const target=await resolveHandle(body?.handle);
      if(!target)return json(req,{ok:false,reason:"user_not_found"},404);
      const id=await ensureDirect(me,target);
      return json(req,{ok:true,threadId:id,target:await userCard(target)});
    }

    if(action==="room"){
      const type=clean(body?.type,30).toLowerCase();
      if(!["study_hall","class","semester"].includes(type))return json(req,{ok:false,reason:"invalid_room_type"},400);
      const id=await ensureRoom(me,type,course(body?.courseCode),clean(body?.title,120));
      return json(req,{ok:true,threadId:id,room:await thread(id)});
    }

    if(action==="list_threads"){
      const memberships=await db.from("nbl_social_thread_members").select("thread_id,member_role,muted,last_read_at")
        .eq("clerk_user_id",me.userId).order("joined_at",{ascending:false}).limit(200);
      const ids=(memberships.data||[]).map((x:any)=>String(x.thread_id));
      if(!ids.length)return json(req,{ok:true,threads:[]});
      const threads=await db.from("nbl_social_threads")
        .select("id,thread_type,title,course_code,room_key,updated_at,created_at").in("id",ids).order("updated_at",{ascending:false});
      const membershipMap=new Map((memberships.data||[]).map((x:any)=>[String(x.thread_id),x]));
      const out=[];
      for(const row of threads.data||[]){
        let peer=null;
        if(row.thread_type==="direct"){
          const ms=await db.from("nbl_social_thread_members").select("clerk_user_id").eq("thread_id",row.id);
          const other=(ms.data||[]).map((x:any)=>String(x.clerk_user_id)).find((id:string)=>id!==me.userId);
          if(other&&!(await mayContactStudent(me.userId,other)))continue;
          if(other)peer=await userCard(other);
        }
        if(["study_hall","class","semester"].includes(row.thread_type)&&!(await universityAccess(me.userId)).allowed)continue;
        const own:any=membershipMap.get(String(row.id))||{};
        out.push({...row,peer,muted:Boolean(own.muted),memberRole:own.member_role||"member"});
      }
      return json(req,{ok:true,threads:out});
    }

    if(action==="list_messages"){
      const threadId=uuid(body?.threadId);if(!threadId)return json(req,{ok:false,reason:"thread_required"},400);
      if(!(await member(threadId,me.userId)))return json(req,{ok:false,reason:"thread_access_denied"},403);
      const currentThread=await thread(threadId);
      if(["study_hall","class","semester"].includes(String(currentThread?.thread_type||""))&&!(await universityAccess(me.userId)).allowed)return json(req,{ok:false,reason:"university_required"},403);
      if(currentThread?.thread_type==="direct"){
        const participants=await db.from("nbl_social_thread_members").select("clerk_user_id").eq("thread_id",threadId);
        const other=(participants.data||[]).map((x:any)=>String(x.clerk_user_id)).find((id:string)=>id!==me.userId);
        if(other&&!(await mayContactStudent(me.userId,other)))return json(req,{ok:false,reason:"student_contact_restricted"},403);
      }
      const rows=await db.from("nbl_social_messages").select("*").eq("thread_id",threadId)
        .order("created_at",{ascending:false}).limit(Math.max(1,Math.min(100,Number(body?.limit)||60)));
      await db.from("nbl_social_thread_members").update({last_read_at:new Date().toISOString()})
        .eq("thread_id",threadId).eq("clerk_user_id",me.userId);
      const messages=[];for(const row of [...(rows.data||[])].reverse())messages.push(await messageView(row));
      return json(req,{ok:true,thread:await thread(threadId),messages});
    }

    if(action==="send"){
      const threadId=uuid(body?.threadId),text=clean(body?.message,8000),reply=uuid(body?.replyTo)||null;
      if(!threadId||!text)return json(req,{ok:false,reason:"thread_and_message_required"},400);
      return json(req,{ok:true,message:await sendMessage(me,threadId,text,reply)});
    }

    if(action==="ask_help"){
      const threadId=uuid(body?.threadId),text=clean(body?.question,8000);
      if(!threadId||!text)return json(req,{ok:false,reason:"thread_and_question_required"},400);
      const t=await thread(threadId);
      if(!t||t.thread_type!=="study_hall")return json(req,{ok:false,reason:"study_hall_required"},400);
      if(!(await member(threadId,me.userId)))return json(req,{ok:false,reason:"thread_access_denied"},403);
      if(await assessmentLocked(me.userId))return json(req,{ok:false,reason:"assessment_help_locked"},403);
      const msg=await sendMessage(me,threadId,text,null);
      const created=await db.from("university_help_cases").insert({
        thread_id:threadId,asker_user_id:me.userId,course_code:t.course_code||null,question_message_id:msg.id
      }).select("id,status,course_code,created_at").single();
      if(created.error)throw new Error("help_case_create_failed");
      return json(req,{ok:true,helpCase:created.data,message:msg});
    }

    if(action==="list_help_cases"){
      const threadId=uuid(body?.threadId);if(!threadId)return json(req,{ok:false,reason:"thread_required"},400);
      if(!(await member(threadId,me.userId)))return json(req,{ok:false,reason:"thread_access_denied"},403);
      const rows=await db.from("university_help_cases")
        .select("id,asker_user_id,course_code,question_message_id,status,solved_message_id,helper_user_id,awarded_points,solved_at,escalated_at,created_at")
        .eq("thread_id",threadId).order("created_at",{ascending:false}).limit(100);
      const cases=[];
      for(const row of rows.data||[]){
        cases.push({
          id:row.id,courseCode:row.course_code||null,questionMessageId:row.question_message_id,
          status:row.status,solvedMessageId:row.solved_message_id||null,
          isYours:String(row.asker_user_id)===me.userId,
          helper:row.helper_user_id?await userCard(String(row.helper_user_id)):null,
          pointsAwarded:Number(row.awarded_points||0),solvedAt:row.solved_at||null,
          escalatedAt:row.escalated_at||null,createdAt:row.created_at
        });
      }
      return json(req,{ok:true,cases});
    }

    if(action==="solve_help"){
      const caseId=uuid(body?.caseId),messageId=uuid(body?.messageId);
      if(!caseId||!messageId)return json(req,{ok:false,reason:"case_and_message_required"},400);
      const solved=await db.rpc("nbl_social_solve_help_case",{
        p_asker_user_id:me.userId,p_case_id:caseId,p_solution_message_id:messageId
      });
      if(solved.error)throw new Error("help_solve_failed");
      if(solved.data?.ok!==true)return json(req,{ok:false,...solved.data},409);
      return json(req,{ok:true,solution:solved.data});
    }

    if(action==="ask_grey"){
      const caseId=uuid(body?.caseId);if(!caseId)return json(req,{ok:false,reason:"case_required"},400);
      const answer=await greyEscalation(req,me,caseId);
      return json(req,{ok:true,escalated:true,message:answer});
    }

    if(action==="helper_board"){
      const board=await db.rpc("nbl_social_helper_board",{
        p_period_start:body?.periodStart||new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString(),
        p_limit:Math.max(1,Math.min(100,Number(body?.limit)||25))
      });
      if(board.error)throw new Error("helper_board_unavailable");
      return json(req,{ok:true,board:board.data});
    }

    if(action==="mute"){
      const threadId=uuid(body?.threadId);if(!threadId)return json(req,{ok:false,reason:"thread_required"},400);
      const r=await db.from("nbl_social_thread_members").update({muted:body?.muted===true})
        .eq("thread_id",threadId).eq("clerk_user_id",me.userId).select("muted").maybeSingle();
      if(r.error||!r.data)return json(req,{ok:false,reason:"thread_access_denied"},403);
      return json(req,{ok:true,muted:r.data.muted});
    }

    if(action==="block"){
      const target=await resolveHandle(body?.handle);if(!target)return json(req,{ok:false,reason:"user_not_found"},404);
      if(target===me.userId)return json(req,{ok:false,reason:"cannot_block_self"},400);
      const r=await db.from("nbl_social_blocks").upsert({blocker_user_id:me.userId,blocked_user_id:target},{onConflict:"blocker_user_id,blocked_user_id"});
      if(r.error)throw new Error("block_failed");return json(req,{ok:true,blocked:true});
    }
    if(action==="unblock"){
      const target=await resolveHandle(body?.handle);if(!target)return json(req,{ok:false,reason:"user_not_found"},404);
      await db.from("nbl_social_blocks").delete().eq("blocker_user_id",me.userId).eq("blocked_user_id",target);
      return json(req,{ok:true,blocked:false});
    }

    if(action==="report"){
      const messageId=uuid(body?.messageId),reason=clean(body?.reason,500);
      if(!messageId||!reason)return json(req,{ok:false,reason:"message_and_reason_required"},400);
      const m=await db.from("nbl_social_messages").select("thread_id,metadata,deleted_at").eq("id",messageId).maybeSingle();
      if(m.error||!m.data||!(await member(String(m.data.thread_id),me.userId)))
        return json(req,{ok:false,reason:"message_not_found"},404);
      const urgent=urgentSafetyAllegation(reason);
      // A report is an allegation, never a finding. Persist it with limited
      // incident metadata. No raw file copy, external notification or AI scan.
      const reportMetadata={priority:urgent?"urgent":"normal",held:false,source:"member_report",review:"pending"};
      const r=await db.from("nbl_social_reports").upsert({
        reporter_user_id:me.userId,message_id:messageId,reason,status:"open",metadata:reportMetadata
      },{onConflict:"reporter_user_id,message_id"});
      if(r.error)throw new Error("report_failed");
      let held=false;
      if(urgent){
        if(m.data.deleted_at)held=true;
        else {
          const existing=(m.data.metadata&&typeof m.data.metadata==="object")?m.data.metadata:{};
          const hold=await db.from("nbl_social_messages").update({
            deleted_at:new Date().toISOString(),
            metadata:{...existing,safety:{held:true,reason:"urgent_member_report",review:"pending",heldAt:new Date().toISOString()}}
          }).eq("id",messageId).is("deleted_at",null).select("id").maybeSingle();
          if(hold.error)throw new Error("safety_hold_failed");
          held=Boolean(hold.data);
          if(!held){
            const reread=await db.from("nbl_social_messages").select("deleted_at").eq("id",messageId).maybeSingle();
            held=Boolean(reread.data?.deleted_at);
          }
        }
        if(held){
          const updated=await db.from("nbl_social_reports").update({
            metadata:{...reportMetadata,held:true}
          }).eq("reporter_user_id",me.userId).eq("message_id",messageId);
          if(updated.error)throw new Error("report_status_update_failed");
        }
      }
      return json(req,{ok:true,reported:true,priority:urgent?"urgent":"normal",held});
    }

    if(action==="safety_queue"){
      if(me.role!=="founder")return json(req,{ok:false,reason:"founder_required"},403);
      const reports=await db.from("nbl_social_reports")
        .select("id,message_id,reason,status,metadata,created_at,reviewed_at")
        .eq("status","open").order("created_at",{ascending:true}).limit(100);
      if(reports.error)throw new Error("safety_queue_unavailable");
      return json(req,{ok:true,reports:(reports.data||[]).map(safeSafetyQueueItem),
        guidance:"Do not download, copy, or redistribute suspected illegal media. Use approved legal/NCMEC reporting procedures when applicable."});
    }

    if(action==="review_report"){
      if(me.role!=="founder")return json(req,{ok:false,reason:"founder_required"},403);
      const reportId=uuid(body?.reportId);
      const disposition=clean(body?.disposition,20).toLowerCase();
      if(!reportId||!["reviewed","closed"].includes(disposition))
        return json(req,{ok:false,reason:"invalid_report_review"},400);
      // Reviewing a report NEVER restores quarantined content automatically.
      const r=await db.from("nbl_social_reports")
        .update({status:disposition,reviewed_at:new Date().toISOString()})
        .eq("id",reportId).eq("status","open").select("id").maybeSingle();
      if(r.error||!r.data)return json(req,{ok:false,reason:"report_not_open"},404);
      return json(req,{ok:true,reviewed:true,restored:false});
    }

    if(action==="delete_message"){
      const messageId=uuid(body?.messageId);if(!messageId)return json(req,{ok:false,reason:"message_required"},400);
      let q=db.from("nbl_social_messages").update({deleted_at:new Date().toISOString()}).eq("id",messageId);
      if(me.role!=="founder")q=q.eq("sender_user_id",me.userId);
      const r=await q.select("id").maybeSingle();
      if(r.error||!r.data)return json(req,{ok:false,reason:"message_not_found"},404);
      return json(req,{ok:true,deleted:true});
    }

    if(action==="broadcast"){
      if(me.role!=="founder")return json(req,{ok:false,reason:"founder_required"},403);
      const scope=clean(body?.scope,30).toLowerCase(),text=clean(body?.message,8000),title=clean(body?.title,120)||"Official NBL Message";
      if(!text||!["student","students","all_nbl"].includes(scope))return json(req,{ok:false,reason:"invalid_broadcast"},400);
      let ids:string[]=[];
      if(scope==="student"){
        const target=await resolveHandle(body?.handle);if(!target)return json(req,{ok:false,reason:"user_not_found"},404);ids=[target];
      }else if(scope==="students"){
        const g=await db.from("university_guided_access").select("clerk_user_id").eq("status","approved").limit(5000);
        ids=[...new Set((g.data||[]).map((x:any)=>String(x.clerk_user_id)))];
      }else{
        const p=await db.from("nbl_account_profiles").select("clerk_user_id").limit(5000);
        ids=[...new Set((p.data||[]).map((x:any)=>String(x.clerk_user_id)))];
      }
      if(!ids.includes(me.userId))ids.push(me.userId);
      const made=await db.from("nbl_social_threads").insert({
        thread_type:"broadcast",title,created_by:me.userId,metadata:{scope}
      }).select("id").single();
      if(made.error)throw new Error("broadcast_create_failed");
      const members=ids.map(id=>({thread_id:made.data.id,clerk_user_id:id,member_role:id===me.userId?"official":"member"}));
      for(let i=0;i<members.length;i+=500){
        const r=await db.from("nbl_social_thread_members").insert(members.slice(i,i+500));
        if(r.error)throw new Error("broadcast_members_failed");
      }
      const msg=await sendMessage(me,String(made.data.id),text,null,"founder");
      return json(req,{ok:true,threadId:made.data.id,recipients:ids.length-1,message:msg});
    }

    return json(req,{ok:false,reason:"unknown_action",allowed:[
      "social_profile","friends_list","friend_request","friend_accept","friend_decline","friend_remove","me","find_users","direct","room","list_threads","list_messages","send","ask_help",
      "list_help_cases","solve_help","ask_grey","helper_board","mute","block","unblock","report","safety_queue","review_report","delete_message","broadcast"
    ]},400);
  }catch(error:any){
    const reason=error?.message||"social_unavailable";
    const status=reason==="assessment_help_locked"?403:
      reason==="media_sharing_unavailable"?400:
      ["thread_access_denied","university_required","asker_required"].includes(reason)?403:
      ["user_not_found","thread_not_found","help_case_not_found"].includes(reason)?404:
      ["blocked","self_dm"].includes(reason)?409:503;
    console.error("nbl-social",reason);
    return json(req,{ok:false,reason,message:
      reason==="assessment_help_locked"?"Study Hall help is locked while your official assessment is active.":
      reason==="university_required"?"NBL University access is required for this room.":
      reason==="blocked"?"That conversation is not available.":
      reason==="self_dm"?"You cannot start a direct message with yourself.":
      reason==="media_sharing_unavailable"?"NBL Social is text-only until media safety checks are approved. Do not share media or file links.":
      "NBL Social is temporarily unavailable."
    },status);
  }
});
