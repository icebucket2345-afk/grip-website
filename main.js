/* Grip website — interactions */
(() => {
  // Mobile menu
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
    });
  }

  // Waitlist form
  const form = document.getElementById('waitlist-form');
  const msg = document.getElementById('waitlist-msg');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[name="email"]').value.trim();
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        msg.textContent = "Please enter a valid email.";
        msg.style.color = 'var(--grip-sunset)';
        msg.classList.add('show');
        return;
      }
      msg.textContent = "You're on the list. We'll be in touch.";
      msg.style.color = 'var(--grip-fairway)';
      msg.classList.add('show');
      form.reset();
    });
  }

  // Carousel
  const scroll = document.getElementById('shots-scroll');
  const dotsEl = document.getElementById('shots-dots');
  const prev = document.getElementById('shots-prev');
  const next = document.getElementById('shots-next');
  if (scroll && dotsEl) {
    const shots = scroll.querySelectorAll('.shot');
    let active = 0;

    // Dots
    shots.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'shot-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Go to screenshot ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(d);
    });

    const goTo = (i) => {
      active = Math.max(0, Math.min(shots.length - 1, i));
      shots[active].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      // NOTE: using scrollIntoView per carousel child only; not on page root.
      updateDots();
    };
    const updateDots = () => {
      dotsEl.querySelectorAll('.shot-dot').forEach((d, i) => d.classList.toggle('active', i === active));
    };

    // Avoid scrollIntoView (can mess with page root). Use scrollLeft instead.
    const goToSafe = (i) => {
      active = Math.max(0, Math.min(shots.length - 1, i));
      const el = shots[active];
      const target = el.offsetLeft - (scroll.clientWidth - el.clientWidth) / 2;
      scroll.scrollTo({ left: target, behavior: 'smooth' });
      updateDots();
    };

    // Override goTo to use safe version
    dotsEl.querySelectorAll('.shot-dot').forEach((d, i) => {
      d.onclick = () => goToSafe(i);
    });

    if (prev) prev.addEventListener('click', () => goToSafe(active - 1));
    if (next) next.addEventListener('click', () => goToSafe(active + 1));

    // Track scroll position for dots
    let raf;
    scroll.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = scroll.scrollLeft + scroll.clientWidth / 2;
        let best = 0, bestD = Infinity;
        shots.forEach((el, i) => {
          const c = el.offsetLeft + el.clientWidth / 2;
          const d = Math.abs(c - center);
          if (d < bestD) { bestD = d; best = i; }
        });
        if (best !== active) { active = best; updateDots(); }
      });
    });
  }
})();
