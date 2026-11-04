// ldz-canvas · interazioni leggere, nessuna dipendenza esterna
const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- tema chiaro / scuro ---------- */
const themeBtn = document.getElementById('themeToggle');
const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', (e) => {
  let saved = null;
  try { saved = localStorage.getItem('ldz-theme'); } catch (err) { /* */ }
  if (!saved) root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
});
themeBtn?.addEventListener('click', () => {
  const current = root.getAttribute('data-theme') || (systemDark() ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('ldz-theme', next); } catch (e) { /* storage non disponibile */ }
});

/* ---------- menu mobile ---------- */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(open));
});
navLinks?.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  })
);

/* ---------- scroll: barra di avanzamento, nav, cavo timeline ---------- */
const nav = document.getElementById('nav');
const progress = document.getElementById('scrollProgress');
const timeline = document.getElementById('timeline');
const cableFill = document.getElementById('cableFill');
const nodes = [...document.querySelectorAll('[data-node]')];

function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const y = scrollY;
  if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  nav?.classList.toggle('is-scrolled', y > 8);

  if (timeline && cableFill) {
    // il "cavo" si carica fino al punto della timeline che ha raggiunto il 60% della viewport
    const r = timeline.getBoundingClientRect();
    const probe = innerHeight * 0.6;
    const fill = Math.min(1, Math.max(0, (probe - r.top) / r.height));
    cableFill.parentElement.style.setProperty('--fill', fill.toFixed(3));
    cableFill.style.setProperty('--fill', fill.toFixed(3));
    nodes.forEach((n) => {
      const nr = n.getBoundingClientRect();
      n.classList.toggle('is-lit', nr.top + 30 < probe);
    });
  }
}
let ticking = false;
addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(() => { onScroll(); ticking = false; }); ticking = true; }
}, { passive: true });
addEventListener('resize', onScroll);
onScroll();

/* ---------- comparsa progressiva + contatori + indicatori ---------- */
function countUp(el) {
  const target = parseFloat(el.dataset.count);
  if (!isFinite(target) || reduced) return;
  const start = target > 1000 ? target - 12 : 0;   // gli anni "scorrono" solo per pochi valori
  const t0 = performance.now();
  const dur = 1100;
  const step = (t) => {
    const k = Math.min(1, (t - t0) / dur);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = Math.round(start + (target - start) * e);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('is-in');
      el.querySelectorAll('[data-count]').forEach(countUp);
      el.querySelectorAll('.meter').forEach((m) => m.classList.add('is-on'));
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
    io.observe(el);
  });
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
  document.querySelectorAll('.meter').forEach((m) => m.classList.add('is-on'));
}

/* ---------- tagline a rotazione (effetto macchina da scrivere) ---------- */
const tagEl = document.getElementById('tagline');
if (tagEl && !reduced) {
  const lines = (tagEl.dataset.lines || '').split('|').filter(Boolean);
  let li = 0, ci = lines[0]?.length || 0, deleting = false;
  const tick = () => {
    const line = lines[li];
    if (!deleting) {
      ci++;
      tagEl.textContent = line.slice(0, ci);
      if (ci >= line.length) { deleting = true; return setTimeout(tick, 2600); }
      return setTimeout(tick, 45);
    }
    ci--;
    tagEl.textContent = line.slice(0, ci);
    if (ci <= 0) { deleting = false; li = (li + 1) % lines.length; return setTimeout(tick, 300); }
    setTimeout(tick, 22);
  };
  if (lines.length > 1) { deleting = true; setTimeout(tick, 3200); }
}

/* ---------- casa: la persona accende e spegne le luci dal telefono ---------- */
const house = document.getElementById('house');
const person = document.getElementById('person');
if (house && person) {
  const signal = document.getElementById('signal');
  const gw = house.querySelector('.bldg__gw');
  const hint = document.getElementById('houseHint');
  let on = false;
  const restart = (el, cls) => { el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); };
  const toggle = () => {
    on = !on;
    person.classList.add('is-used', 'is-tap');
    setTimeout(() => person.classList.remove('is-tap'), 250);
    if (!reduced) { restart(signal, 'is-sending'); restart(gw, 'is-rx'); }
    // le luci rispondono dopo il segnale, una stanza alla volta
    house.querySelectorAll('[data-zone]').forEach((el) => {
      const delay = reduced ? 0 : (el.dataset.zone === 'giorno' ? 450 : 650);
      setTimeout(() => el.classList.toggle('is-on', on), delay);
    });
    person.setAttribute('aria-pressed', String(on));
    hint?.classList.add('is-done');
  };
  person.setAttribute('aria-pressed', 'false');
  person.addEventListener('click', toggle);
  person.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
}
