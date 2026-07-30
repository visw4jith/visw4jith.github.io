(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('in-view'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.revealDelay || '0', 10);
          setTimeout(() => el.classList.add('in-view'), delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------- magnetic buttons ---------- */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ---------- custom cursor dot ---------- */
  const cursorDot = document.getElementById('cursorDot');
  if (cursorDot && !isTouch && !reduceMotion) {
    let mouseX = 0, mouseY = 0, dotX = 0, dotY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.classList.add('active');
    });
    window.addEventListener('mouseleave', () => cursorDot.classList.remove('active'));

    const hoverTargets = document.querySelectorAll('a, button, .skill-tag, .proj-card, .exp-item, .edu-item');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursorDot.classList.add('grow'));
      el.addEventListener('mouseleave', () => cursorDot.classList.remove('grow'));
    });

    const followCursor = () => {
      dotX += (mouseX - dotX) * 0.18;
      dotY += (mouseY - dotY) * 0.18;
      cursorDot.style.left = `${dotX}px`;
      cursorDot.style.top = `${dotY}px`;
      requestAnimationFrame(followCursor);
    };
    requestAnimationFrame(followCursor);
  } else if (cursorDot) {
    cursorDot.style.display = 'none';
  }

  /* ---------- scroll parallax ---------- */
  if (!reduceMotion) {
    const heroGrid = document.getElementById('heroGrid');
    const parallaxEls = document.querySelectorAll('[data-parallax]');

    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      if (heroGrid) heroGrid.style.transform = `translateY(${y * 0.12}px)`;
      parallaxEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        const speed = parseFloat(el.dataset.parallax || '0.05');
        const offset = (rect.top - window.innerHeight / 2) * speed;
        el.style.transform = `translateY(${offset}px)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    });
  }
})();
