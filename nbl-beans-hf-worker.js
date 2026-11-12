// Website-only NBL model research worker. No backend, credentials, or autonomous actions.
// CodeGen and Pythia are BASE models; completions are unverified, not Beans' identity.
const MODELS=Object.freeze({
  codegen350:"Xenova/codegen-350M-mono",
  pythia410:"Xenova/pythia-410m"
});
let generator=null;
let loadedKey="";
self.onmessage=async event=>{
  const message=event.data||{};
  if(message.type!=="generate")return;
  const key=String(message.key||"");
  const model=MODELS[key];
  const prompt=String(message.prompt||"").trim().slice(0,1000);
  if(!model||!prompt){
    self.postMessage({type:"error",message:"Choose a model and enter a prompt."});
    return;
  }
  try{
    if(!generator||loadedKey!==key){
      if(generator?.dispose){
        try{await generator.dispose();}catch{}
      }
      generator=null;
      loadedKey="";
      self.postMessage({type:"status",message:"Loading public model files. This can download 400–440 MB to this device."});
      // Pinned upstream library; download occurs only after the visitor presses Run.
      const {pipeline}=await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2");
      generator=await pipeline("text-generation",model,{
        dtype:"q4",
        progress_callback:progress=>{
          if(!progress||typeof progress!=="object")return;
          if(progress.status==="progress"&&Number.isFinite(progress.progress)){
            self.postMessage({type:"progress",progress:Math.max(0,Math.min(100,progress.progress))});
          }else if(progress.status==="ready"){
            self.postMessage({type:"status",message:"Model files loaded."});
          }
        }
      });
      loadedKey=key;
    }
    self.postMessage({type:"status",message:"Generating locally. No NBL model API credits used."});
    const rows=await generator(prompt,{
      max_new_tokens:48,
      do_sample:false,
      return_full_text:false
    });
    const result=Array.isArray(rows)?rows[0]:rows;
    const completion=typeof result?.generated_text==="string"?result.generated_text:"";
    self.postMessage({type:"result",key,model,text:completion.slice(0,4000)});
  }catch(error){
    generator=null;
    loadedKey="";
    self.postMessage({type:"error",message:error instanceof Error?error.message:"The local model could not run."});
  }
};