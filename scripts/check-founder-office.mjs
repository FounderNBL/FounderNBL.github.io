import {readFile} from "node:fs/promises";
const office=await readFile("founder-office.html","utf8");
const games=await readFile("games.html","utf8");
for(const [name,html] of [["Founder Office",office],["NBL Games",games]]){
 if(!html.includes("Coming Soon") || !html.includes('href="/"') ||
    /<script\b|<iframe\b|<canvas\b|<form\b|https:\/\/block-boss\.|\.glb|GLTFLoader|checkout/i.test(html)){
  throw new Error(name+" must be a static dormant page with no live assets or actions");
 }
}
console.log("PASS: Games and Founder Office are preserved as lightweight static Coming Soon pages.");
