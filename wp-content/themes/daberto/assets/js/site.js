/* Il contenuto resta visibile: si anima soltanto la tinta sopra la foto. */
(() => {
 document.documentElement.classList.add('has-site-js');
 const scrolled = () => document.documentElement.classList.toggle('is-scrolled', scrollY > 40);
 addEventListener('scroll', scrolled, { passive: true });
 scrolled();
 const reduce = matchMedia('(prefers-reduced-motion: reduce)');
 const bar = document.querySelector('.mobile-bar');
 const actions = document.querySelector('.hero .actions');
 if ('IntersectionObserver' in window) {
  if (bar && actions) {
   bar.hidden = true; // Start hidden: the opening's own buttons are on screen at load.
   new IntersectionObserver(([entry]) => {
    bar.hidden = entry.isIntersecting;
   }, { threshold: 0 }).observe(actions);
  }
  if (!reduce.matches) {
   const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
     if (entry.isIntersecting) {
      entry.target.classList.add('luce-enter');
      observer.unobserve(entry.target);
     }
    });
   }, { threshold: .12 });
   document.querySelectorAll('.is-style-luce').forEach(photo => observer.observe(photo));
  }
 }
 document.addEventListener('keydown', event => {
  if (event.key === 'Tab') document.documentElement.classList.add('keyboard');
 });
 document.addEventListener('pointerdown', () => document.documentElement.classList.remove('keyboard'));

 // Stile Pepe — slider: one photo at a time, autoplay + pause button (WCAG 2.2.2).
 // Dots jump to a photo and restart the timer; with reduced motion the photos swap without animation (CSS).
 document.querySelectorAll('.pepe-slider').forEach(slider => {
  const slides = [...slider.querySelectorAll('.pepe-slide')];
  if (slides.length < 2) return;
  let current = 0, timer = 0, paused = false;
  const nav = document.createElement('div');
  nav.className = 'slider-nav';
  // Decode every photo up front, so the first fade does not stutter on a 2500 px image.
  slides.forEach(s => { const img = s.querySelector('img'); if (img) { img.loading = 'eager'; img.decode?.().catch(() => {}); } });
  const show = n => {
   slides.forEach((s, k) => {
    s.classList.toggle('is-prev', k === current && k !== n); // stays opaque under the incoming photo
    s.classList.toggle('is-active', k === n);
    s.inert = k !== n;
   });
   current = n;
   dots.forEach((d, k) => d.setAttribute('aria-current', k === n ? 'true' : 'false'));
  };
  const restart = () => {
   clearInterval(timer);
   if (!paused) timer = setInterval(() => show((current + 1) % slides.length), 4000);
   pause.setAttribute('aria-label', paused ? 'Avvia le foto' : 'Ferma le foto');
   pause.classList.toggle('is-paused', paused);
  };
  const dots = slides.map((_, n) => {
   const b = document.createElement('button');
   b.type = 'button';
   b.setAttribute('aria-label', `Foto ${n + 1} di ${slides.length}`);
   b.addEventListener('click', () => { show(n); restart(); });
   nav.append(b);
   return b;
  });
  const pause = document.createElement('button');
  pause.type = 'button';
  pause.className = 'slider-pause';
  pause.addEventListener('click', () => { paused = !paused; restart(); });
  nav.append(pause);
  slider.append(nav);
  slider.classList.add('is-ready');
  show(0);
  restart();
 });

 // Stile Pepe — pizza carousel: keyboard-scrollable region + prev/next arrows (hidden when everything fits).
 document.querySelectorAll('.pizze-track').forEach(track => {
  track.tabIndex = 0;
  track.setAttribute('role', 'region');
  track.setAttribute('aria-label', 'Pizze in evidenza');
  const head = track.closest('section')?.querySelector('.pizze-head');
  if (!head) return;
  const box = document.createElement('div');
  box.className = 'pizze-frecce';
  const step = () => (track.querySelector('.pizza-card')?.offsetWidth || 300) + 24;
  const arrows = [['freccia-indietro', 'Pizza precedente', -1], ['freccia-avanti', 'Pizza successiva', 1]].map(([cls, label, dir]) => {
   const b = document.createElement('button');
   b.type = 'button';
   b.className = cls;
   b.setAttribute('aria-label', label);
   b.addEventListener('click', () => track.scrollBy({ left: dir * step(), behavior: reduce.matches ? 'auto' : 'smooth' }));
   box.append(b);
   return b;
  });
  const sync = () => {
   box.hidden = track.scrollWidth <= track.clientWidth + 2;
   arrows[0].disabled = track.scrollLeft <= 2;
   arrows[1].disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  };
  track.addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', sync);
  head.append(box);
  sync();
 });

 // Stile Pepe — Menu a sottomenu, like pepeingrani.it/menu: chapters → sections → dishes, one view at a time.
 // The page stays the full carta (editor, search engines, no-JS); the URL hash picks the view, so the browser's
 // back button, Home links (/menu/#birre) and the table QR (/menu/#carta → first level) all keep working.
 const carta = document.querySelector('.carta');
 const chapters = carta ? [...carta.querySelectorAll('.carta-chapter[id]')] : [];
 if (chapters.length) {
  const heading = el => el.querySelector(':scope > h2, :scope > h3');
  const sections = ch => [...ch.querySelectorAll(':scope > section[id]')];
  const el = (tag, cls, text) => Object.assign(document.createElement(tag), { className: cls, textContent: text || '' });
  const link = (cls, id, text) => Object.assign(el('a', cls, text), { href: '#' + id });
  const bar = (back, title) => {
   const b = el('div', 'dd-barra');
   // First level: "Menu" is the page's h2 (keeps the heading order h1 → h2 → h3). Deeper levels repeat the
   // section's own h2/h3, which stays in the page for screen readers, so their copy is hidden from them.
   const t = el(back ? 'span' : 'h2', 'dd-titolo', title);
   if (back) t.setAttribute('aria-hidden', 'true');
   b.append(back ? link('dd-indietro', back, 'Indietro') : el('span', 'dd-marchio', 'Pizzeria Da Berto'), t);
   return b;
  };
  const list = (label, back, title, items) => {
   const nav = el('nav', 'dd-lista');
   nav.setAttribute('aria-label', label);
   nav.append(bar(back, title), ...items.map(x => link('dd-riga', x.id, heading(x)?.textContent.trim())));
   return nav;
  };
  const root = list('Sezioni del menu', '', 'Menu', chapters);
  root.id = 'sezioni';
  chapters[0].before(root);
  chapters.forEach(ch => {
   heading(ch)?.after(list(heading(ch).textContent.trim(), 'sezioni', heading(ch).textContent.trim(), sections(ch)));
   sections(ch).forEach(s => s.prepend(bar(ch.id, heading(s)?.textContent.trim())));
  });
  carta.classList.add('dd');

  const render = scroll => {
   const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
   const ch = target?.closest('.carta-chapter') || null;
   const sec = ch && target !== ch ? target.closest('.carta-chapter > section[id]') : null;
   carta.dataset.vista = sec ? 'sezione' : ch ? 'capitolo' : 'radice';
   chapters.forEach(c => {
    c.classList.toggle('is-aperto', c === ch);
    sections(c).forEach(s => s.classList.toggle('is-aperto', s === sec));
   });
   const view = sec || ch || root;
   view.classList.remove('dd-entra');
   void view.offsetWidth; // restart the fade-in
   view.classList.add('dd-entra');
   if (!scroll || location.hash === '#carta') return; // #carta: the browser already scrolled to "Come la vuoi?"
   view.scrollIntoView({ block: 'start' });
   const h = heading(view);
   if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  };
  addEventListener('hashchange', () => render(true));
  render(location.hash !== '' && location.hash !== '#carta');
 }
})();
