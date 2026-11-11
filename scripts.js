'use strict';

(() => {
  const root = document.documentElement;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };

  /* Theme: the inline script in <head> sets the initial value; this wires the button. */
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    const sync = () => themeBtn.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
    sync();
    themeBtn.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      store.set('theme', root.dataset.theme);
      sync();
    });
  }

  /* Mobile menu */
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  if (menuBtn && nav) {
    const setOpen = (open) => {
      nav.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    };
    menuBtn.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  }

  /* Current section in the nav */
  const links = [...document.querySelectorAll('#nav a[href^="#"]')];
  const targets = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && targets.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(a => {
          if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    targets.forEach(t => io.observe(t));
  }

  /* Publication filter */
  const filters = document.getElementById('pubFilters');
  if (filters) {
    filters.hidden = false;
    const items = [...document.querySelectorAll('.pubs > li')];
    const years = [...document.querySelectorAll('.year')];
    const count = document.getElementById('pubCount');
    const tmpl = count ? count.dataset.template : '';
    const apply = (topic) => {
      let n = 0;
      items.forEach(li => {
        const show = topic === 'all' || li.dataset.topics.split(' ').includes(topic);
        li.hidden = !show;
        if (show) n++;
      });
      years.forEach(y => { y.hidden = !y.querySelector('.pubs > li:not([hidden])'); });
      if (count) count.textContent = tmpl.replace('{n}', n);
      filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.topic === topic)));
    };
    filters.addEventListener('click', e => {
      const b = e.target.closest('button[data-topic]');
      if (b) apply(b.dataset.topic);
    });
    apply('all');
  }

  /* Sample field: a grid of "training samples"; most leak little, a few leak a lot. */
  const field = document.getElementById('sampleField');
  if (field) {
    let seed = 424242;
    const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const draw = () => {
      const w = field.clientWidth;
      const cell = w < 520 ? 9 : 11;
      const cols = Math.max(24, Math.floor((w + 3) / (cell + 3)));
      const rows = w < 520 ? 7 : 6;
      seed = 424242; rand(); rand();
      field.style.setProperty('--cols', cols);
      const n = cols * rows;
      const vulnerable = new Set();
      const k = Math.max(6, Math.round(n * 0.022));
      while (vulnerable.size < k) {
        const i = Math.floor(rand() * n);
        if (i % cols !== 0) vulnerable.add(i);   // keep the first column quiet so no cell reads as a bullet
      }
      const frag = document.createDocumentFragment();
      for (let i = 0; i < n; i++) {
        const el = document.createElement('i');
        if (vulnerable.has(i)) el.className = 'v';
        else if (rand() < 0.09) el.className = 'm';
        frag.appendChild(el);
      }
      field.replaceChildren(frag);
      field.dataset.cols = cols;
    };
    draw();

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const light = () => {
      const vs = [...field.querySelectorAll('i.v')];
      if (reduce) { field.classList.add('lit'); return; }
      vs.forEach((el, k) => { el.style.transitionDelay = (300 + k * 90) + 'ms'; });
      requestAnimationFrame(() => requestAnimationFrame(() => field.classList.add('lit')));
    };
    light();

    let lastW = field.clientWidth;
    let t;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (field.clientWidth === lastW) return;
        lastW = field.clientWidth;
        draw();
        field.classList.add('lit');
      }, 150);
    });
  }
})();
