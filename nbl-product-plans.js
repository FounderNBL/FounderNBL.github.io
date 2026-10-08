(()=>{
  "use strict";
  const plans=Object.freeze({
    beans:Object.freeze({
      name:"Beans",
      price:"Free to start",
      replies:"10 free successful Beans replies",
      brandLine:"The New Beansland AI assistant"
    }),
    chatPlus:Object.freeze({
      name:"NBL Plus",
      price:"$4.99 first month · then $29.99/month",
      introPrice:"$4.99 first month",
      renewalPrice:"$29.99/month",
      introUsage:"350 NBL Usage credits",
      monthlyUsage:"1,800 NBL Usage credits/month",
      brandLine:"Premium Beans tools, files, web, voice, images, code/data and more"
    }),
    chatPlusUniversity:Object.freeze({
      name:"NBL University",
      price:"$39.99/month",
      monthlyUsage:"2,500 NBL Usage credits/month",
      brandLine:"Includes NBL Plus + Professor Grey™ + Virgo System™ + protected University learning"
    }),
    getMore:Object.freeze({
      name:"NBL Usage",
      price:"$7 one-time",
      replies:"500 NBL Usage credits",
      expiry:"Purchased NBL Usage does not expire."
    }),
    foundationProgram:Object.freeze({
      name:"Foundation Program",
      price:"$29.99 one-time",
      brandLine:"Self-directed Foundation path"
    }),
    guidedFoundation:Object.freeze({
      name:"Legacy Guided Foundation",
      price:"Not offered"
    }),
    fullFoundation:Object.freeze({
      name:"Legacy Guided Foundation",
      price:"Not offered"
    }),
    fullNblu:Object.freeze({
      name:"Full NBLU Experience",
      price:"$449.99 one-time",
      bonusUsage:"4,300 Bonus NBL Usage credits",
      brandLine:"Six months of NBL University, staged physical course books/workbooks, free ebooks and about $60 in bonus NBL Usage"
    }),
    nbluContinuation:Object.freeze({
      name:"Full NBLU Owner Continuation",
      price:"$14.99/month",
      brandLine:"Legacy owner-only continuation after the included Full NBLU period"
    }),
    studentAccessFund:Object.freeze({
      name:"NBL Student Access Fund",
      price:"Optional $1+",
      brandLine:"Helps NBL cover student access, materials and NBL Usage for students with fewer resources"
    })
  });
  window.NBL_PRODUCT_PLANS=plans;
  const valueFor=path=>path.split(".").reduce((value,key)=>value?.[key],plans);
  document.querySelectorAll("[data-nbl-plan-value]").forEach(element=>{
    const value=valueFor(element.dataset.nblPlanValue);
    if(typeof value==="string") element.textContent=value;
  });
})();
