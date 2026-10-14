import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const required=[
  "university-campus.html","university-campus.js","university-campus.css",
  "study-lab.mjs","study-lab.css","member-chat.html","member-chat.js",
  "member-chat.css","social-realtime.js"
];
const errors=[];
const need=(text,needle,msg)=>{if(!text.includes(needle))errors.push(msg)};
const forbid=(text,needle,msg)=>{if(text.includes(needle))errors.push(msg)};
for(const file of required){
  if(!fs.existsSync(path.join(root,file)))errors.push("Missing migrated public frontend: "+file);
}
if(!errors.length){
  const university=read("university.html");
  const campus=read("university-campus.html");
  const campusJs=read("university-campus.js");
  const chat=read("member-chat.html");
  const chatJs=read("member-chat.js");
  const header=read("nbl-world-header.js");
  const social=read("social-realtime.js");
  const terms=read("terms.html");
  const signIn="https://accounts.newbeansland.org";
  need(university,'href="/university-campus.html#grey"',"University enrollment page must enter same-origin campus.");
  need(university,'data-nbl-university-checkout="foundation" disabled',"University checkout must remain held.");
  need(university,'data-nbl-university-checkout="full_foundation" disabled',"Guided University checkout must remain held.");
  need(header,'href="/university-campus.html#grey"',"Talk to Grey must use the same-origin campus.");
  need(header,'href="/member-chat.html"',"Members need a visible person-to-person Chat entrance.");
  need(chat,'rel="canonical" href="https://newbeansland.org/member-chat.html"',"Member Chat canonical must be on .org.");
  need(chat,'data-chat-dm-form',"Member Chat needs Start DM control.");
  need(chat,'data-chat-find-form',"Member Chat needs member discovery.");
  need(chat,'data-chat-app hidden',"Human DMs must start signed-out/gated.");
  need(chat,'src="/member-chat.js', "Member Chat must load local frontend runtime.");
  need(chatJs,'const SOCIAL_API=NBL_CORE_API+"/social"',"Human DMs must route through guarded NBL Core.");
  need(chatJs,'session.getToken()',"Human DMs must use verified Clerk bearer tokens.");
  need(campus,'rel="canonical" href="https://newbeansland.org/university-campus.html"',"Student campus canonical must be on .org.");
  need(campus,'src="/university-campus.js',"Student campus must load its same-origin frontend.");
  need(campus,'data-campus-gate',"Student campus must present a protected access gate.");
  need(campusJs,'const UNIVERSITY_PUBLIC_CHECKOUT_ENABLED=false',"Unverified University billing must remain held.");
  need(campusJs,'const API=NBL_CORE_API+"/university"',"Student campus must call guarded NBL Core.");
  need(campusJs,'action:"university_status"',"Student entitlement must be checked server-side.");
  need(campusJs,'clerk.session.getToken()',"Student campus must use Clerk bearer tokens.");
  need(social,"config:{private:true}","Private Realtime notifications must remain private.");
  need(terms,"protected University classroom are on NewBeansland.org","Terms must reflect .org as campus owner.");
  for(const [label,code] of [["Member Chat",chatJs],["University campus",campusJs]]){
    need(code,signIn,label+" must use existing .org account portal.");
    forbid(code,"https://nblworld.com",label+" must not return to the incompatible .com Clerk origin.");
    forbid(code,"service_role",label+" cannot include service role keys.");
    forbid(code,"STRIPE_SECRET_KEY",label+" cannot include a private Stripe key.");
    forbid(code,"OPENAI_API_KEY",label+" cannot include a private provider key.");
  }
  for(const [label,html] of [["Member Chat",chat],["University campus",campus]]){
    forbid(html,'href="https://nblworld.com/university.html"',label+" must not send University users back to .com.");
  }
}
if(errors.length){console.error("[org-member-surfaces] FAIL");errors.forEach(e=>console.error("- "+e));process.exit(1);}
console.log("[org-member-surfaces] PASS: .org hosts authenticated member Chat and gated University campus with existing server-side LOCKE and payment release holds.");
