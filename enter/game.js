import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

const $=(id)=>document.getElementById(id);
const game=$("game"),intro=$("intro"),enterButton=$("enterButton"),pauseButton=$("pauseButton"),prompt=$("prompt"),status=$("status"),inspector=$("inspector"),closeInspector=$("closeInspector"),artifactTitle=$("artifactTitle"),artifactStory=$("artifactStory"),storyButton=$("storyButton"),artifactCanvas=$("artifactCanvas"),zoomIn=$("zoomIn"),zoomOut=$("zoomOut"),resetView=$("resetView"),lookPad=$("lookPad");
const ctx=artifactCanvas.getContext("2d");

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x03070d);
scene.fog=new THREE.FogExp2(0x02050a,.035);
const camera=new THREE.PerspectiveCamera(64,innerWidth/innerHeight,.1,100);
camera.position.set(0,1.72,6.7);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
game.appendChild(renderer.domElement);
const controls=new PointerLockControls(camera,renderer.domElement);
scene.add(camera);

const clock=new THREE.Clock(),raycaster=new THREE.Raycaster(),center=new THREE.Vector2(0,0),velocity=new THREE.Vector3(),direction=new THREE.Vector3(),interactive=[];
const move={forward:false,back:false,left:false,right:false};
let currentHit=null,gameStarted=false,lampState=0,chairUnlocked=false;

const artifacts={
 graduation:{title:"Graduation Remarks",crop:[.055,.13,.15,.39],story:"The ceremony marks an achievement, but the remarks explain what the achievement is for. The class continues tomorrow. Still walking."},
 banner:{title:"If it is is it?",crop:[.355,.135,.30,.22],story:"New Beansland is a creative home for stories, questions, worlds, memory, philosophy, and the paths connecting them."},
 doctorate:{title:"Doctor of Narrative Architecture",crop:[.81,.14,.10,.25],story:"The degree represents perception, narrative systems, civic imagination, worldbuilding, and the responsibility to build structures strong enough to hold difficult questions."},
 masters:{title:"Master of Applied Skepticism",crop:[.90,.12,.085,.28],story:"The supporting degree represents inquiry, evidence, analogical reasoning, category recognition, and knowing what room you are in."},
 family:{title:"The New Beansland Family",crop:[.215,.51,.12,.14],story:"The family was not assembled. It accumulated. Every member has an origin, a voice, a role, and a place in the world."},
 founder:{title:"Jamel Hawkins — Founder",crop:[.345,.58,.14,.075],story:"Founder of New Beansland. Builder of stories, questions, worlds, and the rooms connecting them. Still walking."},
 yolanda:{title:"For You, Mom — Yolanda",crop:[.68,.50,.13,.18],story:"You are my first love, my forever angel, and the reason I am who I am. Everything I do, I do for you."},
 clue:{title:"The Desk Clue",crop:[.43,.74,.16,.105],story:"If it is too dark, use a light. The lamp changes the room in three touches."},
 chair:{title:"The Empty Chair",crop:[.42,.39,.16,.24],story:"The chair is empty because the Founder is still walking, still building, and still moving through New Beansland."}
};

const roomImage=new Image();
roomImage.src="../founder-office-room.png";
const roomTexture=new THREE.TextureLoader().load("../founder-office-room.png");
roomTexture.colorSpace=THREE.SRGBColorSpace;

function mat(color,roughness=.72,metalness=.08){return new THREE.MeshStandardMaterial({color,roughness,metalness})}
function box(name,size,pos,color,opts={}){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(color,opts.roughness,opts.metalness));mesh.name=name;mesh.position.set(...pos);mesh.castShadow=opts.castShadow!==false;mesh.receiveShadow=opts.receiveShadow!==false;scene.add(mesh);return mesh}
function cropTexture(crop){const t=roomTexture.clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.repeat.set(crop[2],crop[3]);t.offset.set(crop[0],1-crop[1]-crop[3]);return t}
function artifactPlane(id,size,pos,rotationY=0){const data=artifacts[id];const frame=box(`${id}-frame`,[size[0]+.15,size[1]+.15,.12],[pos[0],pos[1],pos[2]+.03],0x8b6127,{roughness:.38,metalness:.45});frame.rotation.y=rotationY;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(size[0],size[1]),new THREE.MeshStandardMaterial({map:cropTexture(data.crop),roughness:.62}));mesh.position.set(...pos);mesh.rotation.y=rotationY;mesh.userData.artifactId=id;mesh.userData.prompt=`Inspect ${data.title}`;scene.add(mesh);interactive.push(mesh);return mesh}

const floor=new THREE.Mesh(new THREE.PlaneGeometry(18,14),mat(0x25170f,.9));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
const rug=new THREE.Mesh(new THREE.PlaneGeometry(10.5,6.4),mat(0x071325,.88));rug.rotation.x=-Math.PI/2;rug.position.set(0,.012,1.5);rug.receiveShadow=true;scene.add(rug);
box("back-wall",[14,6,.35],[0,3,-4.5],0x101722,{castShadow:false});box("left-wall",[.35,6,11],[-7,3,.8],0x17120f,{castShadow:false});box("right-wall",[.35,6,11],[7,3,.8],0x17120f,{castShadow:false});box("ceiling",[14,.3,11],[0,6,.8],0x100b08,{castShadow:false});
for(let x=-6.1;x<=6.1;x+=2.05)box("wall-trim",[.08,5.5,.18],[x,2.75,-4.28],0x4a2b18,{castShadow:false});
box("wall-top",[13.2,.12,.18],[0,5.45,-4.28],0x6b3d1d,{castShadow:false});box("wall-bottom",[13.2,.12,.18],[0,.48,-4.28],0x6b3d1d,{castShadow:false});
box("desk",[8.7,1.25,2.2],[0,.72,-.5],0x3a2011,{roughness:.58});box("desk-top",[9.2,.18,2.45],[0,1.43,-.5],0x5a3219,{roughness:.48});box("chair-seat",[1.7,.32,1.4],[0,1.1,-2],0x151211,{roughness:.84});
const chairBack=box("chair-back",[1.75,2.25,.35],[0,2.3,-2.45],0x151211,{roughness:.84});chairBack.userData.artifactId="chair";chairBack.userData.prompt="The chair is waiting for the light";interactive.push(chairBack);
scene.add(new THREE.HemisphereLight(0xb8c9e2,0x28160d,.45));
const keyLight=new THREE.SpotLight(0xffd58c,32,14,Math.PI/4.5,.55,1.4);keyLight.position.set(3.1,4.6,-.5);keyLight.target.position.set(.8,1.3,-1.4);keyLight.castShadow=true;keyLight.visible=false;scene.add(keyLight,keyLight.target);
[[-4.8,5.65,1.8],[0,5.65,1.8],[4.8,5.65,1.8]].forEach(([x,y,z])=>{const l=new THREE.PointLight(0xffd7a2,6,8,2);l.position.set(x,y,z);scene.add(l)});
artifactPlane("graduation",[1.25,2.2],[-5.25,3.15,-4.29]);artifactPlane("banner",[4.15,1.75],[0,3.75,-4.29]);artifactPlane("doctorate",[1.35,2.05],[4.6,3.25,-4.29]);artifactPlane("masters",[1.35,2.05],[6.05,3.25,-4.29]);artifactPlane("family",[1.55,1],[-3.3,2,-1.67]);artifactPlane("founder",[2.05,.55],[-1.4,1.82,-1.67]);artifactPlane("yolanda",[1.55,1.25],[3.35,2.05,-1.67]);artifactPlane("clue",[2.3,.75],[0,.86,.63],Math.PI);
const lampBase=box("lamp-base",[.75,.18,.75],[2.1,1.61,-1.2],0x9a6e2d,{roughness:.35,metalness:.7});const lampStem=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,2.4,18),mat(0xb18438,.3,.72));lampStem.position.set(2.1,2.82,-1.2);lampStem.castShadow=true;scene.add(lampStem);const lampShade=new THREE.Mesh(new THREE.ConeGeometry(.58,.78,24,1,true),mat(0x071325,.55,.18));lampShade.position.set(2.1,3.62,-1.2);lampShade.rotation.x=Math.PI;scene.add(lampShade);[lampBase,lampShade].forEach(o=>{o.userData.action="lamp";o.userData.prompt="Touch the one-room light";interactive.push(o)});

function showPrompt(text){prompt.textContent=text;prompt.classList.toggle("show",Boolean(text))}
function updateLamp(){lampState=(lampState+1)%3;keyLight.visible=lampState>0;keyLight.intensity=lampState===1?16:lampState===2?38:0;chairUnlocked=lampState===2;chairBack.userData.prompt=chairUnlocked?"Inspect the empty chair":"The chair is waiting for the light";status.textContent=lampState===1?"The room is waking. Touch the light again.":lampState===2?"The walk is lit. The chair is ready.":"The room returns to rest."}

let scale=1,offsetX=0,offsetY=0,dragging=false,dragStart={x:0,y:0};
function applyArtifact(){artifactCanvas.style.transform=`translate(${offsetX}px,${offsetY}px) scale(${scale})`}
function resetArtifact(){scale=1;offsetX=0;offsetY=0;applyArtifact()}
function drawArtifact(id){const d=artifacts[id];if(!d||!roomImage.complete)return;const[x,y,w,h]=d.crop,sx=x*roomImage.naturalWidth,sy=y*roomImage.naturalHeight,sw=w*roomImage.naturalWidth,sh=h*roomImage.naturalHeight;artifactCanvas.width=Math.max(720,Math.round(sw*2));artifactCanvas.height=Math.max(520,Math.round(sh*2));ctx.clearRect(0,0,artifactCanvas.width,artifactCanvas.height);ctx.drawImage(roomImage,sx,sy,sw,sh,0,0,artifactCanvas.width,artifactCanvas.height);resetArtifact()}
function openInspector(id){if(id==="chair"&&!chairUnlocked){status.textContent="The chair is locked. The clue points to the light.";return}const d=artifacts[id];if(!d)return;artifactTitle.textContent=d.title;artifactStory.textContent=d.story;artifactStory.hidden=true;storyButton.textContent="Learn its story";drawArtifact(id);inspector.hidden=false;controls.unlock();closeInspector.focus()}
function closeArtifact(){inspector.hidden=true;if(gameStarted&&matchMedia("(pointer:fine)").matches)controls.lock()}
function interact(){if(!currentHit)return;const o=currentHit.object;if(o.userData.action==="lamp")updateLamp();else if(o.userData.artifactId)openInspector(o.userData.artifactId)}
function updateTarget(){raycaster.setFromCamera(center,camera);const hits=raycaster.intersectObjects(interactive,false);currentHit=hits.find(h=>h.distance<=4.2)||null;showPrompt(currentHit?`${currentHit.object.userData.prompt} · Click / Tap / E`:"")}
function clampPlayer(){camera.position.x=THREE.MathUtils.clamp(camera.position.x,-5.8,5.8);camera.position.z=THREE.MathUtils.clamp(camera.position.z,-3.15,5.4);camera.position.y=1.72;if(camera.position.z<1.4&&Math.abs(camera.position.x)<4.9)camera.position.z=1.4}
function animate(){requestAnimationFrame(animate);const delta=Math.min(clock.getDelta(),.05);if(gameStarted&&inspector.hidden){velocity.x-=velocity.x*10*delta;velocity.z-=velocity.z*10*delta;direction.z=Number(move.forward)-Number(move.back);direction.x=Number(move.right)-Number(move.left);direction.normalize();const speed=4.25;if(move.forward||move.back)velocity.z-=direction.z*speed*delta;if(move.left||move.right)velocity.x-=direction.x*speed*delta;controls.moveRight(-velocity.x);controls.moveForward(-velocity.z);clampPlayer();updateTarget()}renderer.render(scene,camera)}
function setMove(code,value){if(code==="KeyW"||code==="ArrowUp")move.forward=value;if(code==="KeyS"||code==="ArrowDown")move.back=value;if(code==="KeyA"||code==="ArrowLeft")move.left=value;if(code==="KeyD"||code==="ArrowRight")move.right=value}
document.addEventListener("keydown",e=>{setMove(e.code,true);if(e.code==="KeyE"&&inspector.hidden)interact();if(e.code==="Escape"&&!inspector.hidden)closeArtifact()});document.addEventListener("keyup",e=>setMove(e.code,false));
renderer.domElement.addEventListener("click",()=>{if(!gameStarted||!inspector.hidden)return;if(currentHit)interact();else if(matchMedia("(pointer:fine)").matches&&!controls.isLocked)controls.lock()});
enterButton.addEventListener("click",()=>{intro.hidden=true;gameStarted=true;status.textContent="Find the light. Look closely.";if(matchMedia("(pointer:fine)").matches)controls.lock()});pauseButton.addEventListener("click",()=>{if(!gameStarted)return;controls.isLocked?controls.unlock():matchMedia("(pointer:fine)").matches&&controls.lock()});closeInspector.addEventListener("click",closeArtifact);inspector.addEventListener("click",e=>{if(e.target===inspector)closeArtifact()});storyButton.addEventListener("click",()=>{artifactStory.hidden=!artifactStory.hidden;storyButton.textContent=artifactStory.hidden?"Learn its story":"Hide the story"});zoomIn.addEventListener("click",()=>{scale=Math.min(scale+.25,3.5);applyArtifact()});zoomOut.addEventListener("click",()=>{scale=Math.max(scale-.25,.65);applyArtifact()});resetView.addEventListener("click",resetArtifact);
artifactCanvas.addEventListener("pointerdown",e=>{dragging=true;dragStart={x:e.clientX-offsetX,y:e.clientY-offsetY};artifactCanvas.classList.add("dragging");artifactCanvas.setPointerCapture(e.pointerId)});artifactCanvas.addEventListener("pointermove",e=>{if(!dragging)return;offsetX=e.clientX-dragStart.x;offsetY=e.clientY-dragStart.y;applyArtifact()});artifactCanvas.addEventListener("pointerup",e=>{dragging=false;artifactCanvas.classList.remove("dragging");artifactCanvas.releasePointerCapture(e.pointerId)});artifactCanvas.addEventListener("wheel",e=>{e.preventDefault();scale=THREE.MathUtils.clamp(scale+(e.deltaY<0?.16:-.16),.65,3.5);applyArtifact()},{passive:false});
document.querySelectorAll("[data-move]").forEach(button=>{const key=button.dataset.move,start=e=>{e.preventDefault();move[key]=true},stop=e=>{e.preventDefault();move[key]=false};button.addEventListener("pointerdown",start);button.addEventListener("pointerup",stop);button.addEventListener("pointercancel",stop);button.addEventListener("pointerleave",stop)});
let lookPointer=null;lookPad.addEventListener("pointerdown",e=>{lookPointer={id:e.pointerId,x:e.clientX,y:e.clientY};lookPad.setPointerCapture(e.pointerId)});lookPad.addEventListener("pointermove",e=>{if(!lookPointer||lookPointer.id!==e.pointerId)return;const dx=e.clientX-lookPointer.x,dy=e.clientY-lookPointer.y;lookPointer.x=e.clientX;lookPointer.y=e.clientY;camera.rotation.order="YXZ";camera.rotation.y-=dx*.006;camera.rotation.x=THREE.MathUtils.clamp(camera.rotation.x-dy*.005,-1.2,1.2)});lookPad.addEventListener("pointerup",e=>{if(lookPointer&&lookPointer.id===e.pointerId)lookPointer=null});
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.75))});roomImage.addEventListener("error",()=>status.textContent="The room loaded, but an inspection image could not be prepared.");
animate();