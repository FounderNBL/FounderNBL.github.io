// Opt-in local copy of an ALREADY generated Studio result. This never submits a generation
// or charges a user. It fetches only trusted signed NBL output URLs on a user click.
const MAX_IMAGE=24*1024*1024,MAX_VIDEO=100*1024*1024;
async function detectType(blob){
  const bytes=new Uint8Array(await blob.slice(0,16).arrayBuffer());
  const ascii=(start,len)=>String.fromCharCode(...bytes.slice(start,start+len));
  if(bytes.length>=8&&[137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b))return "image/png";
  if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return "image/jpeg";
  if(bytes.length>=12&&ascii(0,4)==="RIFF"&&ascii(8,4)==="WEBP")return "image/webp";
  if(bytes.length>=8&&ascii(4,4)==="ftyp")return "video/mp4";
  if(bytes.length>=4&&[26,69,223,163].every((b,i)=>bytes[i]===b))return "video/webm";
  return "";
}
export function attachGeneratedSave(container,anchor,outputUrl,kind){
  if(!container?.contains(anchor)||!["image","video"].includes(kind))return;
  const button=document.createElement("button");button.type="button";
  button.textContent=kind==="image"?"Save image to Still library":"Save video to Still library";
  button.style.margin="8px 6px 8px 0";
  const status=document.createElement("span");status.setAttribute("role","status");status.setAttribute("aria-live","polite");
  status.style.display="block";
  container.append(button,status);
  button.addEventListener("click",async()=>{
    if(!container.contains(anchor)||button.disabled)return;
    button.disabled=true;status.textContent="Copying this existing result to your local Still library...";
    try{
      const u=new URL(outputUrl);
      if(u.protocol!=="https:"||!["tvypdakofcrlvnwporhh.supabase.co","newbeansland.org"].includes(u.hostname)
        ||(u.hostname==="tvypdakofcrlvnwporhh.supabase.co"&&!u.pathname.startsWith("/storage/v1/object/")))
        throw Error("This provider's output cannot be imported directly. Use Open / save and import the downloaded file in Still.");
      const res=await fetch(u.href,{method:"GET",credentials:"omit",mode:"cors",cache:"no-store"});
      if(!res.ok)throw Error("This temporary output link may have expired. Refresh the job download first.");
      const cap=kind==="image"?MAX_IMAGE:MAX_VIDEO;
      if(Number(res.headers.get("Content-Length")||0)>cap)throw Error("Generated file is too large for the local Still library.");
      const file=await res.blob();
      if(file.size<1||file.size>cap)throw Error("Generated file is empty or exceeds Still's local storage limit.");
      const type=await detectType(file);
      if(kind==="image"&&!type.startsWith("image/")||kind==="video"&&!type.startsWith("video/"))
        throw Error("The provider returned a format Still cannot store. Download and convert it before importing.");
      const ext=type==="image/jpeg"?"jpg":type.split("/")[1];
      const {saveStillMedia}=await import("/studio/still-media-library.mjs");
      await saveStillMedia(file,{name:"still-generated-"+Date.now()+"."+ext});
      status.textContent="Saved in this browser's Still library. Nothing was generated again or published.";
      const a=document.createElement("a");a.href="/still.html#still-local-heading";
      a.target="_blank";a.rel="noopener noreferrer";a.textContent="Open Still library";
      container.append(a);
    }catch(err){
      status.textContent="Could not copy into Still: "+(err?.message||"The output might not allow browser downloads.")+" Use Open / save above, then Import in Still library.";
      button.disabled=false;
    }
  });
}
