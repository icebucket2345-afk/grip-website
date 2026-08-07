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
  const SUPABASE_URL = 'https://mnrgrnqimoajdsnejrrn.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucmdybnFpbW9hamRzbmVqcnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NTgyMDUsImV4cCI6MjA4NjMzNDIwNX0.5k-vu5MXyg23kgRIjHZchvtGc7Nkipc95uyOAGwEEKg';

  const form = document.getElementById('waitlist-form');
  const msg = document.getElementById('waitlist-msg');
  if (form) {
    const emailInput = form.querySelector('input[name="email"]');
    const regionSelect = form.querySelector('select[name="region"]');
    const travelSelect = form.querySelector('select[name="travel_radius"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    const fail = (text) => {
      msg.textContent = text;
      msg.style.color = 'var(--grip-sunset)';
      msg.classList.add('show');
    };

    // Submit stays locked until an area is picked; markup ships it disabled.
    const syncSubmit = () => { submitBtn.disabled = !regionSelect.value; };
    regionSelect.addEventListener('change', syncSubmit);
    syncSubmit();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim().toLowerCase();
      const region = regionSelect.value;

      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        fail("Please enter a valid email.");
        return;
      }
      if (!region) {
        fail("Please choose where you play.");
        return;
      }

      // travel radius is optional; omit when skipped so it stores as null
      const payload = { email, region };
      if (travelSelect.value) payload.travel_radius = Number(travelSelect.value);

      submitBtn.disabled = true;

      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok || res.status === 409) {
          msg.textContent = res.ok
            ? "You're on the list. We'll be in touch."
            : "You're already on the list.";
          msg.style.color = 'var(--grip-fairway)';
          form.reset();
        } else {
          fail("Something went wrong. Please try again.");
        }
      } catch {
        fail("Something went wrong. Please try again.");
      }

      msg.classList.add('show');
      syncSubmit();
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
