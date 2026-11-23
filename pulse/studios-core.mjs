// Pulse Studios — pure, offline editing rules. No API calls, billing, or uploads.
export const IMAGE_TYPES = new Set(["image/jpeg","image/png","image/webp"]);
export const VIDEO_TYPES = new Set(["video/mp4","video/webm"]);
export const AUDIO_TYPES = new Set(["audio/mpeg","audio/mp3","audio/wav","audio/x-wav","audio/ogg","audio/webm","audio/mp4"]);
export const STUDIO_LIMITS = Object.freeze({imageBytes: 24*1024*1024,videoBytes:40*1024*1024,audioBytes:40*1024*1024,maxDimension: 2048,profileBytes:5*1024*1024,postImageBytes:8*1024*1024,postVideoBytes:40*1024*1024,maxVideoSeconds:60,maxAudioSeconds:300});
export const FORMATS = Object.freeze({square:[1,1],"portrait":[4,5],"landscape":[16,9],"story":[9,16]});
export function aspectFor(preset,width,height){
  if(preset==="original")return [Math.max(1,width),Math.max(1,height)];
  return FORMATS[preset]||FORMATS.square;
}
export function outputSize(ratio,limit=1080){
  const [a,b]=ratio, scale=Math.min(1,limit/Math.max(a,b)), w=Math.max(1,Math.round(a*scale)), h=Math.max(1,Math.round(b*scale));
  return {width:w,height:h};
}
export function coverGeometry(srcWidth,srcHeight,destWidth,destHeight,{rotation=0,zoom=1,panX=0,panY=0}={}){
  const rotated=(((rotation%180)+180)%180)!==0;
  const w=rotated?srcHeight:srcWidth,h=rotated?srcWidth:srcHeight;
  if(![w,h,destWidth,destHeight].every(x=>Number.isFinite(x)&&x>0))throw Error("Invalid image dimensions.");
  const scale=Math.max(destWidth/w,destHeight/h)*Math.max(1,Math.min(3,Number(zoom)||1));
  const spillX=Math.max(0,(w*scale-destWidth)/2),spillY=Math.max(0,(h*scale-destHeight)/2);
  return {scale,shiftX:Math.max(-spillX,Math.min(spillX,((Number(panX)||0)/100)*spillX)),shiftY:Math.max(-spillY,Math.min(spillY,((Number(panY)||0)/100)*spillY))};
}
export function validateLocalFile(file,types,bytes){
  if(!file||!types.has(file.type)||file.size<1||file.size>bytes)throw Error("Choose a supported local file within the displayed size limit.");
  return true;
}
export function makeWav(buffer){
  const channels=Math.min(2,buffer.numberOfChannels),samples=buffer.length;
  const bytes=new ArrayBuffer(44+samples*channels*2),view=new DataView(bytes);
  const ascii=(offset,string)=>{for(let i=0;i<string.length;i++)view.setUint8(offset+i,string.charCodeAt(i));};
  ascii(0,"RIFF");view.setUint32(4,bytes.byteLength-8,true);ascii(8,"WAVE");ascii(12,"fmt ");
  view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,channels,true);
  view.setUint32(24,buffer.sampleRate,true);view.setUint32(28,buffer.sampleRate*channels*2,true);
  view.setUint16(32,channels*2,true);view.setUint16(34,16,true);ascii(36,"data");view.setUint32(40,samples*channels*2,true);
  const ch=Array.from({length:channels},(_,i)=>buffer.getChannelData(i));
  for(let i=0;i<samples;i++)for(let c=0;c<channels;c++){
    const v=Math.max(-1,Math.min(1,ch[c][i]||0));view.setInt16(44+(i*channels+c)*2,v<0?v*32768:v*32767,true);
  }
  return new Blob([bytes],{type:"audio/wav"});
}
export function fileToInput(input,file){
  if(!input || typeof DataTransfer!=="function")throw Error("This browser cannot attach an edited file; use Download instead.");
  const transfer=new DataTransfer();transfer.items.add(file);
  input.files=transfer.files;
  input.dispatchEvent(new Event("change",{bubbles:true}));
}
