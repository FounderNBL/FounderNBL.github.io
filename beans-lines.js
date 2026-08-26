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
    const inFounderOffice = /\/founder-office\.html$/.test(window.location.pathname);

    if (!el) {
      el = document.createElement('div');
      el.id = 'beans-line';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');

      if (inFounderOffice) {
        const room = document.querySelector('.room-stage');
        if (room) {
          el.classList.add('beans-room-line');
          room.appendChild(el);
        } else {
          document.body.appendChild(el);
        }
      } else {
        const host = document.querySelector('main') || document.body;
        host.appendChild(el);
      }
    } else if (inFounderOffice) {
      el.classList.add('beans-room-line');
    }

    if (!document.getElementById('beans-presence-style')) {
      const style = document.createElement('style');
      style.id = 'beans-presence-style';
      style.textContent = `
        /* Beans line – quiet resident comment */
        #beans-line {
          opacity: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-style: italic;
          font-size: 0.95rem;
          line-height: 1.5;
          color: #cfc3ad;
          letter-spacing: 0.01em;
          margin: 1.75rem auto 0;
          max-width: 34rem;
          text-align: center;
          transition: opacity 0.7s ease;
          pointer-events: none;
        }

        #beans-line.visible {
          opacity: 1;
        }

        /* Optional warmer Beans line */
        #beans-line.warm {
          color: #d6c3a0;
        }

        /* Founder’s Office has no normal page flow, so keep Beans inside the room itself. */
        #beans-line.beans-room-line {
          position: absolute;
          z-index: 24;
          left: 50%;
          bottom: 4.5%;
          width: min(82%, 34rem);
          margin: 0;
          transform: translateX(-50%);
          text-shadow: 0 2px 10px rgba(0,0,0,.9);
        }

        .beans-family-profile {
          margin-top: 1.25em;
          padding-top: 1em;
          border-top: 1px solid rgba(215,180,90,.22);
          color: #d9cdb8;
        }

        .beans-family-profile strong {
          color: #ffe6a6;
        }

        @media (max-width: 620px) {
          #beans-line {
            font-size: 0.88rem;
          }

          #beans-line.beans-room-line {
            width: min(88%, 34rem);
            bottom: 5.5%;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return el;
  }

  function showBeans(category, elementId = 'beans-line') {
    const el = document.getElementById(elementId);
    if (!el) return '';

    el.textContent = 'Beans: ' + sayBeans(category);
    el.classList.remove('visible');

    // Force reflow so the fade works every time.
    void el.offsetWidth;

    el.classList.add('visible');
    return el.textContent;
  }

  let lineTimer = null;
  function showBeansLine(category, options = {}) {
    ensureBeansLine();
    window.clearTimeout(lineTimer);
    const text = showBeans(category);
    const duration = Number.isFinite(options.duration) ? options.duration : 4200;

    if (duration > 0) {
      lineTimer = window.setTimeout(() => {
        document.getElementById('beans-line')?.classList.remove('visible');
      }, duration);
    }

    return text;
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
  window.showBeans = showBeans;
  window.showBeansLine = showBeansLine;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installBeansPresence, { once: true });
  } else {
    installBeansPresence();
  }
})();
