/* =============================================
   FLUXO DIGITAL — script.js
   ============================================= */

/* ── LOADER + CINEMATIC HERO ENTRY ── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const hero   = document.getElementById('hero');
  const status = loader.querySelector('.ld-status');
  const msgs   = ['Inicializando...', 'Carregando assets...', 'Quase pronto...'];
  let i = 0;

  const interval = setInterval(() => {
    i++;
    if (i < msgs.length) status.textContent = msgs[i];
  }, 400);

  setTimeout(() => {
    clearInterval(interval);

    // Loader dissolves: fade + blur + scale up
    loader.classList.add('out');

    // Hero comes into focus in sync with loader exit (same frame)
    requestAnimationFrame(() => {
      hero.classList.add('hero-in');
    });

    // Release compositor layer once transition is complete
    hero.addEventListener('transitionend', (e) => {
      if (e.propertyName === 'opacity') {
        hero.style.willChange = 'auto';
      }
    }, { once: true });

  }, 1400);
});

/* ── CUSTOM CURSOR (desktop only) ── */
(function initCursor() {
  const isMobile = window.innerWidth < 768 || ('ontouchstart' in window);
  if (isMobile) {
    // Hide cursor elements so they don't occupy space
    const c = document.getElementById('cursor');
    const t = document.getElementById('cursor-trail');
    if (c) c.style.display = 'none';
    if (t) t.style.display = 'none';
    return;
  }

  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursor-trail');

  let mx = -100, my = -100;
  let tx = -100, ty = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function animTrail() {
    tx += (mx - tx) * .14;
    ty += (my - ty) * .14;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(animTrail);
  })();

  document.querySelectorAll('a, button, .ben-card, .proj-card, .faq-q').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width  = '16px';
      cursor.style.height = '16px';
      trail.style.width   = '48px';
      trail.style.height  = '48px';
      trail.style.borderColor = 'rgba(10,132,255,.6)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width  = '10px';
      cursor.style.height = '10px';
      trail.style.width   = '32px';
      trail.style.height  = '32px';
      trail.style.borderColor = 'rgba(10,132,255,.4)';
    });
  });
})();

/* ── NAV ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

/* ── NAV MOBILE ── */
function toggleNav() {
  const links = document.getElementById('navLinks');
  const hbg   = document.getElementById('hbg');
  const isOpen = links.classList.toggle('open');
  hbg.classList.toggle('active');
  // Lock body scroll while menu is open
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
    document.getElementById('hbg').classList.remove('active');
    document.body.style.overflow = '';
  });
});

// Close mobile menu on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('navLinks').classList.remove('open');
    document.getElementById('hbg').classList.remove('active');
    document.body.style.overflow = '';
  }
});

/* ── SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ── SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('vis');
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── HERO CANVAS — connected particles ── */
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || window.innerWidth < 768) return;

  const ctx  = canvas.getContext('2d');
  const hero = document.getElementById('hero');

  function resize() {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = 28;
  const nodes = Array.from({ length: COUNT }, () => ({
    x:  Math.random() * canvas.width,
    y:  Math.random() * canvas.height,
    vx: (Math.random() - .5) * .32,
    vy: (Math.random() - .5) * .32,
    r:  Math.random() * 1.6 + .6,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const alpha = (1 - dist / 150) * .12;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(10,132,255,${alpha})`;
          ctx.lineWidth = .7;
          ctx.stroke();
        }
      }
    }

    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10,132,255,.25)';
      ctx.fill();
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── SPOTLIGHT FOLLOWS MOUSE ── */
(function initSpotlight() {
  const spotlight = document.getElementById('spotlight');
  const hero = document.getElementById('hero');
  if (!spotlight || !hero || window.innerWidth < 768) return;

  let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
  let cx = tx, cy = ty;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    tx = e.clientX - rect.left;
    ty = e.clientY - rect.top;
  });

  (function anim() {
    cx += (tx - cx) * .06;
    cy += (ty - cy) * .06;
    spotlight.style.left = cx + 'px';
    spotlight.style.top  = cy + 'px';
    requestAnimationFrame(anim);
  })();
})();

/* ── FLOATING UI CARDS PARALLAX ── */
(function initParallax() {
  if (window.innerWidth < 768) return;

  const cards = document.querySelectorAll('.ui-card');
  let mx = 0, my = 0, cx = 0, cy = 0;

  window.addEventListener('mousemove', e => {
    mx = (e.clientX - window.innerWidth  / 2) / window.innerWidth;
    my = (e.clientY - window.innerHeight / 2) / window.innerHeight;
  });

  const baseRot = [-6, 5, 3];

  (function anim() {
    cx += (mx - cx) * .055;
    cy += (my - cy) * .055;
    cards.forEach((card, i) => {
      const speed = (i + 1) * 16;
      card.style.transform = `translate(${cx * speed}px, ${cy * speed}px) rotate(${baseRot[i] || 0}deg)`;
    });
    requestAnimationFrame(anim);
  })();
})();

/* ── FLOATING PARTICLES ── */
(function spawnParticles() {
  const heroBg = document.querySelector('#hero .hero-bg');
  if (!heroBg) return;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes pfloat {
      0%   { transform: translateY(0) translateX(0); opacity: 0; }
      12%  { opacity: 1; }
      88%  { opacity: .3; }
      100% { transform: translateY(-85vh) translateX(var(--dx)); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // Reduce particle count on mobile for performance
  const count = window.innerWidth < 768 ? 8 : 18;
  for (let i = 0; i < count; i++) {
    const p   = document.createElement('div');
    const sz  = Math.random() * 2.5 + .8;
    const dx  = (Math.random() - .5) * 100;
    const dur = (Math.random() * 12 + 9).toFixed(1);
    const del = (Math.random() * 10).toFixed(1);

    p.style.cssText = [
      'position:absolute',
      `width:${sz}px`,
      `height:${sz}px`,
      `background:rgba(10,132,255,${(Math.random() * .35 + .1).toFixed(2)})`,
      'border-radius:50%',
      `left:${Math.random() * 100}%`,
      'bottom:-10px',
      'pointer-events:none',
      'z-index:1',
      `--dx:${dx}px`,
      `animation:pfloat ${dur}s ${del}s ease-in-out infinite`,
    ].join(';');

    heroBg.appendChild(p);
  }
})();

/* ── COUNTER ANIMATION ── */
function countUp(el, target, suffix) {
  let current = 0;
  const step  = target / 65;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current) + suffix;
    if (current >= target) clearInterval(timer);
  }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-n[data-target]').forEach(el => {
        countUp(el, Number(el.dataset.target), el.dataset.suffix || '');
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

const valueSection = document.getElementById('value');
if (valueSection) statsObserver.observe(valueSection);

/* ── PROJECT CARD TILT (desktop only) ── */
if (window.innerWidth >= 768 && !('ontouchstart' in window)) {
  document.querySelectorAll('.proj-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - .5;
      const y = (e.clientY - rect.top)  / rect.height - .5;
      card.style.transform   = `translateY(-8px) scale(1.01) rotateX(${y * -4}deg) rotateY(${x * 4}deg)`;
      card.style.perspective = '900px';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ── FAQ ACCORDION ── */
function toggleFaq(btn) {
  const item   = btn.closest('.faq-item');
  const answer = item.querySelector('.faq-a');
  const isOpen = item.classList.contains('open');

  document.querySelectorAll('.faq-item.open').forEach(openItem => {
    openItem.classList.remove('open');
    openItem.querySelector('.faq-a').classList.remove('open');
  });

  if (!isOpen) {
    item.classList.add('open');
    answer.classList.add('open');
  }
}

/* ── BENEFIT CARDS GLOW ON MOUSE (desktop only) ── */
if (!('ontouchstart' in window)) document.querySelectorAll('.ben-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    const glow = card.querySelector('.ben-card-glow');
    if (glow) {
      glow.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(10,132,255,.12) 0%, transparent 65%)`;
    }
  });
});

/* ── ACTIVE NAV LINK ON SCROLL ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = '#' + entry.target.id;
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === id
          ? 'var(--txt)'
          : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));
