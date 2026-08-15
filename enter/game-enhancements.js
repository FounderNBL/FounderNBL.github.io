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