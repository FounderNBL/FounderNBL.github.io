(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = matchMedia('(pointer: coarse)').matches;
  const game = document.getElementById('game');
  const reticle = document.querySelector('.reticle');
  const prompt = document.getElementById('prompt');
  const lookPad = document.getElementById('lookPad');
  const touchButtons = [...document.querySelectorAll('.touch-button')];

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
})();
