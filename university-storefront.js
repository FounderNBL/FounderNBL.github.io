(()=>{
"use strict";
// Catalog was reconciled with the live New Beansland Stripe products/prices on 2026-11-02.
// Clerk provides NBL identity; Stripe owns actual charges. The NBL billing backend
// continues to enforce release holds, ownership rules, and authoritative price IDs.
// Never infer that equal prices mean identical entitlements.
const PLANS=Object.freeze({
  foundation:{title:"Foundation Materials + First Month of Beans",price:"$29.99 once",
    desc:"Two physical books and the first month of regular Beans. This package does not include University enrollment or protected digital coursework.",
    terms:"Beans renews at $4.99/month after the included month with your recurring-payment consent.",plan:"foundation",
    product:"prod_VPTRLvKDm7V5We",priceId:"price_1UOeUBB8jr0ZIsSbopkO6zn6"},
  foundation_university:{title:"Foundation + NBL University — First Month",price:"$34.99 once",
    desc:"Two physical books, included digital materials, one month of Beans, and the first month of University enrollment once campus instruction is open.",
    terms:"Pre-enrollment package. A qualifying Foundation student continuation is a separate $9.99/month product after the first included month.",plan:null,
    product:"prod_VSdkx8i03oTj8v",priceId:"price_1URiSuB8jr0ZIsSbLuuwVa7p"},
  full_foundation:{title:"Guided Foundation — NBL University",price:"$54.99 once",
    desc:"Guided Foundation learning with Professor Grey/Virgo; the current product specifies 31 days of guided eligibility.",
    terms:"University teaching services activate only after the school opens and eligibility is verified.",plan:"full_foundation",
    product:"prod_VPYLNUOOVaAjCm",priceId:"price_1UOjEVB8jr0ZIsSburX83EuO"},
  full_nblu_diy:{title:"Full NBLU Experience — Digital DIY",price:"$184.99 once",
    desc:"The complete planned full University academic and digital program, without physical books. Self-paced learning and the same six-month guided-service eligibility as the physical Full NBLU package.",
    terms:"Digital delivery only: no books or shipping. Checkout is not connected to the separate Digital DIY entitlement yet. No charge will be started.",plan:null,
    product:"prod_VYZh9w6INqKvIi",priceId:"price_1UXSXxB8jr0ZIsSbIayXWHSL"},
  full_nblu:{title:"Full NBLU Experience",price:"$449.99 once",
    desc:"The physical-books Full University experience, including six months of guided access under the published offer.",
    terms:"Physical-book fulfillment and University instruction follow the package terms; eligible continuation is separate.",plan:"full_nblu",
    product:"prod_VPTRSoxnHKdmJ3",priceId:"price_1UOeUIB8jr0ZIsSb1acvYFWb"},
  beans_university_monthly:{title:"Beans + NBL University — Monthly",price:"$14.99/month",
    desc:"Combined Beans and University access without the physical-book package.",
    terms:"Monthly renewal; access is subject to University release and student eligibility. Checkout is not wired yet.",plan:null,
    product:"prod_VSdki6fSH4ktB3",priceId:"price_1URiSwB8jr0ZIsSb3uyktHc4"},
  foundation_student_continuation:{title:"Foundation Student Continuation",price:"$9.99/month",
    desc:"Combined Beans and University continuation specifically for verified $34.99 Foundation + University purchasers after their included first month.",
    terms:"Eligibility is required. This is not a new-student enrollment option, and checkout is not wired yet.",plan:null,
    product:"prod_VSdk7RRNFclmiu",priceId:"price_1URiSxB8jr0ZIsSbYvs4bnf6"},
  nblu_continuation:{title:"Full NBLU Owner Continuation",price:"$14.99/month",
    desc:"Guided University access continuation exclusively for eligible Full NBLU owners after their included period.",
    terms:"Requires verified Full NBLU ownership; monthly renewal until cancelled or changed.",plan:"nblu_continuation",
    product:"prod_VPTRbMNgnLeX4Z",priceId:"price_1UOeULB8jr0ZIsSb3Z7wX62y"}
});
const ACCOUNTS="https://accounts.newbeansland.org";
const GATEWAY="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-chat-gateway";
const PUBLISHABLE_KEY="pk_live_Y2xlcmsubmV3YmVhbnNsYW5kLm9yZyQ";
const select=document.getElementById("nblu-program");
const button=document.getElementById("nblu-pay");
const status=document.getElementById("nblu-payment-status");
if(!select||!button||!status)return;
const price=document.getElementById("nblu-offer-price");
const desc=document.getElementById("nblu-offer-desc");
const terms=document.getElementById("nblu-offer-terms");
const initial=new URLSearchParams(location.search).get("plan");
if(initial&&PLANS[initial])select.value=initial;
const selected=()=>PLANS[select.value];
function render(){
  const item=selected();
  if(!item)return;
  price.textContent=item.price;
  desc.textContent=item.desc;
  terms.textContent=item.terms;
  status.textContent=item.plan
    ?"Review the exact package and continue with your existing NBL account."
    :"This package is in the current catalog, but paid checkout for it is not connected yet. You will not be charged.";
}
select.addEventListener("change",render);
render();
function signInUrl(){
  const returnTo=new URL("/university.html",location.origin);
  returnTo.searchParams.set("plan",select.value);
  return ACCOUNTS+"/sign-in?redirect_url="+encodeURIComponent(returnTo.href);
}
function getClerk(){
  return new Promise(async(resolve,reject)=>{
    try{
      if(!window.Clerk){
        const domain=atob(PUBLISHABLE_KEY.split("_")[2]).replace(/\$$/,"");
        const script=document.createElement("script");
        script.src="https://"+domain+"/npm/@clerk/clerk-js@6/dist/clerk.browser.js";
        script.async=true;
        script.crossOrigin="anonymous";
        script.setAttribute("data-clerk-publishable-key",PUBLISHABLE_KEY);
        script.onerror=()=>reject(new Error("NBL account service could not load."));
        script.onload=async()=>{
          try{await window.Clerk.load();resolve(window.Clerk);}
          catch(error){reject(error);}
        };
        document.head.append(script);
      }else{
        await window.Clerk.load();
        resolve(window.Clerk);
      }
    }catch(error){reject(error);}
  });
}
function trustedStripe(url){
  try{
    const u=new URL(url);
    if(u.protocol!=="https:"||!["checkout.stripe.com","billing.stripe.com","buy.stripe.com"].includes(u.hostname))return null;
    return u.href;
  }catch{return null;}
}
async function start(event){
  event.preventDefault();
  const item=selected();
  if(!item)return;
  button.disabled=true;
  status.textContent="Connecting to your NBL account…";
  try{
    const clerk=await getClerk();
    if(!clerk.isSignedIn||!clerk.session){
      status.textContent="Sign in or create your NBL account to continue.";
      location.assign(signInUrl());return;
    }
    if(!item.plan){
      status.textContent="This verified package is not yet connected to an approved payment route. Nothing was charged.";
      return;
    }
    const token=await clerk.session.getToken();
    if(!token)throw Error("Your NBL session is still connecting. Try again.");
    status.textContent="Checking availability of the selected secure checkout…";
    const response=await fetch(GATEWAY+"/billing/checkout",{
      method:"POST",headers:{"authorization":"Bearer "+token,"content-type":"application/json"},
      body:JSON.stringify({plan:item.plan}),cache:"no-store"
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok){
      status.textContent=data.message||"This tuition checkout is not available yet. No charge was started.";
      return;
    }
    if(data.route==="already_owned"){
      status.textContent="Your NBL account already owns this package. No additional payment was started.";
      return;
    }
    const url=trustedStripe(data.checkoutUrl||data.portalUrl||"");
    if(!url){
      status.textContent="Secure payment could not be opened. No new payment was started.";
      return;
    }
    location.assign(url);
  }catch(error){
    status.textContent=error?.message||"NBL sign-in or checkout is temporarily unavailable.";
  }finally{
    button.disabled=false;
  }
}
document.getElementById("nblu-one-entry").addEventListener("submit",event=>{void start(event);});
})();
