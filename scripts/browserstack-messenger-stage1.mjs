// One bounded real BrowserStack Android Chrome visit to LIVE NBL Messenger.
// This is a PUBLIC / SIGNED-OUT device smoke test, not a two-account E2E PASS.
const username=process.env.BROWSERSTACK_USERNAME||"";
const accessKey=process.env.BROWSERSTACK_ACCESS_KEY||"";
if(!username||!accessKey){
  console.error("BROWSERSTACK_BLOCKED: Website repo needs scoped BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY GitHub Actions secrets.");
  process.exit(2);
}
const base="https://hub.browserstack.com/wd/hub";
const auth="Basic "+Buffer.from(username+":"+accessKey).toString("base64");
let session="";
async function wd(method,path,body){
  const response=await fetch(base+path,{
    method,headers:{authorization:auth,"content-type":"application/json"},
    body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(45000)
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok||data.value?.error)throw Error("BrowserStack WebDriver request failed with status "+response.status);
  return data.value||data;
}
async function evaluate(source){
  return await wd("POST","/session/"+session+"/execute/sync",{script:source,args:[]});
}
try{
  const created=await wd("POST","/session",{
    capabilities:{alwaysMatch:{
      browserName:"Chrome",
      "bstack:options":{
        userName:username,accessKey,deviceName:"Samsung Galaxy S23",
        osVersion:"13.0",realMobile:"true",projectName:"New Beansland",
        buildName:"NBL Messenger Stage 1 "+(process.env.GITHUB_RUN_ID||"manual"),
        sessionName:"Messenger public mobile entry and private guest gate",
        debug:true,networkLogs:false
      }
    }}
  });
  session=created.sessionId||"";
  if(!session)throw Error("BrowserStack did not provide a device session.");
  await wd("POST","/session/"+session+"/url",{url:"https://newbeansland.org/messenger/"});
  await new Promise(resolve=>setTimeout(resolve,2500));
  const snapshot=await evaluate(`return (()=>({
    title:document.title,
    heading:document.querySelector('h1')?.textContent||'',
    challenge:!!document.querySelector('#challenge-form,.cf-turnstile')||/just a moment|attention required/i.test(document.title),
    guestVisible:!!document.querySelector('[data-chat-guest]')&&!document.querySelector('[data-chat-guest]').hidden,
    privateChatHidden:!!document.querySelector('[data-chat-app]')?.hidden,
    composerDisabled:!!document.querySelector('[data-chat-compose]')?.disabled,
    stage1Asset:!!document.querySelector('script[src*="20261105-stage1"]'),
    logo:!!document.querySelector('.messenger-heading-mark'),
    viewport:innerWidth,
    mobile:/Android/i.test(navigator.userAgent)
  }))()`);
  if(snapshot.challenge)throw Error("BROWSERSTACK_BLOCKED_CLOUDFLARE: provider saw a challenge, not Messenger.");
  if(!/NBL Messenger/i.test(snapshot.heading)||!snapshot.guestVisible||!snapshot.privateChatHidden||!snapshot.composerDisabled||!snapshot.mobile){
    throw Error("BROWSERSTACK_PUBLIC_MESSENGER_FAIL: "+JSON.stringify(snapshot));
  }
  console.log("PASS: Real Android Chrome opened NBL Messenger, protected private inbox and disabled anonymous send.");
  console.log("STAGE1_UI_DEPLOYED: "+Boolean(snapshot.stage1Asset&&snapshot.logo));
  console.log("TWO_REAL_ACCOUNTS_TESTED: false (needs two authenticated real NBL sessions).");
} catch(error){
  console.error(String(error?.message||error).replaceAll(username,"[redacted]").replaceAll(accessKey,"[redacted]").slice(0,1100));
  process.exitCode=1;
} finally{
  if(session)await wd("DELETE","/session/"+session).catch(()=>{});
}
