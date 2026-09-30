(()=>{
"use strict";

const buttons=[...document.querySelectorAll("[data-nbl-university-checkout]")];
const status=document.querySelector("[data-nbl-university-checkout-status]");
if(!buttons.length)return;

const setStatus=value=>{if(status)status.textContent=value;};
const setBusy=value=>buttons.forEach(button=>button.disabled=value);

async function openUniversityCheckout(button){
  const plan=String(button.dataset.nblUniversityCheckout||"").trim();
  if(!["foundation","full_foundation"].includes(plan))return;
  setBusy(true);
  setStatus("Preparing secure enrollment checkout…");
  try{
    const bridge=window.NBLBillingBridge;
    if(!bridge?.checkout)throw new Error("Secure enrollment checkout is temporarily unavailable.");
    const result=await bridge.checkout(plan);
    if(result?.signInRequired){
      setStatus("Sign in with your NBL account so LOCKE can attach enrollment to the right student record.");
      location.href=result.signInUrl;
      return;
    }
    setStatus("Opening Stripe secure checkout…");
    location.href=result.destination;
  }catch(error){
    setStatus(error?.message||"Secure enrollment checkout is temporarily unavailable.");
  }finally{
    setBusy(false);
  }
}

buttons.forEach(button=>button.addEventListener("click",()=>openUniversityCheckout(button)));
})();