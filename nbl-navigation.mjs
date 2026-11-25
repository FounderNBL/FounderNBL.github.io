// Free cross-device provider handoffs; no geolocation, storage, network API, or billing.
export function navigationLinks({destination,origin="",mode="driving"}={}){
 const clean=v=>typeof v==="string"?v.trim().slice(0,300):"";
 const dest=clean(destination),start=clean(origin);
 if(!dest)return null;
 const travel=["driving","walking","bicycling","transit"].includes(mode)?mode:"driving";
 const maps=new URL("https://www.google.com/maps/dir/");maps.searchParams.set("api","1");maps.searchParams.set("destination",dest);maps.searchParams.set("travelmode",travel);if(start)maps.searchParams.set("origin",start);else if(travel==="driving")maps.searchParams.set("dir_action","navigate");
 const search=new URL("https://www.google.com/maps/search/");search.searchParams.set("api","1");search.searchParams.set("query",dest);
 const waze=new URL("https://waze.com/ul");waze.searchParams.set("q",dest);waze.searchParams.set("navigate","yes");waze.searchParams.set("utm_source","newbeansland");
 return {maps:maps.href,search:search.href,waze:travel==="driving"&&!start?waze.href:null};
}
if(typeof document!=="undefined"){
 const $=id=>document.getElementById(id);
 const update=()=>{
  const links=navigationLinks({destination:$("destination").value,origin:$("origin").value,mode:$("mode").value});
  for(const key of ["maps","search","waze"]){const a=$(key),href=links?.[key];if(href){a.href=href;a.removeAttribute("aria-disabled");}else{a.removeAttribute("href");a.setAttribute("aria-disabled","true");}a.hidden=key==="waze"&&($("mode").value!=="driving"||!!$("origin").value.trim());}
  $("status").textContent=links? "Choose your provider. Directions and traffic are shown there, not calculated by Beans.": "Enter a destination to continue.";
 };
 for(const id of ["destination","origin","mode"]){$(id).addEventListener("input",update);$(id).addEventListener("change",update);}
 update();
}
