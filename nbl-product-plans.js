(()=>{
  "use strict";
  const plans=Object.freeze({
    beans:Object.freeze({name:"Beans Starter",price:"$4.99 / 7 days",status:"CHECKOUT_HELD",replies:"Beans-only access for 7 days; no included paid NBL creation services.",renewal:"Day 7 converts to NBL Basic at $20/month unless cancelled or upgraded during the first six days; requires informed customer consent."}),
    allInOne:Object.freeze({name:"NBL Basic",price:"$20/month",status:"CHECKOUT_HELD",replies:"Beans and eligible NBL services; exact monthly grants pending verification",images:"Planned, not an active entitlement",videos:"Planned, not an active entitlement",searches:"Included within plan limits, not billed per ordinary search",voice:"Planned, not an active entitlement"}),
    nblPlus:Object.freeze({name:"NBL Plus",price:"$40/month",status:"CHECKOUT_HELD",benefits:"Higher usage allowances, targeted at twice NBL Basic for eligible services; final grants pending verification."}),
    foundersDeluxe:Object.freeze({name:"Founder’s Deluxe",price:"$100/month",status:"CHECKOUT_HELD",benefits:"Highest membership tier with generous eligible-service use, subject to fair-use and provider caps."}),
    beansUniversity:Object.freeze({name:"Beans + University",price:"$14.99/month"}),
    foundationStudentContinuation:Object.freeze({name:"Foundation Student Continuation",price:"$9.99/month"}),
    foundationUniversity:Object.freeze({name:"Foundation + University (first month)",price:"$34.99 one-time"}),
    getMore:Object.freeze({name:"Get More",price:"$9.99 one-time",replies:"+500 successful replies",expiry:"Purchased reply balance does not expire."}),
    nblUsage:Object.freeze({name:"NBL Usage — 500 Credits",price:"$7.00 one-time",credits:"500 NBL Usage credits",expiry:"Purchased usage credits do not expire."}),
    foundationProgram:Object.freeze({name:"Foundation Materials + First Month of Beans",price:"$29.99 one-time",renewal:"University is under construction and new school payments are closed."}),
    guidedFoundation:Object.freeze({name:"Guided Foundation",price:"$54.99 one-time"}),
    fullFoundation:Object.freeze({name:"Guided Foundation",price:"$54.99 one-time"}),
    fullNbluDiy:Object.freeze({name:"Full NBLU Experience — Digital DIY",price:"$184.99 one-time"}),
    fullNblu:Object.freeze({name:"Full NBLU Experience",price:"$449.99 one-time"}),
    nbluContinuation:Object.freeze({name:"Full NBLU Owner Continuation",price:"$14.99/month"}),
    studiosCredits:Object.freeze({name:"NBL Studios Credits",price:"$8.99 one-time",credits:"500 NBL Studios Credits"}),
    studiosSupport:Object.freeze({name:"Support NBL Studios Fund",price:"$1.00 minimum",credits:"0 personal Studio Credits"})
  });
  window.NBL_PRODUCT_PLANS=plans;
  const valueFor=path=>path.split(".").reduce((value,key)=>value?.[key],plans);
  document.querySelectorAll("[data-nbl-plan-value]").forEach(element=>{
    const value=valueFor(element.dataset.nblPlanValue);
    if(typeof value==="string") element.textContent=value;
  });
})();
