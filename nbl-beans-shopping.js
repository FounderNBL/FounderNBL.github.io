(()=>{
"use strict";
// Independent account-bound shopping guide. Personalization handles no network requests.
const panel=document.getElementById("nbl-beans-panel");
if(!panel||panel.querySelector("[data-nbl-beans-bag]"))return;
const drawerScroll=panel.querySelector(".nbl-chat-drawer-scroll");
const history=panel.querySelector(".nbl-chat-drawer-history");
if(!drawerScroll||!history)return;
const bagDetails=document.createElement("details");
bagDetails.className="nbl-beans-bag-explore";
// Keep existing Explore NBL Worlds unique for browser automation/accessibility.
bagDetails.style.cssText="border:1px solid rgba(239,198,111,.3);border-radius:12px;margin:12px 0;padding:10px;color:inherit;";

bagDetails.dataset.nblBeansBag="true";
bagDetails.innerHTML=[
  '<summary>▤ My Bag &amp; spending <span aria-hidden="true">⌄</span></summary>',
  '<div class="nbl-beans-bag-helper">',
  '<p data-nbl-beans-bag-status role="status" aria-live="polite">Open to check your Bag and Beans subscription safely.</p>',
  '<nav aria-label="Beans shopping and spending help">',
  '<a href="/account.html#nblBagCard">My Bag &amp; balance</a>',
  '<a href="/account.html#membershipCard">Subscribe to Beans</a>',
  '<a href="/pricing.html">See NBL prices</a>',
  '<a href="/pulse/">Pulse</a>',
  '<a href="/books.html">Books</a>',
  '<a href="https://new-beansland.myshopify.com">Clothing shop</a>',
  '</nav></div>'
].join("");
drawerScroll.insertBefore(bagDetails,history);
bagDetails.addEventListener("toggle",async()=>{
  if(!bagDetails.open){
    bagDetails.querySelector("[data-nbl-beans-bag-status]").textContent="Open to check your Bag and Beans subscription safely.";
    return;
  }
  const status=bagDetails.querySelector("[data-nbl-beans-bag-status]");
  const originalUser=String(window.Clerk?.user?.id||"");
  status.textContent="Checking your NBL account…";
  try{
    const t=await window.NBLAccountBridge?.getToken?.();
    if(!t){status.textContent="Sign in to your NBL account to see your Bag. You can still browse the shops and prices below.";return;}
    const response=await fetch("https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-bag?view=mine",{
      method:"GET",cache:"no-store",
      headers:{"Accept":"application/json","Authorization":"Bearer "+t}
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok||data.ok!==true)throw Error("Bag status cannot be verified.");
    // A different login on a shared device must never see the prior user's Bag.
    const currentUser=String(window.Clerk?.user?.id||"");
    if(!bagDetails.open||!originalUser||currentUser!==originalUser){
      status.textContent="Your account changed. Open this section again to check your Bag.";
      return;
    }
    const bag=data.bag||{};
    const beans=data.beans||{};
    const member=String(beans.membershipStatus||"none").replaceAll("_"," ");
    status.textContent=bag.enabled&&Number.isSafeInteger(bag.totalUnits)
      ?"Your Bag: "+bag.totalUnits+" Beanies ("+bag.purchasedUnits+" purchased, "+bag.promotionalUnits+" rewards). Spending: "+(bag.spendingEnabled?"available":"not activated")+". Beans membership: "+member+"."
      :"Your Bag is connected, but Beanies and Rack spending are not live yet. Beans membership: "+member+". Existing membership checkout is separate.";
  }catch{
    status.textContent="Could not verify your private Bag right now. No money was moved. Open My Account to try again.";
  }
});


})();
