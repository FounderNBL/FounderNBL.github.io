(()=>{
"use strict";
const form=document.querySelector("[data-nbl-university-interest-form]");
if(!form)return;
const status=form.querySelector("[data-nbl-university-interest-status]");
const submit=form.querySelector("[data-nbl-university-interest-submit]");
const withdraw=form.querySelector("[data-nbl-university-interest-withdraw]");
const select=form.querySelector('[name="interestKind"]');
const updates=form.querySelector('[name="emailOptIn"]');
const endpoint="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-university-early-interest";
const signin=()=> "https://accounts.newbeansland.org/sign-in?redirect_url="+
 encodeURIComponent("https://newbeansland.org/university-enrollment.html#early-registration");
const setStatus=text=>{status.textContent=text;};
let running=false;
const setRunning=value=>{
 running=value;submit.disabled=value;withdraw.disabled=value;
};
async function authToken({redirect=false}={}){
 const bridge=window.NBLAccountBridge;
 if(!bridge?.getClerk||!bridge?.getToken)throw new Error("NBL sign-in is loading. Try again in a moment.");
 const clerk=await bridge.getClerk();
 if(!clerk?.isSignedIn){
   if(redirect){location.href=signin();}
   return null;
 }
 const token=await bridge.getToken();
 if(!token)throw new Error("Your NBL session is still connecting. Please try again.");
 return token;
}
async function request(method,body,{redirect=false}={}){
 const token=await authToken({redirect});
 if(!token)return null;
 const response=await fetch(endpoint,{
  method,headers:{accept:"application/json",authorization:"Bearer "+token,
     ...(method==="POST"?{"content-type":"application/json"}:{})},
  ...(body?{body:JSON.stringify(body)}:{}),
  cache:"no-store"
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok){
  if(response.status===401)throw new Error("Your NBL session expired. Please sign in again.");
  throw new Error("Early registration could not be saved. Please try again.");
 }
 return data;
}
function updateUi(record){
 const registered=record?.status==="waiting";
 if(registered){
  if(record.interest_kind&&[...select.options].some(x=>x.value===record.interest_kind))select.value=record.interest_kind;
  updates.checked=record.email_opt_in===true;
 }
 withdraw.style.display=registered?"inline-flex":"none";
 submit.textContent=registered?"Update my registration":"Join early registration";
 setStatus(registered
  ?"You are on the NBL University early-registration list. We will announce when enrollment opens; no payment has been taken."
  :"Join the early-registration list free using your NBL account. School and checkout are not open yet.");
}
form.addEventListener("submit",async event=>{
 event.preventDefault();if(running)return;setRunning(true);setStatus("Saving your early registration…");
 try{
  const data=await request("POST",{action:"join",interestKind:select.value,emailOptIn:updates.checked},{redirect:true});
  if(data)updateUi(data.registration);
 }catch(error){setStatus(error.message||"Registration could not be saved.");}
 finally{setRunning(false);}
});
withdraw.addEventListener("click",async()=>{
 if(running)return;setRunning(true);setStatus("Updating your registration…");
 try{
  const data=await request("POST",{action:"withdraw"},{redirect:false});
  if(data)updateUi({status:"withdrawn"});
 }catch(error){setStatus(error.message||"Registration could not be changed.");}
 finally{setRunning(false);}
});
(async()=>{
 try{
  const data=await request("GET",null,{redirect:false});
  if(data)updateUi(data.registration);
 }catch{ /* Signed-in account may still be connecting. Explicit submit retries. */ }
})();
})();
