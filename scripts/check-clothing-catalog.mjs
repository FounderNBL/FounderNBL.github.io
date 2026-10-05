import fs from "node:fs";
import path from "node:path";

const root=path.resolve(new URL("..",import.meta.url).pathname);
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const clothing=read("clothing.html");
const sync=read("nbl-clothing-sync.js");
const kids=read("nbl-kids.html");
let failed=false;

function requireText(source,text,message){
  if(!source.includes(text)){
    console.error("[clothing-catalog] FAIL:",message);
    failed=true;
  }
}
function forbidText(source,text,message){
  if(source.includes(text)){
    console.error("[clothing-catalog] FAIL:",message);
    failed=true;
  }
}
function requireAsset(file){
  if(!fs.existsSync(path.join(root,file))){
    console.error("[clothing-catalog] FAIL: missing catalog asset",file);
    failed=true;
  }
}

const mainShirts=[
  "NBL-Being-Black.png",
  "NBL_Iced_Out_T.png",
  "NBL_Identity_T.png",
  "NBL_Identity_T_alt.png"
];
const prideShirts=[
  "NBL_American_T.png",
  "NBL_Get_The_Point_T.png",
  "NBL_Trans_Lives_T.png",
  "NBL_We_Are_One_T.png"
];
const kidsShirts=[
  "NBL_Kids_I_Know.png",
  "NBL_Kids_My_Dad.png"
];

for(const asset of [...mainShirts,...prideShirts,...kidsShirts]) requireAsset(asset);
for(const asset of mainShirts) requireText(clothing,`/${asset}`,`main shirt is not displayed from current asset: ${asset}`);
for(const asset of prideShirts) requireText(clothing,`/${asset}`,`Pride feature is missing current asset: ${asset}`);
for(const asset of kidsShirts) requireText(kids,`/${asset}`,`NBL Kids is missing current shirt asset: ${asset}`);

requireText(clothing,'id="statements"',"main shirt collection section is missing");
requireText(clothing,'id="pride"',"Pride feature section is missing");
requireText(clothing,'href="/nbl-kids.html"',"adult clothing page does not route NBL Kids to its dedicated department");
requireText(clothing,'href="https://new-beansland.myshopify.com"',"clothing page does not expose the live Shopify storefront");
requireText(sync,'const SHOPIFY_URL="https://new-beansland.myshopify.com"',"clothing runtime does not use the live Shopify storefront");
requireText(sync,'button.href=SHOPIFY_URL',"product Buy/Shop buttons are not forced to the live Shopify storefront");
forbidText(sync,'mailto:founder@newbeansland.org?subject=',"runtime-generated clothing purchases still route to email instead of Shopify");
requireText(kids,'id="shop-kids"',"NBL Kids shop section is missing");
requireText(kids,'href="#shop-kids"',"NBL Kids internal shop door is not routed to its own section");

const prideCards=(clothing.match(/class="product nbl-pride-card/g)||[]).length;
if(prideCards!==4){
  console.error("[clothing-catalog] FAIL: expected exactly 4 Pride feature cards, found",prideCards);
  failed=true;
}

forbidText(clothing,"NBL-Ice-Out-outfit.png","clothing.html still points at the retired Ice Out artwork");
forbidText(sync,"NBL-Ice-Out-outfit.png","runtime still points at the retired Ice Out artwork");
forbidText(clothing,"NBL_Kids_I_Know.png","adult clothing page duplicates the NBL Kids shirt catalog");
forbidText(clothing,"NBL_Kids_My_Dad.png","adult clothing page duplicates the NBL Kids shirt catalog");
forbidText(sync,'id:"nbl-kids-real-dad"',"runtime still injects kids shirts into adult clothing");
forbidText(sync,'id:"nbl-kids-my-dad"',"runtime still injects kids shirts into adult clothing");
forbidText(sync,'id:"nbl-american-tee"',"runtime still duplicates Pride shirts inside the general statement grid");
forbidText(sync,'id:"nbl-trans-lives-tee"',"runtime still duplicates Pride shirts inside the general statement grid");
forbidText(sync,'id:"nbl-we-are-one-tee"',"runtime still duplicates Pride shirts inside the general statement grid");
forbidText(kids,'href="/clothing.html">Visit Clothing',"NBL Kids shop still sends shoppers back to adult clothing");
requireText(sync,'if(status.closest("#pride")) return;',"runtime does not preserve Pride Coming Soon labels");
requireText(sync,'if(!card.closest("#pride")) applyBuyArtOverlay(card);',"runtime can still stamp Buy Now artwork over Pride feature cards");

if(failed) process.exitCode=1;
else console.log("[clothing-catalog] PASS: current adult shirts, 4-card Pride feature, dedicated NBL Kids catalog, asset existence and stale-reference guards are clean.");
