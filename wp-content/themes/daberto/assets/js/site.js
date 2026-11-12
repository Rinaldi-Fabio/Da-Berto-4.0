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

 // Stile Pepe — slider: one photo at a time, dots + pause button (WCAG 2.2.2); no autoplay with reduced motion.
 document.querySelectorAll('.pepe-slider').forEach(slider => {
  const slides = [...slider.querySelectorAll('.pepe-slide')];
  if (slides.length < 2) return;
  let current = 0, timer = 0, paused = reduce.matches;
  const nav = document.createElement('div');
  nav.className = 'slider-nav';
  const show = n => {
   current = n;
   slides.forEach((s, k) => { s.classList.toggle('is-active', k === n); s.inert = k !== n; });
   dots.forEach((d, k) => d.setAttribute('aria-current', k === n ? 'true' : 'false'));
  };
  const restart = () => {
   clearInterval(timer);
   if (!paused) timer = setInterval(() => show((current + 1) % slides.length), 5000);
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
})();
