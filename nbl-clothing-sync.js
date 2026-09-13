(()=>{
  "use strict";
  if(!/\/clothing(?:\.html)?$/.test(location.pathname||"")) return;

  const style=document.createElement("style");
  style.textContent=`
    .nbl-price{display:inline-block;margin-right:8px;padding:7px 10px;border-radius:999px;background:#f0c56f;color:#120b02;font-size:.78rem;font-weight:900;letter-spacing:.05em}
    .nbl-current-card .product-media{background:linear-gradient(145deg,#050505,#17120a)}
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

  const addProduct=(grid,{id,title,copy,image,price,subject})=>{
    if(!grid||document.getElementById(id)) return;
    const card=document.createElement("article");
    card.className="product nbl-current-card";
    card.id=id;
    card.innerHTML=`<div class="product-media"><img src="${image}" alt="${title}" loading="eager" decoding="async"></div><div class="product-copy"><h3>${title}</h3><p>${copy}</p><div class="actions"><span class="nbl-price">${price}</span><a class="request-btn" href="mailto:founder@newbeansland.org?subject=${encodeURIComponent(subject)}">Submit your request</a></div></div>`;
    const img=card.querySelector("img");
    if(img) img.onerror=()=>{img.closest(".product-media")?.remove();};
    grid.appendChild(card);
  };

  const ice=setProductImage("Ice Out","/NBL_Ice_Out.png?v=b824fe1e","NBL Ice Out T-shirt display");
  setPrice(ice,"$29.99");
  const identity=setProductImage("Identity","/NBL_Identity_T.png?v=d9cc1bb7","NBL Identity T-shirt display");
  setPrice(identity,"$39.99");
  setProductImage("Black Is Not A Crime","/NBL-Being-Black.png?v=11fc099e","Black Is Not A Crime NBL statement T-shirt");

  document.querySelectorAll(".status").forEach(status=>{
    if(status.closest("#footwear")){
      status.textContent="Coming Soon";
      return;
    }
    if(/made to order|coming soon/i.test(status.textContent||"")) status.remove();
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

  const kidsGrid=document.querySelector("#kids .catalog-grid");
  addProduct(kidsGrid,{
    id:"nbl-kids-real-dad",
    title:"I Know My Real Dad",
    copy:"NBL Kids statement T-shirt. Kids sizes XS through XL. Shirt color and word-color choices can be specified with the request.",
    image:"/NBL_Kids_I_Know.png?v=c998a57c",
    price:"$27.99",
    subject:"NBL Kids Request - I Know My Real Dad"
  });
  addProduct(kidsGrid,{
    id:"nbl-kids-my-dad",
    title:"My Dad Collection",
    copy:"NBL Kids statement T-shirt. Kids sizes XS through XL. Shirt color and word-color choices can be specified with the request.",
    image:"/NBL_Kids_My_Dad.png?v=839fd54f",
    price:"$27.99",
    subject:"NBL Kids Request - My Dad Collection"
  });

  const kidsHeading=document.querySelector("#kids .section-head");
  if(kidsHeading&&!kidsHeading.querySelector(".nbl-kids-size-note")){
    const note=document.createElement("p");
    note.className="nbl-kids-size-note";
    note.textContent="Kids sizes: XS, S, M, L, XL · Multiple shirt colors and word colors available.";
    kidsHeading.appendChild(note);
  }

  if(!document.getElementById("pride")){
    const pride=document.createElement("section");
    pride.className="section";
    pride.id="pride";
    pride.innerHTML=`<div class="shell"><div class="section-head"><p class="kicker">NBL Pride Collection</p><h2>Wear your truth. Belong anyway.</h2><p>NBL Pride statement shirts are $39.99 each.</p></div><div class="nbl-pride-shell"><h3>NBL Pride Collection</h3><p>The Pride collection is now part of the NBL Clothing Co. catalog. Final product display art is used only from Founder-approved assets.</p></div></div>`;
    const footwear=document.getElementById("footwear");
    (footwear||document.querySelector("#request")||document.querySelector("main")).before(pride);
    const subnav=document.querySelector(".subnav-inner");
    if(subnav&&!subnav.querySelector('a[href="#pride"]')){
      const chip=document.createElement("a");
      chip.className="chip";
      chip.href="#pride";
      chip.textContent="NBL Pride";
      subnav.insertBefore(chip,subnav.querySelector('a[href="#footwear"]')||null);
    }
  }

  const metaDescription=document.querySelector('meta[name="description"]');
  if(metaDescription) metaDescription.content="Explore NBL Clothing Co. from New Beansland™ — adult streetwear, statement pieces, NBL Kids, NBL Pride, hats and upcoming footwear.";

  const heroCopy=document.querySelector("main .hero .hero-inner > p:not(.kicker)");
  if(heroCopy) heroCopy.textContent="New Beansland™ isn’t just a brand. It’s a world. Adult streetwear, statement pieces, NBL Kids, NBL Pride, hats and footwear — with sneakers still the only Coming Soon category.";

  const firstSectionCopy=document.querySelector("main > .section .section-head p:last-child");
  if(firstSectionCopy) firstSectionCopy.textContent="Current NBL clothing is available by request. Sneakers remain Coming Soon.";
})();
