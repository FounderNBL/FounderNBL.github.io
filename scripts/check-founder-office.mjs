import {readFile,stat} from "node:fs/promises";

const html=await readFile("founder-office.html","utf8");
const errors=[];
const must=(v,label)=>{if(!v)errors.push(label)};
const yes=v=>html.includes(v);

must(yes('<main class="office-reading">'),"Office must remain a readable page");
must(yes('src="founder-office-room.png"'),"Approved Founder Office room picture missing");
must(yes('class="reading-grid"'),"Reading item grid missing");
must(yes('href="/games.html"'),"Museum/game Coming Soon must remain under NBL Games");
must(yes("3D Museum &amp; Games · Coming Soon"),"3D game must be marked Coming Soon");
for(const key of ["founder","banner","graduation","doctorate","masters","yolanda","family","chair","desk","light"]){
 must(yes('id="read-'+key+'"'),"Missing clickable Office story: "+key);
}
must((html.match(/<details class="reading-card"/g)||[]).length===10,"Office must have exactly ten accessible reading cards");
must((html.match(/<summary aria-label="Read /g)||[]).length===10,"Every reading card must have a keyboard-accessible summary");
for(const value of ["GLTFLoader","<model-viewer",".glb","officeCanvas","pointermove","floor-figure","setLampState","data-action=\"lamp\"","data-panel=","class=\"hotspot\"","<canvas","babylon.js"]){
 must(!yes(value),"Retired 3D/game interaction found: "+value);
}
must(yes('<script defer src="/nbl-portal.js"></script>'),"NBL portal integration missing");
must(yes('<script defer src="/nbl-world-header.js?v=20261004-shopify"></script>'),"Shared Beans and website header missing");
must(yes("foundernewbeansland@gmail.com"),"Founder contact was lost");
for(const path of ["founder-office-room.png","founder-nameplate.png","if-it-is-is-it-banner.png","founder-doctorate-degree.png","founder-masters-degree.png","founder-graduation-remarks.png","yolanda-family-keepsake.png","new-beansland-family-photo.png","desk-clue-plaque.png","nbl-office-lamp.png"]){
 try{const a=await stat(path);must(a.isFile()&&a.size>0,"Office image is empty: "+path);}catch{errors.push("Office image is missing: "+path)}
}
if(errors.length){console.error(errors.map(x=>"- "+x).join("\n"));process.exit(1);}
console.log("PASS: Founder Office uses image-backed clickable reading cards; game/GLB/puzzle UI absent; NBL header and approved images preserved.");
