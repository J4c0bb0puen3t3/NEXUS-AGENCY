/* ═══════════════════════════════════════════════════════════
   NEXUS MARKETING AGENCY — JS
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Custom Cursor ────────────────────────────────────── */
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');

  if (window.innerWidth > 768 && cursor && follower) {
    let mx = 0, my = 0, fx = 0, fy = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });

    const animateFoll = () => {
      fx += (mx - fx) * 0.12;
      fy += (my - fy) * 0.12;
      follower.style.left = fx + 'px';
      follower.style.top  = fy + 'px';
      requestAnimationFrame(animateFoll);
    };
    animateFoll();

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      follower.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
      follower.style.opacity = '1';
    });
  }

  /* ── Nav scroll ───────────────────────────────────────── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ── Mobile burger ────────────────────────────────────── */
  const burger     = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobile-menu');
  let menuOpen = false;

  burger.addEventListener('click', () => {
    menuOpen = !menuOpen;
    burger.classList.toggle('open', menuOpen);
    mobileMenu.classList.toggle('open', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ── Smooth scroll (all internal links) ──────────────── */
  document.querySelectorAll('a[href^="#"], [data-link]').forEach(el => {
    el.addEventListener('click', e => {
      const target = el.getAttribute('href') || '#' + el.dataset.link;
      if (!target || target === '#') return;
      const section = document.querySelector(target);
      if (section) {
        e.preventDefault();
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Scroll reveal ────────────────────────────────────── */
  const reveals = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay || (Array.from(reveals).indexOf(el) % 4) * 80;
        setTimeout(() => el.classList.add('visible'), delay);
        revealObs.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(el => revealObs.observe(el));

  /* ── Counter animation ────────────────────────────────── */
  const counters = document.querySelectorAll('.stat-item__num[data-count]');
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const end   = parseInt(el.dataset.count);
      const dur   = 1800;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / dur, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * end);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = end;
      };
      requestAnimationFrame(tick);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObs.observe(c));

  /* ── Portfolio filter ─────────────────────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const workCards  = document.querySelectorAll('.work-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      workCards.forEach(card => {
        if (filter === 'all' || card.dataset.cat === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* ── Testimonials slider ──────────────────────────────── */
  const track = document.getElementById('testimonials-track');
  const dotsContainer = document.getElementById('testimonials-dots');
  const cards = track ? track.querySelectorAll('.testimonial-card') : [];
  let current = 0;
  let autoTimer;

  if (cards.length && dotsContainer) {
    // Create dots
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'testimonials__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.testimonials__dot');

    const goTo = (index) => {
      current = index;
      const cardW = cards[0].offsetWidth + 24;
      track.style.transform = `translateX(-${current * cardW}px)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    };

    const next = () => goTo((current + 1) % cards.length);
    autoTimer = setInterval(next, 4500);

    track.addEventListener('mouseenter', () => clearInterval(autoTimer));
    track.addEventListener('mouseleave', () => {
      autoTimer = setInterval(next, 4500);
    });

    // Touch swipe
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goTo(Math.min(current + 1, cards.length - 1)) : goTo(Math.max(current - 1, 0));
      }
    });

    window.addEventListener('resize', () => goTo(current));
  }

  /* ── Contact form validation ──────────────────────────── */
  const form = document.getElementById('contact-form');

  if (form) {
    const showError = (fieldId, msg) => {
      const field = document.getElementById(fieldId);
      const error = document.getElementById(fieldId + '-error');
      if (field) field.classList.add('error');
      if (error) error.textContent = msg;
    };

    const clearError = (fieldId) => {
      const field = document.getElementById(fieldId);
      const error = document.getElementById(fieldId + '-error');
      if (field) field.classList.remove('error');
      if (error) error.textContent = '';
    };

    ['name', 'email', 'message'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => clearError(id));
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;

      const name    = document.getElementById('name').value.trim();
      const email   = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      clearError('name'); clearError('email'); clearError('message');

      if (!name || name.length < 2) {
        showError('name', 'Por favor ingresa tu nombre.');
        valid = false;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('email', 'Ingresa un email válido.');
        valid = false;
      }
      if (!message || message.length < 10) {
        showError('message', 'El mensaje debe tener al menos 10 caracteres.');
        valid = false;
      }
      if (!valid) return;

      const btnText    = document.querySelector('.btn-text');
      const btnLoading = document.querySelector('.btn-loading');
      const submitBtn  = document.getElementById('submit-btn');
      const success    = document.getElementById('form-success');

      submitBtn.disabled  = true;
      btnText.style.display    = 'none';
      btnLoading.style.display = 'inline';

      // Simulate async send (replace with actual fetch in production)
      await new Promise(r => setTimeout(r, 1800));

      submitBtn.style.display = 'none';
      success.style.display   = 'block';
      form.reset();

      setTimeout(() => {
        submitBtn.style.display  = 'flex';
        success.style.display    = 'none';
        btnText.style.display    = 'inline';
        btnLoading.style.display = 'none';
        submitBtn.disabled       = false;
      }, 5000);
    });
  }

  /* ── Active nav link on scroll ────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__link');

  const activeObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = link.dataset.link === entry.target.id
            ? 'var(--white)' : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => activeObs.observe(s));

  /* ── Parallax subtle on hero ──────────────────────────── */
  const heroBg = document.querySelector('.hero__bg-grid');
  if (heroBg && window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      heroBg.style.transform = `translateY(${y * 0.15}px)`;
    }, { passive: true });
  }

});
