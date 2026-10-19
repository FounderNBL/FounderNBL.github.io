(()=>{
  "use strict";
  const plans=Object.freeze({
    beans:Object.freeze({name:"Beans",price:"$4.99/month",replies:"300 successful replies",renewal:"Renews at $4.99/month until cancelled or changed."}),
    beansUniversity:Object.freeze({name:"Beans + University",price:"$14.99/month"}),
    foundationStudentContinuation:Object.freeze({name:"Foundation Student Continuation",price:"$9.99/month"}),
    foundationUniversity:Object.freeze({name:"Foundation + University (first month)",price:"$34.99 one-time"}),
    getMore:Object.freeze({name:"Get More",price:"$9.99 one-time",replies:"+500 successful replies",expiry:"Purchased reply balance does not expire."}),
    foundationProgram:Object.freeze({name:"Foundation Materials + First Month of Beans",price:"$29.99 one-time",renewal:"Beans renews at $4.99/month after the included first month until cancelled or upgraded with recurring-payment consent."}),
    guidedFoundation:Object.freeze({name:"Guided Foundation",price:"$54.99 one-time"}),
    fullFoundation:Object.freeze({name:"Guided Foundation",price:"$54.99 one-time"}),
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
