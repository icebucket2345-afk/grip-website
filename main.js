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

  // Attribution: the post link a golfer arrived on (utm_*) and the share
  // link that sent them (ref). Kept for the session so it survives moving
  // between pages before signing up. Storage can be blocked; signup still works.
  const ATTR_KEY = 'grip_attribution';
  const REF_RE = /^[0-9a-f]{10}$/;
  const attribution = (() => {
    const params = new URLSearchParams(location.search);
    const found = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach((k) => {
      const v = (params.get(k) || '').trim().slice(0, 100);
      if (v) found[k] = v;
    });
    const ref = (params.get('ref') || '').toLowerCase();
    if (REF_RE.test(ref)) found.referred_by = ref;
    try {
      if (Object.keys(found).length) sessionStorage.setItem(ATTR_KEY, JSON.stringify(found));
      return JSON.parse(sessionStorage.getItem(ATTR_KEY) || '{}');
    } catch {
      return found;
    }
  })();

  // A golfer's share code is derived from their email, so signing up twice
  // gives the same link. Needs a secure context; without one there is no link.
  const referralCode = async (email) => {
    if (!window.crypto || !crypto.subtle) return null;
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email));
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('').slice(0, 10);
  };

  const share = document.getElementById('waitlist-share');
  const showShare = (code) => {
    if (!share || !code) return;
    const link = `https://gripgolfapp.com/?ref=${code}&utm_source=referral&utm_medium=share`;
    const btn = share.querySelector('[data-share-btn]');
    share.querySelector('[data-share-link]').textContent = link.replace('https://', '');
    btn.onclick = async () => {
      const text = 'Grip is a new app for finding golf partners, at home or away. Join the waitlist:';
      try {
        if (navigator.share) {
          await navigator.share({ title: 'Grip', text, url: link });
          return;
        }
        await navigator.clipboard.writeText(link);
        btn.textContent = 'Link copied';
      } catch {
        // Share sheet dismissed or clipboard blocked; the link stays on screen.
      }
    };
    share.hidden = false;
  };

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
        const code = await referralCode(email).catch(() => null);
        const tracked = { ...payload, ...attribution };
        if (code) tracked.referral_code = code;

        const insert = (body) => fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(body)
        });

        // A 400 means the attribution columns are not in the database yet
        // (migration 118); never lose the signup over them.
        let res = await insert(tracked);
        if (res.status === 400) res = await insert(payload);

        if (res.ok || res.status === 409) {
          msg.textContent = res.ok
            ? "You're on the list. Sign up to Grip with this email when we launch to get your Founding member badge."
            : "You're already on the list. Sign up to Grip with this email when we launch to get your Founding member badge.";
          msg.style.color = 'var(--grip-fairway)';
          form.reset();
          showShare(code);
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
