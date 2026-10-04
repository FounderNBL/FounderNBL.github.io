(()=>{
  "use strict";
  if(!/\/clothing(?:\.html)?$/.test(location.pathname||"")) return;

  const style=document.createElement("style");
  style.textContent=`
    .nbl-price{display:inline-block;margin-right:8px;padding:7px 10px;border-radius:999px;background:#f0c56f;color:#120b02;font-size:.78rem;font-weight:900;letter-spacing:.05em}
    .nbl-current-card .product-media{background:linear-gradient(145deg,#050505,#17120a)}
    .nbl-art-buy{position:absolute;z-index:4;display:flex;align-items:center;justify-content:center;border:1px solid #f7d78d;border-radius:3px;background:linear-gradient(180deg,#e8b94f,#bb7c18);box-shadow:0 2px 8px rgba(0,0,0,.5);color:#171006;font:900 clamp(.52rem,1.25vw,.86rem)/1 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;pointer-events:none}
    .nbl-pride-shell{margin-top:26px;padding:26px;border:1px solid rgba(240,197,111,.42);border-radius:17px;background:radial-gradient(circle at 50% 0,rgba(214,161,75,.13),transparent 46%),#040b12;text-align:center}
    .nbl-pride-shell h3{margin:0;color:#f0c56f;font:700 clamp(1.8rem,4vw,3rem) Georgia,serif}
    .nbl-pride-shell p{max-width:720px;margin:10px auto 0;color:#cfc3ad;line-height:1.55}
  `;
  document.head.appendChild(style);

  const productCards=[...document.querySelectorAll(".product")];
  const findProduct=needle=>productCards.find(card=>(card.querySelector("h3")?.textContent||"").toLowerCase().includes(needle.toLowerCase()));

  const setProductImage=(needle,src,alt)=>{
    const card=findProduct(needle);
    if(!card) return null;
    let media=card.querySelector(".product-media");
    const textCard=card.querySelector(".text-card");
    if(!media&&textCard){
      media=document.createElement("div");
      media.className="product-media";
      textCard.replaceWith(media);
    }
    if(!media) return card;
    let img=media.querySelector("img");
    if(!img){img=document.createElement("img");media.appendChild(img);}
    const prior=img.getAttribute("src");
    img.onerror=()=>{
      if(prior&&img.getAttribute("src")!==prior){
        img.onerror=()=>{media?.remove();};
        img.src=prior;
      }else{
        media?.remove();
      }
    };
    img.src=src;
    img.alt=alt;
    img.loading="eager";
    img.decoding="async";
    return card;
  };

  const setPrice=(card,price)=>{
    if(!card||!price) return;
    const actions=card.querySelector(".actions")||card.querySelector(".product-copy");
    if(!actions||actions.querySelector(".nbl-price")) return;
    const el=document.createElement("span");
    el.className="nbl-price";
    el.textContent=price;
    actions.prepend(el);
  };

  const applyBuyArtOverlay=card=>{
    if(!card||card.dataset.nblBuyArt==="true") return;
    const media=card.querySelector(".product-media");
    const image=media?.querySelector("img");
    if(!media||!image) return;
    card.dataset.nblBuyArt="true";
    media.style.position="relative";
    const buy=document.createElement("span");
    buy.className="nbl-art-buy";
    buy.textContent="Buy Now";
    media.appendChild(buy);
    const placeBuy=()=>{
      const mediaBox=media.getBoundingClientRect();
      const imageBox=image.getBoundingClientRect();
      if(!imageBox.width||!imageBox.height) return;
      buy.style.left=`${imageBox.left-mediaBox.left+(imageBox.width*.566)}px`;
      buy.style.top=`${imageBox.top-mediaBox.top+(imageBox.height*.578)}px`;
      buy.style.width=`${imageBox.width*.263}px`;
      buy.style.height=`${imageBox.height*.073}px`;
    };
    image.addEventListener("load",placeBuy);
    window.addEventListener("resize",placeBuy,{passive:true});
    requestAnimationFrame(placeBuy);
  };

  const addProduct=(grid,{id,title,copy,image,price,subject})=>{
    if(!grid||document.getElementById(id)) return;
    const card=document.createElement("article");
    card.className="product nbl-current-card";
    card.id=id;
    const priceMarkup=price?`<span class="nbl-price">${price}</span>`:"";
    card.innerHTML=`<div class="product-media"><img src="${image}" alt="${title}" loading="eager" decoding="async"></div><div class="product-copy"><h3>${title}</h3><p>${copy}</p><div class="actions">${priceMarkup}<a class="request-btn" href="mailto:founder@newbeansland.org?subject=${encodeURIComponent(subject)}">Submit your request</a></div></div>`;
    const img=card.querySelector("img");
    if(img) img.onerror=()=>{img.closest(".product-media")?.remove();};
    grid.appendChild(card);
  };

  const ice=setProductImage("Ice Out","/NBL_Iced_Out_T.png?v=34968ac6","NBL Ice Out T-shirt display");
  setPrice(ice,"$29.99");
  const identity=setProductImage("Identity","/NBL_Identity_T.png?v=0c614ebe","NBL Identity T-shirt display");
  setPrice(identity,"$39.99");
  setProductImage("Black Is Not A Crime","/NBL-Being-Black.png?v=11fc099e","Black Is Not A Crime NBL statement T-shirt");

  document.querySelectorAll(".status").forEach(status=>{
    if(status.closest("#pride")) return;
    if(/made to order|coming soon/i.test(status.textContent||"")) status.remove();
  });

  document.querySelectorAll(".product .request-btn").forEach(button=>{
    button.textContent="Buy Now";
  });

  const adultGrid=document.querySelector("#adult .catalog-grid")||document.querySelector("#statements .catalog-grid");
  addProduct(adultGrid,{
    id:"nbl-signature-hat",
    title:"NBL Signature Trucker Hat",
    copy:"Black NBL Clothing Co. trucker hat with the approved black-and-gold NBL presentation.",
    image:"/NBL_Snapback.png?v=36459168",
    price:"$35",
    subject:"NBL Request - Signature Trucker Hat"
  });

  document.querySelectorAll(".product").forEach(card=>{ if(!card.closest("#pride")) applyBuyArtOverlay(card); });

  const metaDescription=document.querySelector('meta[name="description"]');
  if(metaDescription) metaDescription.content="Explore NBL Clothing Co. from New Beansland™ — adult streetwear, statement shirts, the NBL Pride feature, hats and footwear. NBL Kids has its own dedicated department.";

  const heroCopy=document.querySelector("main .hero .hero-inner > p:not(.kicker)");
  if(heroCopy) heroCopy.textContent="New Beansland™ isn’t just a brand. It’s a world. The adult collection, full shirt lineup, Pride feature, hats and footwear live here. NBL Kids now has its own dedicated department.";

  const firstSectionCopy=document.querySelector("main > .section .section-head p:last-child");
  if(firstSectionCopy) firstSectionCopy.textContent="The current NBL Clothing Co.™ collection is gathered here so the full lineup is visible instead of split across old product art and runtime replacements.";
})();
