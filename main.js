/* =========================================================
   Alternatefact Studios — Motion & interactions
   Lenis (smooth scroll) + GSAP + ScrollTrigger
   ========================================================= */

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Lenis smooth scroll ----------
  let lenis = null;
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1.0,
      smoothWheel: true,
      touchMultiplier: 1.2,
    });
    // Single rAF loop for Lenis; keep GSAP's default ticker independent
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
    }
  }

  // ---------- Scroll progress rail + machinery progress ----------
  const rail = $('#railFill');
  function updateProgress() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? Math.max(0, Math.min(1, h.scrollTop / max)) : 0;
    if (rail) rail.style.width = (p * 100).toFixed(2) + '%';
    if (window.__machineSetProgress) window.__machineSetProgress(p);
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // ---------- Hero meta / desc / CTA reveal (words handled by CSS) ----------
  if (window.gsap) {
    window.scrollTo(0, 0);
    gsap.set('.hero-meta > *', { y: 12, opacity: 0 });
    gsap.set('.hero-desc, .hero-cta-row, .scroll-hint', { y: 20, opacity: 0 });

    const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'expo.out' } });
    tl.to('.hero-meta > *', { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 }, 0)
      .to('.hero-desc', { y: 0, opacity: 1, duration: 1.1 }, 0.7)
      .to('.hero-cta-row', { y: 0, opacity: 1, duration: 1.1 }, 0.85)
      .to('.scroll-hint', { y: 0, opacity: 1, duration: 0.9 }, 1.0);
  }

  // ---------- Reveal on scroll ----------
  if (window.gsap && window.ScrollTrigger) {
    $$('.reveal').forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
          onEnter: () => el.classList.add('is-in'),
          onLeaveBack: () => el.classList.remove('is-in'),
        },
      });
    });
  } else {
    // Fallback IntersectionObserver
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && e.target.classList.add('is-in'));
      },
      { threshold: 0.18 }
    );
    $$('.reveal').forEach((el) => io.observe(el));
  }

  // ---------- Chapter tracker ----------
  const chapters = [
    { sel: '#top', num: '01', title: 'Ignition' },
    { sel: '#manifesto', num: '02', title: 'Movement' },
    { sel: '#work', num: '03', title: 'Vapour' },
    { sel: '#approach', num: '04', title: 'Assembly' },
    { sel: '#contact', num: '05', title: 'Signature' },
  ];
  const chapterNum = $('#chapterNum');
  const chapterTitle = $('#chapterTitle');
  const chapterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const found = chapters.find((c) => c.sel === '#' + e.target.id);
          if (found && chapterNum && chapterTitle) {
            chapterNum.textContent = found.num;
            chapterTitle.textContent = found.title;
          }
        }
      });
    },
    { threshold: 0.35 }
  );
  chapters.forEach((c) => {
    const el = document.querySelector(c.sel);
    if (el) chapterObserver.observe(el);
  });

  // ---------- Work card spotlight (mouse-follow) ----------
  $$('.work-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--mx', mx + '%');
      card.style.setProperty('--my', my + '%');
    });
  });

  // ---------- Smooth anchor scroll via Lenis ----------
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -20, duration: 1.2 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ---------- File number randomizer (tiny detail) ----------
  const fileNo = $('#fileNo');
  if (fileNo) {
    const n = 100 + Math.floor(Math.random() * 900);
    fileNo.textContent = 'A/F–0' + n;
  }
})();
