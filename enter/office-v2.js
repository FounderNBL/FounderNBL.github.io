import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const $=(id)=>document.getElementById(id);
const game=$("game");
const status=$("status");
const prompt=$("prompt");
const intro=$("intro");
const enterButton=$("enterButton");
const pauseButton=$("pauseButton");
const touchControls=$("touchControls");
const moveStick=$("moveStick");
const moveKnob=$("moveKnob");
const lookStick=$("lookStick");
const lookKnob=$("lookKnob");
const grabButton=$("grabButton");
const useButton=$("useButton");
const portraitHint=$("portraitHint");
const inspector=$("inspector");
const closeInspector=$("closeInspector");
const viewerCanvas=$("viewerCanvas");
const imageStage=$("imageStage");
const artifactImage=$("artifactImage");
const viewerMessage=$("viewerMessage");
const artifactTitle=$("artifactTitle");
const artifactStory=$("artifactStory");
const view3DButton=$("view3DButton");
const viewImageButton=$("viewImageButton");

const coarse=matchMedia("(pointer:coarse)").matches;
const reducedMotion=matchMedia("(prefers-reduced-motion:reduce)").matches;
const loader=new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const textureLoader=new THREE.TextureLoader();

const items={
  desk:{title:"Founder’s Desk",model:"../NBL_Office_Desk.glb",story:"The center of the room. Work, notes, clues, and whatever the Founder is building next pass through here."},
  lamp:{title:"One-Room Light",model:"../NBL_Desk_Lamp.glb",image:"../nbl-office-lamp.png",story:"Use the light when the room is too dark. The lamp changes the feel of the office without blocking anything behind a paywall.",usable:true},
  toy1:{title:"NBL Toy One",model:"../NBL_Model_Toy.glb",story:"One of the two NBL action figures. The toys belong in the room, not on the desk."},
  toy2:{title:"NBL Toy Two",model:"../NBL_Model_Toy_2-optimized.glb",story:"The second NBL action figure. Pick it up and turn it around like any other object in the office."},
  founder:{title:"Jamel Hawkins — Founder",model:"../Founder_Plaque.glb",image:"../founder-nameplate.png",story:"Founder of New Beansland. Builder of the rooms, stories, questions, and systems connected to the world."},
  masters:{title:"Master of Applied Skepticism",model:"../Master_Of_Applied_Skepticism_Certificate-optimized.glb",image:"../founder-masters-degree.png",story:"A Founder academic artifact tied to inquiry, evidence, analogical reasoning, and knowing what room you are in."},
  evidence:{title:"Institute of Evidence-Based Practice",model:"../Institute_Of_Evidence-Based_Practice_Certificate.glb",story:"A New Beansland Institute credential focused on evidence-based practice."},
  clue:{title:"Use a Light",model:"../Use_A_Light_.glb",image:"../desk-clue-plaque.png",story:"If it is too dark, use a light."},
  crest:{title:"New Beansland Crest",model:"../New_Beansland_University_Crest-optimized.glb",image:"../official-nbl-emblem.png",story:"A New Beansland crest used inside the Founder’s Office."},
  banner:{title:"If It Is Is It?",image:"../if-it-is-is-it-banner.png",story:"The question at the center of the room and one of the roots of New Beansland."},
  graduation:{title:"Graduation Remarks",image:"../founder-graduation-remarks.png",story:"The ceremony marks an achievement, but the remarks explain what the achievement is for. Still walking."},
  doctorate:{title:"Doctor of Narrative Architecture",image:"../founder-doctorate-degree.png",story:"A Founder academic artifact tied to narrative architecture, perception, civic imagination, and worldbuilding."},
  family:{title:"The New Beansland Family",image:"../new-beansland-family-photo.png",story:"The New Beansland family accumulated over time. Every member has a place, a role, and a history."},
  yolanda:{title:"For You, Mom — Yolanda",image:"../founders-office-yolanda.png",story:"A family keepsake inside the Founder’s Office."},
  chair:{title:"Founder’s Chair",model:"../New_Beansland_University_Crest-optimized.glb",image:"../official-nbl-emblem.png",story:"The chair is part of the office, but the Founder is still walking."}
};

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x02060b);
scene.fog=new THREE.Fog(0x02060b,11,24);

const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.08,60);
const player={position:new THREE.Vector3(0,1.68,5.4),yaw:0,pitch:0};
camera.position.copy(player.position);
camera.rotation.order="YXZ";

const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio||1,coarse?1.25:1.75));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.02;
renderer.shadowMap.enabled=!coarse;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
game.appendChild(renderer.domElement);

const clock=new THREE.Clock();
const raycaster=new THREE.Raycaster();
const center=new THREE.Vector2(0,0);
const pickMeshes=[];
const roomObjects=new Map();
const targetBox=new THREE.Box3();
const highlight=new THREE.Box3Helper(targetBox,0xf0c56f);
highlight.visible=false;
scene.add(highlight);

let gameStarted=false;
let paused=false;
let currentTarget=null;
let lampLevel=1;
let deskTopY=1.45;
let pointerLocked=false;

const keyboard={forward:false,back:false,left:false,right:false};
const moveAxis=new THREE.Vector2();
const lookAxis=new THREE.Vector2();

function setStatus(text){status.textContent=text;}
function setPrompt(text){prompt.textContent=text;prompt.classList.toggle("show",Boolean(text));}

function material(color,roughness=.72,metalness=.08){
  return new THREE.MeshStandardMaterial({color,roughness,metalness});
}

function makeRoom(){
  const floorMat=material(0x21140e,.92,.02);
  const wallMat=material(0x07111d,.94,.02);
  const wood=material(0x321a0e,.74,.06);
  const brass=material(0x9a6a28,.34,.58);

  const floor=new THREE.Mesh(new THREE.PlaneGeometry(12,12),floorMat);
  floor.rotation.x=-Math.PI/2;
  floor.receiveShadow=true;
  scene.add(floor);

  const rug=new THREE.Mesh(new THREE.PlaneGeometry(8.6,5.4),material(0x07172a,.9,.02));
  rug.rotation.x=-Math.PI/2;
  rug.position.set(0,.012,.6);
  scene.add(rug);

  const back=new THREE.Mesh(new THREE.PlaneGeometry(12,6.2),wallMat);
  back.position.set(0,3.1,-5.1);
  scene.add(back);

  const left=new THREE.Mesh(new THREE.PlaneGeometry(12,6.2),wallMat);
  left.position.set(-6,3.1,.9);
  left.rotation.y=Math.PI/2;
  scene.add(left);

  const right=new THREE.Mesh(new THREE.PlaneGeometry(12,6.2),wallMat);
  right.position.set(6,3.1,.9);
  right.rotation.y=-Math.PI/2;
  scene.add(right);

  const ceiling=new THREE.Mesh(new THREE.PlaneGeometry(12,12),material(0x05080d,.98,0));
  ceiling.position.set(0,6.2,.9);
  ceiling.rotation.x=Math.PI/2;
  scene.add(ceiling);

  for(let x=-4.8;x<=4.8;x+=2.4){
    const trim=new THREE.Mesh(new THREE.BoxGeometry(.08,5.2,.08),wood);
    trim.position.set(x,2.65,-5.02);
    scene.add(trim);
  }
  for(const y of [.55,5.55]){
    const trim=new THREE.Mesh(new THREE.BoxGeometry(11.6,.12,.1),brass);
    trim.position.set(0,y,-5.0);
    scene.add(trim);
  }

  scene.add(new THREE.HemisphereLight(0x74859e,0x160d08,.72));
  const warm=new THREE.DirectionalLight(0xffd7a0,2.0);
  warm.position.set(-2.5,5.8,4);
  scene.add(warm);
  const rim=new THREE.DirectionalLight(0x5f82b2,.85);
  rim.position.set(4,4,-4);
  scene.add(rim);

  for(const x of [-3.8,0,3.8]){
    const light=new THREE.PointLight(0xffcf84,coarse?1.6:2.2,8,2);
    light.position.set(x,5.5,.4);
    scene.add(light);
  }

  buildChair();
}

function buildChair(){
  const group=new THREE.Group();
  const leather=material(0x101216,.82,.02);
  const darkWood=material(0x2b160d,.68,.08);
  const seat=new THREE.Mesh(new THREE.BoxGeometry(1.7,.28,1.5),leather);
  seat.position.set(0,1.05,0);
  const back=new THREE.Mesh(new THREE.BoxGeometry(1.72,2.0,.28),leather);
  back.position.set(0,2.15,-.55);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.42,.54,.18,18),darkWood);
  base.position.set(0,.18,0);
  group.add(seat,back,base);
  group.position.set(0,0,-3.75);
  scene.add(group);
  registerRoot(group,"chair");
  textureLoader.load("../official-nbl-emblem.png",(tex)=>{
    tex.colorSpace=THREE.SRGBColorSpace;
    const crest=new THREE.Mesh(new THREE.PlaneGeometry(.72,.72),new THREE.MeshBasicMaterial({map:tex,transparent:true,toneMapped:false}));
    crest.position.set(0,2.25,-.395);
    group.add(crest);
  });
}

function canvasLabel(lines){
  const canvas=document.createElement("canvas");
  canvas.width=1024;canvas.height=640;
  const ctx=canvas.getContext("2d");
  ctx.fillStyle="#07111d";ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle="#b88636";ctx.lineWidth=16;ctx.strokeRect(24,24,976,592);
  ctx.strokeStyle="#e3bb66";ctx.lineWidth=3;ctx.strokeRect(48,48,928,544);
  ctx.textAlign="center";ctx.fillStyle="#f2d38c";
  ctx.font="700 48px Georgia";
  lines.forEach((line,i)=>ctx.fillText(line,512,250+i*76));
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
  return tex;
}

function createArtifactPlane(id,image,size,position,rotation=[0,0,0]){
  const root=new THREE.Group();
  root.position.set(...position);
  root.rotation.set(...rotation);
  const frame=new THREE.Mesh(new THREE.BoxGeometry(size[0]+.12,size[1]+.12,.08),material(0x936426,.38,.55));
  frame.position.z=-.045;
  root.add(frame);
  const planeMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.58,metalness:.02});
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(size[0],size[1]),planeMat);
  root.add(plane);
  scene.add(root);
  if(image){
    textureLoader.load(image,(tex)=>{
      tex.colorSpace=THREE.SRGBColorSpace;
      tex.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
      planeMat.map=tex;planeMat.needsUpdate=true;
    });
  }else{
    planeMat.map=canvasLabel(["INSTITUTE OF","EVIDENCE-BASED","PRACTICE"]);
    planeMat.needsUpdate=true;
  }
  registerRoot(root,id);
  return root;
}

function registerRoot(root,id){
  root.userData.itemId=id;
  roomObjects.set(id,root);
  root.traverse((child)=>{
    if(!child.isMesh)return;
    child.userData.pickRoot=root;
    pickMeshes.push(child);
  });
}

function normalizeModel(model,target,mode="height"){
  model.updateMatrixWorld(true);
  let box=new THREE.Box3().setFromObject(model);
  const size=new THREE.Vector3();box.getSize(size);
  const basis=mode==="width"?size.x:mode==="depth"?size.z:size.y;
  const scale=target/Math.max(basis,.001);
  model.scale.multiplyScalar(scale);
  model.updateMatrixWorld(true);
  box=new THREE.Box3().setFromObject(model);
  const center3=new THREE.Vector3();box.getCenter(center3);
  model.position.x-=center3.x;
  model.position.z-=center3.z;
  model.position.y-=box.min.y;
  model.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(model);
}

async function loadRoomModel(id,url,{position=[0,0,0],target=1.5,mode="height",rotationY=0}={}){
  try{
    const gltf=await loader.loadAsync(url);
    const model=gltf.scene;
    normalizeModel(model,target,mode);
    const root=new THREE.Group();
    root.add(model);
    root.position.set(...position);
    root.rotation.y=rotationY;
    root.traverse((child)=>{
      if(!child.isMesh)return;
      child.castShadow=!coarse;
      child.receiveShadow=true;
    });
    scene.add(root);
    registerRoot(root,id);
    return root;
  }catch(error){
    console.warn("Founder Office model failed:",id,error);
    return null;
  }
}

async function buildCurrentAssets(){
  setStatus("Loading the current Founder’s Office assets…");
  const desk=await loadRoomModel("desk",items.desk.model,{position:[0,0,-2.25],target:7.5,mode:"width"});
  if(desk){
    const box=new THREE.Box3().setFromObject(desk);
    deskTopY=box.max.y;
  }

  const lamp=await loadRoomModel("lamp",items.lamp.model,{position:[2.25,deskTopY+.02,-2.1],target:1.75,mode:"height"});
  if(lamp)lamp.userData.useAction="lamp";

  createArtifactPlane("banner",items.banner.image,[4.2,1.75],[0,4.05,-5.02]);
  createArtifactPlane("graduation",items.graduation.image,[1.35,2.15],[-4.55,3.05,-5.01]);
  createArtifactPlane("doctorate",items.doctorate.image,[1.25,1.95],[4.65,3.2,-5.01]);
  createArtifactPlane("masters",items.masters.image,[1.25,1.95],[3.18,3.2,-5.0]);
  createArtifactPlane("evidence",null,[1.25,1.95],[-3.08,3.2,-5.0]);

  const tabletopY=deskTopY+.28;
  createArtifactPlane("founder",items.founder.image,[1.55,.48],[-1.65,tabletopY,-1.08],[-.18,0,0]);
  createArtifactPlane("family",items.family.image,[1.1,.72],[-3.15,tabletopY+.2,-1.14],[-.12,.22,0]);
  createArtifactPlane("yolanda",items.yolanda.image,[1.0,.82],[3.48,tabletopY+.22,-1.15],[-.12,-.18,0]);
  createArtifactPlane("clue",items.clue.image,[1.9,.62],[0,.9,-.92]);

  loadRoomModel("toy1",items.toy1.model,{position:[-2.65,0,1.65],target:1.18,mode:"height",rotationY:-.35});
  loadRoomModel("toy2",items.toy2.model,{position:[2.55,0,1.8],target:1.18,mode:"height",rotationY:.42});

  setStatus("Founder’s Office ready. Walk around and grab anything that catches your eye.");
}

makeRoom();
buildCurrentAssets();

function updateCamera(){
  camera.position.copy(player.position);
  camera.rotation.set(player.pitch,player.yaw,0,"YXZ");
}

function validPosition(next){
  if(next.x<-5.35||next.x>5.35||next.z<-4.45||next.z>5.55)return false;
  const inDesk=next.z<-1.0&&next.z>-3.55&&Math.abs(next.x)<4.35;
  return !inDesk;
}

function movePlayer(delta){
  const kbX=(keyboard.right?1:0)-(keyboard.left?1:0);
  const kbY=(keyboard.forward?1:0)-(keyboard.back?1:0);
  const x=THREE.MathUtils.clamp(moveAxis.x+kbX,-1,1);
  const y=THREE.MathUtils.clamp(-moveAxis.y+kbY,-1,1);
  if(Math.abs(x)<.02&&Math.abs(y)<.02)return;
  const input=new THREE.Vector2(x,y);
  if(input.length()>1)input.normalize();
  const forward=new THREE.Vector3(-Math.sin(player.yaw),0,-Math.cos(player.yaw));
  const right=new THREE.Vector3(Math.cos(player.yaw),0,-Math.sin(player.yaw));
  const step=forward.multiplyScalar(input.y*3.0*delta).add(right.multiplyScalar(input.x*3.0*delta));
  const next=player.position.clone().add(step);
  next.y=1.68;
  if(validPosition(next))player.position.copy(next);
}

function updateLook(delta){
  if(!coarse)return;
  player.yaw-=lookAxis.x*1.85*delta;
  player.pitch=THREE.MathUtils.clamp(player.pitch-lookAxis.y*1.45*delta,-1.05,1.05);
}

function updateTarget(){
  if(!gameStarted||paused||!inspector.hidden){
    currentTarget=null;highlight.visible=false;setPrompt("");syncActions();return;
  }
  raycaster.setFromCamera(center,camera);
  const hits=raycaster.intersectObjects(pickMeshes,false);
  const hit=hits.find((entry)=>entry.distance<=4.0);
  const root=hit?.object?.userData?.pickRoot||null;
  if(root!==currentTarget){
    currentTarget=root;
    if(root){
      targetBox.setFromObject(root);
      highlight.visible=true;
      const item=items[root.userData.itemId];
      setPrompt(item?("Grab "+item.title):"Grab object");
    }else{
      highlight.visible=false;setPrompt("");
    }
    syncActions();
  }else if(root){
    targetBox.setFromObject(root);
  }
}

function syncActions(){
  const item=currentTarget?items[currentTarget.userData.itemId]:null;
  grabButton.hidden=!item||!gameStarted||paused||!inspector.hidden;
  useButton.hidden=!(item?.usable)||!gameStarted||paused||!inspector.hidden;
  if(item)grabButton.textContent="GRAB";
  if(item?.usable)useButton.textContent="USE";
}

function useCurrent(){
  const item=currentTarget?items[currentTarget.userData.itemId]:null;
  if(!item?.usable)return;
  lampLevel=(lampLevel+1)%3;
  renderer.toneMappingExposure=[.48,1.02,1.18][lampLevel];
  setStatus(lampLevel===0?"The room settles into the dark.":lampLevel===1?"The one-room light is on.":"The room is fully lit.");
}

let viewState=null;
function cleanupViewer(){
  if(!viewState)return;
  viewState.controls?.dispose();
  viewState.renderer?.dispose();
  viewState=null;
}

function showImage(item){
  cleanupViewer();
  viewerCanvas.hidden=true;
  imageStage.hidden=false;
  viewerMessage.hidden=true;
  artifactImage.src=item.image;
  artifactImage.alt=item.title;
}

async function show3D(item){
  cleanupViewer();
  imageStage.hidden=true;
  viewerCanvas.hidden=false;
  viewerMessage.hidden=false;
  viewerMessage.textContent="Loading 3D object…";
  const viewRenderer=new THREE.WebGLRenderer({canvas:viewerCanvas,antialias:true,alpha:false});
  viewRenderer.outputColorSpace=THREE.SRGBColorSpace;
  viewRenderer.toneMapping=THREE.ACESFilmicToneMapping;
  viewRenderer.toneMappingExposure=1.06;
  viewRenderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
  const viewScene=new THREE.Scene();
  viewScene.background=new THREE.Color(0x06101b);
  const viewCamera=new THREE.PerspectiveCamera(36,1,.01,100);
  viewCamera.position.set(0,.2,4);
  const controls=new OrbitControls(viewCamera,viewerCanvas);
  controls.enableDamping=true;
  controls.enablePan=false;
  controls.autoRotate=!reducedMotion;
  controls.autoRotateSpeed=.75;
  viewScene.add(new THREE.HemisphereLight(0xffe4ac,0x111827,2.4));
  const key=new THREE.DirectionalLight(0xffcf75,3.2);key.position.set(3,5,4);viewScene.add(key);
  const fill=new THREE.DirectionalLight(0x7395c8,1.2);fill.position.set(-4,2,3);viewScene.add(fill);
  const token=Symbol("viewer");
  viewState={renderer:viewRenderer,scene:viewScene,camera:viewCamera,controls,token};

  try{
    const gltf=await loader.loadAsync(item.model);
    if(!viewState||viewState.token!==token)return;
    const model=gltf.scene;
    normalizeModel(model,2.9,"height");
    viewScene.add(model);
    const box=new THREE.Box3().setFromObject(model);
    const size=new THREE.Vector3();box.getSize(size);
    const maxDim=Math.max(size.x,size.y,size.z,.5);
    viewCamera.position.set(0,Math.max(.15,size.y*.05),Math.max(3,maxDim*1.55));
    controls.minDistance=Math.max(.8,maxDim*.6);
    controls.maxDistance=Math.max(8,maxDim*3.4);
    controls.target.set(0,size.y*.08,0);
    controls.update();
    viewerMessage.hidden=true;
  }catch(error){
    console.warn("Inspector model failed",error);
    if(item.image)showImage(item);
    else{
      viewerMessage.hidden=false;
      viewerMessage.textContent="This 3D object could not load.";
    }
    return;
  }

  function renderViewer(){
    if(!viewState||viewState.token!==token||inspector.hidden)return;
    const rect=viewerCanvas.getBoundingClientRect();
    const w=Math.max(1,Math.floor(rect.width));
    const h=Math.max(1,Math.floor(rect.height));
    viewRenderer.setSize(w,h,false);
    viewCamera.aspect=w/h;viewCamera.updateProjectionMatrix();
    controls.update();
    viewRenderer.render(viewScene,viewCamera);
    requestAnimationFrame(renderViewer);
  }
  requestAnimationFrame(renderViewer);
}

function openInspector(){
  const id=currentTarget?.userData?.itemId;
  const item=items[id];
  if(!item)return;
  artifactTitle.dataset.itemId=id;
  if(document.pointerLockElement)document.exitPointerLock();
  artifactTitle.textContent=item.title;
  artifactStory.textContent=item.story||"";
  view3DButton.hidden=!item.model;
  viewImageButton.hidden=!item.image;
  inspector.hidden=false;
  highlight.visible=false;
  setPrompt("");
  syncActions();
  if(item.model)show3D(item);
  else if(item.image)showImage(item);
  else{
    viewerCanvas.hidden=true;imageStage.hidden=true;viewerMessage.hidden=false;viewerMessage.textContent="No inspection view is attached yet.";
  }
}

function closeInspect(){
  inspector.hidden=true;
  cleanupViewer();
  artifactImage.removeAttribute("src");
  setStatus("Back in the office.");
  if(!coarse&&gameStarted&&!paused)renderer.domElement.requestPointerLock?.();
}

function bindStick(stick,knob,axis){
  let pointerId=null;
  function update(event){
    const rect=stick.getBoundingClientRect();
    const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
    let dx=event.clientX-cx,dy=event.clientY-cy;
    const len=Math.hypot(dx,dy);
    const max=Math.max(24,stick.clientWidth*.34);
    if(len>max){dx=dx/len*max;dy=dy/len*max;}
    knob.style.transform="translate("+dx+"px,"+dy+"px)";
    axis.set(dx/max,dy/max);
  }
  function end(event){
    if(pointerId!==null&&event?.pointerId!==pointerId)return;
    pointerId=null;axis.set(0,0);knob.style.transform="translate(0px,0px)";
  }
  stick.addEventListener("pointerdown",(event)=>{pointerId=event.pointerId;stick.setPointerCapture(event.pointerId);update(event);event.preventDefault();});
  stick.addEventListener("pointermove",(event)=>{if(event.pointerId!==pointerId)return;update(event);event.preventDefault();});
  stick.addEventListener("pointerup",end);
  stick.addEventListener("pointercancel",end);
}

bindStick(moveStick,moveKnob,moveAxis);
bindStick(lookStick,lookKnob,lookAxis);

function syncOrientation(){
  const portrait=coarse&&innerHeight>innerWidth;
  portraitHint.hidden=!portrait||!gameStarted;
}
addEventListener("orientationchange",syncOrientation);
addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,coarse?1.25:1.75));
  syncOrientation();
});

document.addEventListener("keydown",(event)=>{
  if(event.code==="KeyW"||event.code==="ArrowUp")keyboard.forward=true;
  if(event.code==="KeyS"||event.code==="ArrowDown")keyboard.back=true;
  if(event.code==="KeyA"||event.code==="ArrowLeft")keyboard.left=true;
  if(event.code==="KeyD"||event.code==="ArrowRight")keyboard.right=true;
  if(event.code==="KeyE"&&inspector.hidden)openInspector();
  if(event.code==="KeyF"&&inspector.hidden)useCurrent();
  if(event.code==="Escape"&&!inspector.hidden)closeInspect();
});
document.addEventListener("keyup",(event)=>{
  if(event.code==="KeyW"||event.code==="ArrowUp")keyboard.forward=false;
  if(event.code==="KeyS"||event.code==="ArrowDown")keyboard.back=false;
  if(event.code==="KeyA"||event.code==="ArrowLeft")keyboard.left=false;
  if(event.code==="KeyD"||event.code==="ArrowRight")keyboard.right=false;
});

renderer.domElement.addEventListener("click",()=>{
  if(coarse||!gameStarted||paused||!inspector.hidden)return;
  if(!document.pointerLockElement)renderer.domElement.requestPointerLock?.();
});
document.addEventListener("pointerlockchange",()=>{pointerLocked=document.pointerLockElement===renderer.domElement;});
document.addEventListener("mousemove",(event)=>{
  if(!pointerLocked||paused||!inspector.hidden)return;
  player.yaw-=event.movementX*.0025;
  player.pitch=THREE.MathUtils.clamp(player.pitch-event.movementY*.0022,-1.05,1.05);
});

enterButton.addEventListener("click",()=>{
  intro.hidden=true;
  gameStarted=true;
  touchControls.hidden=!coarse;
  syncOrientation();
  setStatus("Welcome to the Founder’s Office — the first free game from NBL Games.");
  if(!coarse)renderer.domElement.requestPointerLock?.();
  setTimeout(()=>{if(gameStarted&&!paused)setStatus("Walk around. Point at something and grab it.");},2600);
});
pauseButton.addEventListener("click",()=>{
  paused=!paused;
  pauseButton.textContent=paused?"Resume":"Pause";
  if(paused&&document.pointerLockElement)document.exitPointerLock();
  if(!paused&&!coarse&&gameStarted)renderer.domElement.requestPointerLock?.();
  syncActions();
});
grabButton.addEventListener("pointerdown",(event)=>{event.preventDefault();openInspector();});
useButton.addEventListener("pointerdown",(event)=>{event.preventDefault();useCurrent();});
closeInspector.addEventListener("click",closeInspect);
view3DButton.addEventListener("click",()=>{
  const item=items[artifactTitle.dataset.itemId];
  if(item?.model)show3D(item);
});
viewImageButton.addEventListener("click",()=>{
  const item=items[artifactTitle.dataset.itemId];
  if(item?.image)showImage(item);
});

function animate(){
  requestAnimationFrame(animate);
  const delta=Math.min(clock.getDelta(),.045);
  if(gameStarted&&!paused&&inspector.hidden){
    updateLook(delta);
    movePlayer(delta);
    updateCamera();
    updateTarget();
  }
  renderer.render(scene,camera);
}
updateCamera();
animate();
