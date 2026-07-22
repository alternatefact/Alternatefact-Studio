/* =========================================================
   Alternatefact Studios — Motion & interactions
   Lenis (smooth scroll) + GSAP + ScrollTrigger
   + portfolio filters, project modal, counters, contact form
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

  // ---------- Hero intro ----------
  if (window.gsap) {
    window.scrollTo(0, 0);
    gsap.set('.hero-meta > *', { y: 12, opacity: 0 });
    gsap.set('.hero-desc, .hero-cta-row, .hero-stats, .scroll-hint', { y: 20, opacity: 0 });

    const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'expo.out' } });
    tl.to('.hero-meta > *', { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 }, 0)
      .to('.hero-desc', { y: 0, opacity: 1, duration: 1.1 }, 0.7)
      .to('.hero-cta-row', { y: 0, opacity: 1, duration: 1.1 }, 0.85)
      .to('.hero-stats', { y: 0, opacity: 1, duration: 1.1 }, 1.0)
      .to('.scroll-hint', { y: 0, opacity: 1, duration: 0.9 }, 1.1);
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
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && e.target.classList.add('is-in'));
      },
      { threshold: 0.18 }
    );
    $$('.reveal').forEach((el) => io.observe(el));
  }

  // ---------- Animated counters (hero stats) ----------
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        counterIO.unobserve(e.target);
        const el = e.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const start = performance.now();
        const dur = 1600;
        (function tick(now) {
          const p = Math.min(1, (now - start) / dur);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      });
    },
    { threshold: 0.6 }
  );
  $$('.counter').forEach((c) => counterIO.observe(c));

  // ---------- Chapter tracker ----------
  const chapters = [
    { sel: '#top', num: '01', title: 'Ignition' },
    { sel: '#about', num: '02', title: 'The Studio' },
    { sel: '#services', num: '03', title: 'The Pillars' },
    { sel: '#portfolio', num: '04', title: 'The Bench' },
    { sel: '#process', num: '05', title: 'The Method' },
    { sel: '#partners', num: '06', title: 'The Record' },
    { sel: '#contact', num: '07', title: 'Signature' },
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
    { threshold: 0.3 }
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

  // ---------- Portfolio filters ----------
  const filterBtns = $$('#portfolio-filters .filter-pill');
  const workCards = $$('#portfolio-grid .work-card');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      workCards.forEach((card) => {
        card.style.display = filter === 'all' || card.dataset.category === filter ? '' : 'none';
      });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });

  // ---------- Project data + modal ----------
  const projects = [
    {
      category: 'AI SHORT FILM',
      title: 'The Awakening',
      subtitle: 'A film by Olukayode · Alternatefact Studios',
      image: 'assets/awakening.jpg',
      description:
        '<p>Some powers were never meant to sleep. On a rooftop above a burning skyline, a man comes face to face with the thing the past left behind. <em>The past never dies — it waits.</em></p><p>A cinematic AI creature feature: every frame generated, graded and cut in-house with our AI production pipeline, from creature design to the final sound mix.</p>',
      client: 'Original Production',
      year: '2025',
      role: 'Writer, Director, AI Cinematography, Edit & Sound',
    },
    {
      category: 'AI SHORT FILM',
      title: 'Beyond Lagos',
      subtitle: 'A film by Olukayode · African Futures',
      image: 'assets/beyond-lagos.jpg',
      description:
        "<p>Some dreams don't end at the horizon. An Afro-futurist space epic that launches African stories past the stratosphere — astronauts over a glowing Lagos skyline, ambition written in rocket fire.</p><p>Concept, poster art and film built with our generative pipeline, blending hard sci-fi scale with grounded, human storytelling.</p>",
      client: 'Original Production',
      year: '2025',
      role: 'Writer, Director, AI Visuals, Poster Design',
    },
    {
      category: 'CONCEPT ART',
      title: 'Adorned',
      subtitle: 'Concept Series · 2025',
      image: 'assets/concept-art.jpg',
      description:
        '<p>A character design study in impossible couture — coral, beadwork and machine-precision ornament rendered with fashion-editorial polish.</p><p>Part of our ongoing concept-art practice: world building, character design and key art for films, brands and exhibitions.</p>',
      client: 'Personal / Concept Series',
      year: '2025',
      role: 'Concept Artist, AI Direction',
    },
    {
      category: 'CAMPAIGN',
      title: 'One Choice',
      subtitle: 'Public Awareness Campaign',
      image: 'assets/one-choice.jpg',
      description:
        '<p>One choice can change everything. A public-awareness campaign against drug abuse — a figure cracking apart like dried clay, a community holding the light behind him, and a message of hope: <em>recovery is possible, you are stronger than you think.</em></p><p>Art direction, poster design and full campaign visuals produced end-to-end in our studio.</p>',
      client: 'Public Awareness',
      year: '2025',
      role: 'Art Direction, Campaign Design',
    },
  ];

  const modal = $('#project-modal');

  function showProjectModal(i) {
    const project = projects[i];
    if (!project || !modal) return;
    $('#modal-category').textContent = project.category;
    $('#modal-title').textContent = project.title;
    $('#modal-subtitle').textContent = project.subtitle;
    $('#modal-description').innerHTML = project.description;
    $('#modal-client').textContent = project.client;
    $('#modal-year').textContent = project.year;
    $('#modal-role').textContent = project.role;
    $('#modal-image-container').innerHTML =
      '<img src="' + project.image + '" alt="' + project.title + '" />';
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  }

  function hideProjectModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }

  $$('.work-card[data-project]').forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      showProjectModal(parseInt(card.dataset.project, 10));
    });
  });
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideProjectModal();
    });
  }
  const closeBtn = $('#modal-close');
  if (closeBtn) closeBtn.addEventListener('click', hideProjectModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) hideProjectModal();
  });

  // ---------- Contact form (front-end demo) ----------
  const form = $('#contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      const originalText = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Message sent ✓';
        setTimeout(() => {
          form.reset();
          btn.textContent = originalText;
          btn.disabled = false;
          const note = document.createElement('p');
          note.className = 'form-success';
          note.innerHTML =
            'Thank you — we\'ll reply within 24 hours. Meanwhile, find us on <a href="https://www.instagram.com/alternatefact_studios" target="_blank" rel="noopener">Instagram</a>.';
          form.appendChild(note);
          setTimeout(() => {
            note.style.transition = 'opacity .4s ease';
            note.style.opacity = '0';
            setTimeout(() => note.remove(), 400);
          }, 5500);
        }, 2000);
      }, 1400);
    });
  }

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
