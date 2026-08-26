// Beans is a resident. These are things he says when he notices something.
(() => {
  'use strict';

  const BeansProfile = {
    name: 'Beans',
    title: 'Old Town Companion',
    description: 'Beans has been here longer than most of the rooms. He keeps the porch light on, notices what people forget, and usually says the thing no one asked for but everyone needed to hear.',
    familyLine: 'Keeps the porch open. Notices what gets left behind. Usually says the quiet thing out loud.'
  };

  const Beans = {
    leaveFoundersOffice: [
      'Most people turn the light out before they leave.',
      'He’ll still be here when you come back.',
      'The door doesn’t lock behind you.',
      'You can leave the light on if you want. He doesn’t mind.'
    ],

    enterFoundersOffice: [
      'He keeps coming back. That’s usually how it starts.',
      'The chair is still warm.',
      'Take your time. The room doesn’t rush.'
    ],

    enterBooks: [
      'You don’t have to buy it to know if it belongs to you.',
      'Some of these were finished before the rooms had names.',
      'The covers are just the first thing that looks back.'
    ],

    leaveBooks: [
      'You can always come back for the rest.',
      'They’ll still be here.'
    ],

    stayTooLong: [
      'You can stay. Just don’t pretend you’re not staying.',
      'The porch light is still on.'
    ],

    general: [
      'The door still works either way.',
      'Most people only notice the quiet after they leave.'
    ]
  };

  function sayBeans(category) {
    const lines = Beans[category] || Beans.general;
    return lines[Math.floor(Math.random() * lines.length)];
  }

  function ensureBeansLine() {
    let el = document.getElementById('beans-line');
    if (!el) {
      el = document.createElement('div');
      el.id = 'beans-line';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }

    if (!document.getElementById('beans-presence-style')) {
      const style = document.createElement('style');
      style.id = 'beans-presence-style';
      style.textContent = `
        #beans-line {
          position: fixed;
          z-index: 80;
          left: 50%;
          bottom: max(22px, calc(env(safe-area-inset-bottom) + 16px));
          transform: translate(-50%, 8px);
          width: min(88vw, 680px);
          margin: 0;
          color: #cfc3ad;
          font: italic 0.9rem/1.45 Georgia, 'Times New Roman', serif;
          text-align: center;
          text-shadow: 0 2px 10px rgba(0,0,0,.9);
          opacity: 0;
          pointer-events: none;
          transition: opacity .6s ease, transform .6s ease;
        }
        #beans-line.beans-visible {
          opacity: .92;
          transform: translate(-50%, 0);
        }
        .beans-family-profile {
          margin-top: 1.25em;
          padding-top: 1em;
          border-top: 1px solid rgba(215,180,90,.22);
          color: #d9cdb8;
        }
        .beans-family-profile strong { color: #ffe6a6; }
        @media (max-width: 620px) {
          #beans-line { bottom: max(16px, calc(env(safe-area-inset-bottom) + 12px)); font-size: .84rem; }
        }
      `;
      document.head.appendChild(style);
    }

    return el;
  }

  let lineTimer = null;
  function showBeansLine(category, options = {}) {
    const el = ensureBeansLine();
    window.clearTimeout(lineTimer);
    el.textContent = 'Beans: ' + sayBeans(category);
    el.classList.add('beans-visible');
    const duration = Number.isFinite(options.duration) ? options.duration : 4200;
    if (duration > 0) {
      lineTimer = window.setTimeout(() => el.classList.remove('beans-visible'), duration);
    }
    return el.textContent;
  }

  function installFamilyProfile() {
    const hotspot = document.querySelector('[data-panel="family"]');
    if (!hotspot) return;

    hotspot.addEventListener('click', () => {
      window.setTimeout(() => {
        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        if (!modalBody || !modalTitle) return;
        if (!/Who Walks With Me/i.test(modalTitle.textContent || '')) return;
        if (modalBody.querySelector('[data-beans-profile]')) return;

        const profile = document.createElement('p');
        profile.className = 'beans-family-profile';
        profile.dataset.beansProfile = 'true';
        profile.innerHTML = `<strong>${BeansProfile.name}</strong><br>${BeansProfile.title}<br>${BeansProfile.familyLine}`;
        modalBody.appendChild(profile);
      }, 0);
    });
  }

  function interceptQuietExits(selector, category) {
    document.querySelectorAll(selector).forEach(link => {
      link.addEventListener('click', event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (link.target === '_blank' || link.hasAttribute('download')) return;

        let destination;
        try { destination = new URL(link.href, window.location.href); } catch { return; }
        if (destination.origin !== window.location.origin) return;

        event.preventDefault();
        event.stopImmediatePropagation();
        showBeansLine(category, { duration: 0 });
        window.setTimeout(() => window.location.assign(destination.href), 900);
      }, true);
    });
  }

  function interceptBookExit() {
    document.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link || !link.href) return;
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;

      let destination;
      try { destination = new URL(link.href, window.location.href); } catch { return; }
      if (destination.origin !== window.location.origin) return;
      const samePage = destination.pathname === window.location.pathname && destination.search === window.location.search;
      if (samePage) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      showBeansLine('leaveBooks', { duration: 0 });
      window.setTimeout(() => window.location.assign(destination.href), 850);
    }, true);
  }

  function showFounderOfficeEntry() {
    showBeansLine('enterFoundersOffice');
  }

  function installBeansPresence() {
    const path = window.location.pathname;

    if (/\/founder-office\.html$/.test(path)) {
      ensureBeansLine();
      installFamilyProfile();
      interceptQuietExits('a[href="index.html"], a[href="home.html"]', 'leaveFoundersOffice');
      if (document.readyState === 'complete') {
        showFounderOfficeEntry();
      } else {
        window.addEventListener('load', showFounderOfficeEntry, { once: true });
      }
      window.setTimeout(() => showBeansLine('stayTooLong'), 90000);
      return;
    }

    if (/\/books\.html$/.test(path)) {
      ensureBeansLine();
      interceptBookExit();
      window.setTimeout(() => showBeansLine('enterBooks'), 1200);
      window.setTimeout(() => showBeansLine('stayTooLong'), 90000);
    }
  }

  window.Beans = Beans;
  window.BeansProfile = BeansProfile;
  window.sayBeans = sayBeans;
  window.showBeansLine = showBeansLine;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installBeansPresence, { once: true });
  } else {
    installBeansPresence();
  }
})();
