// Pulse Live Cloud Run control plane — OFF by default.
// Cloud Run deployment alone never starts a livestream or creates billable channels.
// Switch can be changed only by an authenticated Google Cloud deployment operator.
// No unauthenticated HTTP endpoint is allowed to change the switch.
import http from "node:http";
const enabled=()=>process.env.PULSE_LIVE_ENABLED==="true";
const port=Number(process.env.PORT||8080);
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url||"/","http://localhost").pathname;
 res.setHeader("Content-Type","application/json");
 res.setHeader("Cache-Control","no-store");
 res.setHeader("X-Content-Type-Options","nosniff");
 if(req.method!=="GET"||!["/health","/status"].includes(pathname)){
  res.writeHead(404).end(JSON.stringify({ok:false,reason:"not_found"}));return;
 }
 res.writeHead(200).end(JSON.stringify({ok:true,service:"nbl-pulse-live-control",broadcastingEnabled:enabled(),broadcastingImplemented:false}));
});
server.listen(port,"0.0.0.0");
