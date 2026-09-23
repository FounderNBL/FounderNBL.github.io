(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = matchMedia('(pointer: coarse)').matches;
  const game = document.getElementById('game');
  const reticle = document.querySelector('.reticle');
  const prompt = document.getElementById('prompt');
  const status = document.getElementById('status');
  const lookPad = document.getElementById('lookPad');
  const touchButtons = [...document.querySelectorAll('.touch-button')];
  const artifactCanvas = document.getElementById('artifactCanvas');
  const artifactStage = document.querySelector('.artifact-stage');
  const artifactStory = document.getElementById('artifactStory');
  const storyButton = document.getElementById('storyButton');
  const resetView = document.getElementById('resetView');
  const inspector = document.getElementById('inspector');
  const inspectorActions = document.querySelector('.inspector-actions');

  const style = document.createElement('style');
  style.textContent = `
    .touch-button,.look-pad,#game canvas{ -webkit-tap-highlight-color:transparent; }
    .touch-button{transition:transform .12s ease,background .12s ease,border-color .12s ease,box-shadow .12s ease}
    .touch-button.is-held{transform:scale(.91);background:rgba(215,180,90,.24);border-color:#ffe39a;box-shadow:inset 0 0 0 2px rgba(255,227,154,.12)}
    .look-pad{position:relative;overflow:hidden;transition:border-color .15s ease,background .15s ease}
    .look-pad.is-looking{border-color:#ffe39a;background:rgba(215,180,90,.16)}
    .look-pad::after{content:'';position:absolute;left:50%;top:50%;width:28px;height:28px;border:1px solid rgba(255,227,154,.75);border-radius:50%;transform:translate(-50%,-50%);opacity:.45;transition:transform .08s linear,opacity .12s ease}
    .look-pad.is-looking::after{opacity:1}
    .reticle.interaction-pulse{animation:nblReticlePulse .32s ease-out}
    .prompt.interaction-pulse{animation:nblPromptPulse .38s ease-out}
    .artifact-stage{perspective:1200px;background:radial-gradient(circle at center,#1a2a44,#030810 72%)}
    #artifactCanvas{transform-style:preserve-3d;transition:box-shadow .2s ease;box-shadow:0 18px 48px rgba(0,0,0,.55),0 0 0 1px rgba(215,180,90,.18)}
    #artifactCanvas.turning{cursor:grabbing;box-shadow:0 28px 64px rgba(0,0,0,.7),0 0 24px rgba(215,180,90,.22)}
    .artifact-stage.holding #artifactCanvas{animation:nblHeldIn .55s cubic-bezier(.22,1,.36,1) both}
    .story{margin-top:18px;padding:16px 14px;border:1px solid rgba(215,180,90,.28);border-radius:12px;background:rgba(2,8,16,.55);color:#fff1c7;font:1.02rem/1.65 Georgia,'Times New Roman',serif}
    .artifact-back-label{color:#ffe39a}
    .inspect-button.turn-active{border-color:#ffe39a;box-shadow:0 0 0 2px rgba(255,227,154,.18) inset}
    @keyframes nblHeldIn{from{opacity:.35;transform:scale(.82) translateY(28px)}to{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes nblReticlePulse{0%{transform:translate(-50%,-50%) scale(1)}45%{transform:translate(-50%,-50%) scale(1.65);border-color:#ffe39a;box-shadow:0 0 22px rgba(255,227,154,.75)}100%{transform:translate(-50%,-50%) scale(1)}}
    @keyframes nblPromptPulse{0%{transform:translateX(-50%) scale(1)}40%{transform:translateX(-50%) scale(1.035);border-color:#ffe39a}100%{transform:translateX(-50%) scale(1)}}
  `;
  document.head.appendChild(style);

  let audioContext;
  function tactile(pattern = 12) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }

  function tone(frequency = 220, duration = 0.045, volume = 0.025) {
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(volume, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch {}
  }

  function pulseInteraction() {
    if (!reducedMotion) {
      reticle?.classList.remove('interaction-pulse');
      prompt?.classList.remove('interaction-pulse');
      void reticle?.offsetWidth;
      reticle?.classList.add('interaction-pulse');
      prompt?.classList.add('interaction-pulse');
    }
    tactile([14, 24, 18]);
    tone(260, 0.065, 0.035);
  }

  touchButtons.forEach((button) => {
    const press = (event) => {
      event.preventDefault();
      button.classList.add('is-held');
      tactile(8);
      tone(150, 0.035, 0.018);
    };
    const release = (event) => {
      event.preventDefault();
      button.classList.remove('is-held');
    };
    button.addEventListener('pointerdown', press, { passive: false });
    button.addEventListener('pointerup', release, { passive: false });
    button.addEventListener('pointercancel', release, { passive: false });
    button.addEventListener('pointerleave', release, { passive: false });
  });

  if (lookPad) {
    let pointerId = null;
    const resetLookVisual = () => {
      pointerId = null;
      lookPad.classList.remove('is-looking');
      lookPad.style.setProperty('--look-x', '0px');
      lookPad.style.setProperty('--look-y', '0px');
      const afterStyle = lookPad.dataset.afterStyle;
      if (afterStyle) lookPad.removeAttribute('data-after-style');
    };

    lookPad.addEventListener('pointerdown', (event) => {
      pointerId = event.pointerId;
      lookPad.classList.add('is-looking');
      tactile(9);
      tone(185, 0.04, 0.02);
    });

    lookPad.addEventListener('pointermove', (event) => {
      if (pointerId !== event.pointerId) return;
      const rect = lookPad.getBoundingClientRect();
      const dx = Math.max(-32, Math.min(32, event.clientX - (rect.left + rect.width / 2)));
      const dy = Math.max(-32, Math.min(32, event.clientY - (rect.top + rect.height / 2)));
      lookPad.style.setProperty('--look-x', `${dx}px`);
      lookPad.style.setProperty('--look-y', `${dy}px`);
    });

    lookPad.addEventListener('pointerup', resetLookVisual);
    lookPad.addEventListener('pointercancel', resetLookVisual);
  }

  game?.addEventListener('pointerup', (event) => {
    if (!coarsePointer || event.target.closest('button,a')) return;
    if (prompt?.classList.contains('show')) pulseInteraction();
  }, true);

  document.addEventListener('click', (event) => {
    const interactiveControl = event.target.closest('.inspect-button,.close-inspector,.enter-button,.hud-button');
    if (!interactiveControl) return;
    tactile(10);
    tone(210, 0.045, 0.022);
  });

  // Make the interaction language match the physical action: pick up, hold, turn, read.
  document.querySelectorAll('.control-note').forEach((note) => {
    if (note.textContent.trim().startsWith('Inspect')) note.innerHTML = '<strong>Pick up</strong>Click, tap, or press E when prompted';
  });
  const inspectorCopy = document.querySelector('.artifact-copy > p:not(.eyebrow)');
  if (inspectorCopy) inspectorCopy.textContent = 'You picked it up. Drag to move it. Turn mode rotates it. Zoom in and read every inscription.';

  function rewriteLiveText(node) {
    if (!node) return;
    let text = node.textContent || '';
    text = text.replace(/^Inspect /, 'Pick up ')
      .replace(/^Approaching /, 'Picking up ')
      .replace(/^Inspecting /, 'You are holding ');
    if (node.textContent !== text) node.textContent = text;
  }

  if (prompt) new MutationObserver(() => rewriteLiveText(prompt)).observe(prompt, { childList: true, characterData: true, subtree: true });
  if (status) new MutationObserver(() => rewriteLiveText(status)).observe(status, { childList: true, characterData: true, subtree: true });

  // The existing game code owns pan/zoom. This layer adds a safe rotation mode without rewriting the core room.
  if (artifactCanvas && inspectorActions) {
    const turnButton = document.createElement('button');
    turnButton.id = 'turnArtifact';
    turnButton.className = 'inspect-button secondary';
    turnButton.type = 'button';
    turnButton.textContent = 'Turn';
    turnButton.setAttribute('aria-pressed', 'false');
    inspectorActions.insertBefore(turnButton, storyButton || null);

    let turnMode = false;
    let turning = false;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startRotY = 0;
    let startRotX = 0;
    let rotY = 0;
    let rotX = 0;
    let applyingTransform = false;

    const stripRotation = (value = '') => value
      .replace(/\s*rotateY\([^)]*\)/g, '')
      .replace(/\s*rotateX\([^)]*\)/g, '')
      .trim();

    function applyRotation() {
      if (applyingTransform) return;
      applyingTransform = true;
      const base = stripRotation(artifactCanvas.style.transform);
      artifactCanvas.style.transform = `${base} rotateY(${rotY}deg) rotateX(${rotX}deg)`.trim();
      applyingTransform = false;
    }

    const styleObserver = new MutationObserver(() => {
      if (!applyingTransform && (rotY || rotX)) applyRotation();
    });
    styleObserver.observe(artifactCanvas, { attributes: true, attributeFilter: ['style'] });

    turnButton.addEventListener('click', () => {
      turnMode = !turnMode;
      turnButton.classList.toggle('turn-active', turnMode);
      turnButton.setAttribute('aria-pressed', String(turnMode));
      turnButton.textContent = turnMode ? 'Turn: on' : 'Turn';
    });

    artifactCanvas.addEventListener('pointerdown', (event) => {
      const forceTurn = turnMode || event.button === 2 || event.button === 1 || event.altKey || event.shiftKey;
      if (!forceTurn) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      turning = true;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      startRotY = rotY;
      startRotX = rotX;
      artifactCanvas.classList.add('turning');
      artifactCanvas.setPointerCapture(event.pointerId);
    }, true);

    artifactCanvas.addEventListener('pointermove', (event) => {
      if (!turning || pointerId !== event.pointerId) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      rotY = startRotY + dx * 0.35;
      rotX = Math.max(-28, Math.min(28, startRotX - dy * 0.28));
      applyRotation();
    }, true);

    const endTurn = (event) => {
      if (!turning || (event && pointerId !== event.pointerId)) return;
      event?.preventDefault();
      event?.stopImmediatePropagation();
      turning = false;
      pointerId = null;
      artifactCanvas.classList.remove('turning');
    };
    artifactCanvas.addEventListener('pointerup', endTurn, true);
    artifactCanvas.addEventListener('pointercancel', endTurn, true);
    artifactCanvas.addEventListener('contextmenu', (event) => event.preventDefault());

    resetView?.addEventListener('click', () => {
      rotY = 0;
      rotX = 0;
      applyRotation();
    });

    if (inspector) {
      new MutationObserver(() => {
        if (inspector.hidden) {
          artifactStage?.classList.remove('holding');
          return;
        }
        artifactStage?.classList.add('holding');
        rotY = 0;
        rotX = 0;
        if (artifactStory) artifactStory.hidden = false;
        if (storyButton) {
          storyButton.hidden = false;
          storyButton.setAttribute('aria-hidden', 'false');
          storyButton.tabIndex = 0;
          storyButton.textContent = 'Hide the story';
        }
      }).observe(inspector, { attributes: true, attributeFilter: ['hidden'] });
    }
  }
})();

// Founder Office real-game layer.
// Uses the free Three.js stack already in this repo. No game API key is required.
(() => {
  const coarse = matchMedia("(pointer: coarse)").matches;
  const inspector = document.getElementById("inspector");
  const titleNode = document.getElementById("artifactTitle");
  const storyNode = document.getElementById("artifactStory");
  const artifactStage = document.querySelector(".artifact-stage");
  const flatCanvas = document.getElementById("artifactCanvas");
  const prompt = document.getElementById("prompt");

  const byTitle = new Map([
    ["Graduation Remarks", { id:"graduation", url:"../assets/3d/models/founder-graduation-remarks.glb", story:"The ceremony marks an achievement, but the remarks explain what the achievement is for. The class continues tomorrow. Still walking." }],
    ["If it is is it?", { id:"banner", url:"../assets/3d/models/founder-question-banner.glb", story:"New Beansland is a creative home for stories, questions, worlds, memory, philosophy, and the paths connecting them." }],
    ["Doctor of Narrative Architecture", { id:"doctorate", url:"../assets/3d/models/founder-doctorate.glb", story:"The degree represents perception, narrative systems, civic imagination, worldbuilding, and the responsibility to build structures strong enough to hold difficult questions." }],
    ["Master of Applied Skepticism", { id:"masters", url:"../assets/3d/models/founder-masters.glb", story:"The supporting degree represents inquiry, evidence, analogical reasoning, category recognition, and knowing what room you are in." }],
    ["The New Beansland Family", { id:"family", url:"../assets/3d/models/founder-family-photo.glb", story:"The family was not assembled. It accumulated. Every member has an origin, a voice, a role, and a place in the world." }],
    ["Jamel Hawkins — Founder", { id:"founder", url:"../assets/3d/models/founder-nameplate.glb", story:"Founder of New Beansland. Builder of stories, questions, worlds, and the rooms connecting them. Still walking." }],
    ["For You, Mom — Yolanda", { id:"yolanda", url:"../assets/3d/models/founder-yolanda.glb", story:"You are my first love, my forever angel, and the reason I am who I am. Everything I do, I do for you." }],
    ["The Desk Clue", { id:"clue", url:"../assets/3d/models/founder-desk-clue.glb", story:"If it is too dark, use a light. The lamp changes the room in three touches." }],
    ["Beanie Bean", { id:"beanie", url:"../Beanie%20Bean_Meshy_AI_2026-09-20_19b948-optimized.glb", story:"A New Beansland toy. Pick it up, turn it around, then put it back where you found it." }],
    ["NBL Model Toy", { id:"nblToy", url:"../NBL_Model_Toy_2-optimized.glb", story:"Another piece from New Beansland. The toys do not need a shelf; they can live wherever the room feels right." }]
  ]);

  const modelById = new Map(Array.from(byTitle.values()).filter((item) => !["beanie","nblToy"].includes(item.id)).map((item) => [item.id,item]));

  let THREE;
  let GLTFLoader;
  let OrbitControls;
  let loader;
  let capturedScene = null;
  let capturedCamera = null;
  let capturedRenderer = null;
  let installedRoom = false;
  let toyTarget = null;
  let toyRoots = [];
  let viewer = null;

  Promise.all([
    import("three"),
    import("three/addons/loaders/GLTFLoader.js"),
    import("three/addons/controls/OrbitControls.js")
  ]).then(([threeModule, loaderModule, controlsModule]) => {
    THREE = threeModule;
    GLTFLoader = loaderModule.GLTFLoader;
    OrbitControls = controlsModule.OrbitControls;
    loader = new GLTFLoader();
    installRenderCapture();
    installInspectorObserver();
    if (coarse) installPhoneControls();
  }).catch((error) => console.warn("Founder Office real-game layer could not start", error));

  function installRenderCapture() {
    const proto = THREE.WebGLRenderer.prototype;
    const previous = proto.render;
    if (previous.__nblFounderRealGame) return;

    function wrapped(scene, camera) {
      capturedScene = scene || capturedScene;
      capturedCamera = camera || capturedCamera;
      capturedRenderer = this || capturedRenderer;
      if (!installedRoom && capturedScene && document.documentElement.dataset.nblRoomContent === "exact-founder-layout") {
        installedRoom = true;
        installRealRoomArtifacts();
      }
      updateToyTarget();
      return previous.call(this, scene, camera);
    }
    wrapped.__nblFounderRealGame = true;
    proto.render = wrapped;
  }

  function findProxy(id) {
    let found = null;
    capturedScene?.traverse((object) => {
      if (!found && object.isMesh && object.userData?.artifactId === id) found = object;
    });
    return found;
  }

  function centerAndScale(object, target) {
    object.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const largest = Math.max(size.x,size.y,size.z,0.001);
    object.scale.multiplyScalar(target / largest);
    object.updateMatrixWorld(true);
    const after = new THREE.Box3().setFromObject(object);
    after.getCenter(center);
    object.position.sub(center);
  }

  async function addModelOnProxy(id, item) {
    const proxy = findProxy(id);
    if (!proxy || !item?.url) return;
    try {
      const gltf = await loader.loadAsync(item.url);
      const model = gltf.scene;
      const proxyBox = new THREE.Box3().setFromObject(proxy);
      const proxySize = new THREE.Vector3();
      proxyBox.getSize(proxySize);
      const target = Math.max(proxySize.x,proxySize.y,0.75) * 0.96;
      centerAndScale(model,target);

      const group = new THREE.Group();
      group.name = "nbl-real-" + id;
      group.add(model);
      proxy.getWorldPosition(group.position);
      proxy.getWorldQuaternion(group.quaternion);
      const nudge = new THREE.Vector3(0,0,0.045).applyQuaternion(group.quaternion);
      group.position.add(nudge);
      group.traverse((child) => {
        if (!child.isMesh) return;
        child.castShadow = !coarse;
        child.receiveShadow = true;
      });
      capturedScene.add(group);

      const materials = Array.isArray(proxy.material) ? proxy.material : [proxy.material];
      materials.forEach((material) => {
        if (!material) return;
        material.transparent = true;
        material.opacity = 0;
        material.colorWrite = false;
        material.depthWrite = false;
        material.needsUpdate = true;
      });
    } catch (error) {
      console.warn("Founder Office 3D artifact failed", id, error);
    }
  }

  async function addToy(id,title,url,story,position,target,rotationY) {
    try {
      const gltf = await loader.loadAsync(url);
      const model = gltf.scene;
      centerAndScale(model,target);
      const group = new THREE.Group();
      group.name = "nbl-floor-toy-" + id;
      group.add(model);
      group.position.set(position[0],position[1],position[2]);
      group.rotation.y = rotationY;
      group.userData.nblToy = { id,title,url,story };
      group.traverse((child) => {
        if (!child.isMesh) return;
        child.userData.nblToyRoot = group;
        child.castShadow = !coarse;
        child.receiveShadow = true;
        toyRoots.push(child);
      });
      capturedScene.add(group);
    } catch (error) {
      console.warn("Founder Office toy failed", id, error);
    }
  }

  async function installRealRoomArtifacts() {
    for (const [id,item] of modelById) {
      await addModelOnProxy(id,item);
    }
    window.setTimeout(() => addToy("beanie","Beanie Bean","../Beanie%20Bean_Meshy_AI_2026-09-20_19b948-optimized.glb","A New Beansland toy. Pick it up, turn it around, then put it back where you found it.",[-1.45,.62,2.05],1.3,-.28),350);
    window.setTimeout(() => addToy("nblToy","NBL Model Toy","../NBL_Model_Toy_2-optimized.glb","Another piece from New Beansland. The toys do not need a shelf; they can live wherever the room feels right.",[1.25,.72,2.35],1.4,.42),950);
  }

  function updateToyTarget() {
    if (!capturedScene || !capturedCamera || !toyRoots.length || !inspector?.hidden) {
      toyTarget = null;
      syncPickupButton();
      return;
    }
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(0,0),capturedCamera);
    const hit = ray.intersectObjects(toyRoots,false).find((entry) => entry.distance <= 4.2);
    toyTarget = hit?.object?.userData?.nblToyRoot?.userData?.nblToy || null;
    if (toyTarget && prompt) {
      prompt.textContent = "Pick up " + toyTarget.title;
      prompt.classList.add("show");
    }
    syncPickupButton();
  }

  function ensureViewer() {
    if (viewer || !artifactStage) return viewer;
    const shell = document.createElement("div");
    shell.className = "nbl-real-artifact-viewer";
    shell.hidden = true;
    const canvas = document.createElement("canvas");
    shell.appendChild(canvas);
    artifactStage.appendChild(shell);
    viewer = { shell, canvas, renderer:null, scene:null, camera:null, controls:null, token:0 };
    return viewer;
  }

  function disposeViewer() {
    if (!viewer) return;
    viewer.token += 1;
    viewer.controls?.dispose?.();
    viewer.scene?.traverse?.((object) => {
      if (!object.isMesh) return;
      object.geometry?.dispose?.();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => material?.dispose?.());
    });
    viewer.renderer?.dispose?.();
    viewer.renderer = viewer.scene = viewer.camera = viewer.controls = null;
    viewer.shell.hidden = true;
    if (flatCanvas) flatCanvas.style.visibility = "";
  }

  async function showRealInspector(item) {
    if (!item?.url || !artifactStage || !THREE) return;
    const state = ensureViewer();
    disposeViewer();
    state.shell.hidden = false;
    if (flatCanvas) flatCanvas.style.visibility = "hidden";
    const token = ++state.token;

    const renderer = new THREE.WebGLRenderer({ canvas:state.canvas, antialias:true, alpha:false });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1,1.5));
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06101b);
    const camera = new THREE.PerspectiveCamera(36,1,.01,100);
    camera.position.set(0,.25,4.5);
    const controls = new OrbitControls(camera,state.canvas);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.autoRotate = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    controls.autoRotateSpeed = .9;
    scene.add(new THREE.HemisphereLight(0xffe6ad,0x101622,2));
    const key = new THREE.DirectionalLight(0xffd27a,3);
    key.position.set(3.2,5.2,4.5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x6f8fc1,1.1);
    fill.position.set(-4,2.4,3);
    scene.add(fill);
    state.renderer=renderer; state.scene=scene; state.camera=camera; state.controls=controls;

    try {
      const gltf = await loader.loadAsync(item.url);
      if (token !== state.token || inspector.hidden) return;
      const object = gltf.scene;
      centerAndScale(object,2.8);
      scene.add(object);
      const box = new THREE.Box3().setFromObject(object);
      const size = new THREE.Vector3();
      box.getSize(size);
      const largest = Math.max(size.x,size.y,size.z,.2);
      const distance = Math.max(2.5,largest*1.65);
      camera.position.set(0,Math.max(.15,size.y*.06),distance);
      controls.minDistance = Math.max(.7,distance*.32);
      controls.maxDistance = distance*2.5;
      controls.update();
    } catch (error) {
      console.warn("Founder Office inspector model failed",error);
      disposeViewer();
      return;
    }

    const draw = () => {
      if (!viewer || token !== viewer.token || inspector.hidden || viewer.shell.hidden) return;
      const rect = viewer.shell.getBoundingClientRect();
      const width = Math.max(1,Math.floor(rect.width));
      const height = Math.max(1,Math.floor(rect.height));
      renderer.setSize(width,height,false);
      camera.aspect = width/height;
      camera.updateProjectionMatrix();
      controls.update();
      renderer.render(scene,camera);
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  function updateInspectorFromTitle() {
    if (!inspector || inspector.hidden) {
      disposeViewer();
      return;
    }
    const item = byTitle.get(titleNode?.textContent?.trim());
    if (item) showRealInspector(item);
    else disposeViewer();
  }

  function installInspectorObserver() {
    if (!inspector || !titleNode) return;
    new MutationObserver(updateInspectorFromTitle).observe(titleNode,{childList:true,subtree:true,characterData:true});
    new MutationObserver(updateInspectorFromTitle).observe(inspector,{attributes:true,attributeFilter:["hidden"]});
  }

  function openToyInspector(toy) {
    if (!toy || !inspector || !titleNode || !storyNode) return;
    document.exitPointerLock?.();
    titleNode.textContent = toy.title;
    storyNode.textContent = toy.story;
    storyNode.hidden = false;
    inspector.hidden = false;
    showRealInspector(toy);
  }

  let pickupButton = null;
  function syncPickupButton() {
    if (!pickupButton) return;
    const hasRegular = prompt?.classList.contains("show") && (prompt.textContent || "").trim();
    const show = Boolean(toyTarget || hasRegular);
    pickupButton.hidden = !show;
    if (!show) return;
    pickupButton.disabled = /waiting for the light|locked/i.test(prompt?.textContent || "");
    pickupButton.textContent = toyTarget ? "PICK UP" : /light/i.test(prompt?.textContent || "") ? "LIGHT" : "PICK UP";
  }

  function installPhoneControls() {
    const hud = document.querySelector(".hud");
    if (!hud) return;
    const old = document.querySelector(".mobile-controls");
    if (old) {
      old.style.display = "none";
      old.setAttribute("aria-hidden","true");
    }

    const overlay = document.createElement("div");
    overlay.className = "nbl-game-touch";
    overlay.innerHTML = '<div class="nbl-move-stick" aria-label="Move"><div class="nbl-move-knob"></div></div><div class="nbl-look-zone" aria-label="Drag to look"></div><button class="nbl-pickup-button" type="button" hidden>PICK UP</button>';
    hud.appendChild(overlay);
    const stick = overlay.querySelector(".nbl-move-stick");
    const knob = overlay.querySelector(".nbl-move-knob");
    const look = overlay.querySelector(".nbl-look-zone");
    pickupButton = overlay.querySelector(".nbl-pickup-button");

    const keyState = new Map();
    function setKey(code,on) {
      if (keyState.get(code) === on) return;
      keyState.set(code,on);
      document.dispatchEvent(new KeyboardEvent(on ? "keydown" : "keyup",{code,bubbles:true}));
    }
    function releaseKeys() {
      ["KeyW","KeyA","KeyS","KeyD"].forEach((code) => setKey(code,false));
    }

    let stickPointer = null;
    const radius = 38;
    const moveStick = (event) => {
      const rect = stick.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;
      let dx = event.clientX-cx;
      let dy = event.clientY-cy;
      const distance = Math.hypot(dx,dy);
      if (distance > radius) { dx = dx/distance*radius; dy = dy/distance*radius; }
      knob.style.transform = "translate("+dx+"px,"+dy+"px)";
      const nx = dx/radius, ny = dy/radius;
      setKey("KeyA",nx < -.28); setKey("KeyD",nx > .28);
      setKey("KeyW",ny < -.28); setKey("KeyS",ny > .28);
    };
    const endStick = (event) => {
      if (stickPointer !== null && event?.pointerId !== stickPointer) return;
      stickPointer=null; knob.style.transform="translate(0px,0px)"; releaseKeys();
    };
    stick.addEventListener("pointerdown",(event)=>{stickPointer=event.pointerId;stick.setPointerCapture(event.pointerId);moveStick(event);event.preventDefault();});
    stick.addEventListener("pointermove",(event)=>{if(event.pointerId!==stickPointer)return;moveStick(event);event.preventDefault();});
    stick.addEventListener("pointerup",endStick); stick.addEventListener("pointercancel",endStick);

    let lookPointer=null,lookX=0,lookY=0;
    look.addEventListener("pointerdown",(event)=>{lookPointer=event.pointerId;lookX=event.clientX;lookY=event.clientY;look.setPointerCapture(event.pointerId);event.preventDefault();});
    look.addEventListener("pointermove",(event)=>{
      if(event.pointerId!==lookPointer || !capturedCamera || !inspector?.hidden)return;
      const dx=event.clientX-lookX,dy=event.clientY-lookY; lookX=event.clientX;lookY=event.clientY;
      capturedCamera.rotation.order="YXZ";
      capturedCamera.rotation.y-=dx*.0046;
      capturedCamera.rotation.x=THREE.MathUtils.clamp(capturedCamera.rotation.x-dy*.0038,-1.08,1.08);
      event.preventDefault();
    });
    const endLook=(event)=>{if(event.pointerId===lookPointer)lookPointer=null;};
    look.addEventListener("pointerup",endLook);look.addEventListener("pointercancel",endLook);

    pickupButton.addEventListener("pointerdown",(event)=>{
      event.preventDefault(); event.stopPropagation();
      if (toyTarget) openToyInspector(toyTarget);
      else document.dispatchEvent(new KeyboardEvent("keydown",{code:"KeyE",bubbles:true}));
    });

    new MutationObserver(syncPickupButton).observe(prompt,{attributes:true,childList:true,subtree:true,characterData:true});
    syncPickupButton();

    document.addEventListener("keydown",(event)=>{
      if (event.code !== "KeyE" || !toyTarget || !inspector?.hidden) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openToyInspector(toyTarget);
    },true);
  }
})();
