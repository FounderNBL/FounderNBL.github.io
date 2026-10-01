(()=>{
  "use strict";
  const plans=Object.freeze({
    beans:Object.freeze({name:"Beans",price:"$4.99/month",replies:"300 successful replies"}),
    chatPlus:Object.freeze({name:"NBL Chat Plus",price:"$19.99/month",replies:"1,050 successful replies total"}),
    getMore:Object.freeze({name:"Get More",price:"$9.99 one-time",replies:"+500 successful replies",expiry:"Purchased reply balance does not expire."}),
    foundationProgram:Object.freeze({name:"Foundation Program",price:"$29.99 one-time"}),
    guidedFoundation:Object.freeze({name:"Guided Foundation",price:"$49.99 one-time"}),
    fullFoundation:Object.freeze({name:"Guided Foundation",price:"$49.99 one-time"}),
    fullNblu:Object.freeze({name:"Full NBLU Experience",price:"$149.99 one-time"}),
    nbluContinuation:Object.freeze({name:"Full NBLU Owner Continuation",price:"$14.99/month"})
  });
  window.NBL_PRODUCT_PLANS=plans;
  const valueFor=path=>path.split(".").reduce((value,key)=>value?.[key],plans);
  document.querySelectorAll("[data-nbl-plan-value]").forEach(element=>{
    const value=valueFor(element.dataset.nblPlanValue);
    if(typeof value==="string") element.textContent=value;
  });
})();
