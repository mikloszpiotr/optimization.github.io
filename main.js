/* ═══════════════════════════════
   main.js — Interactivity Layer
═══════════════════════════════ */

/* ── ANIMATED BACKGROUND CANVAS ── */
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Floating nodes (graph nodes representing supply chain network)
  const NUM_NODES = 38;
  const nodes = [];
  const COLORS = ['#6366f1', '#8b5cf6', '#14b8a6', '#10b981', '#f43f5e'];

  for (let i = 0; i < NUM_NODES; i++) {
    nodes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2.5 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: Math.random() * 0.5 + 0.1,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          const alpha = (1 - dist / 180) * 0.08;
          ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.color + Math.round(n.opacity * 255).toString(16).padStart(2, '0');
      ctx.fill();
    });

    // Update positions
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── SCROLL-REVEAL ── */
(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  // Add reveal class to key elements
  const targets = document.querySelectorAll(
    '.project-card, .metric-card, .theory-item, .insight-card, .stack-group, .arch-box, .phil-item'
  );
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    observer.observe(el);
  });
})();

/* ── NAVBAR SCROLL STATE ── */
(function () {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.style.background = 'rgba(8,11,20,0.95)';
    } else {
      navbar.style.background = 'rgba(8,11,20,0.82)';
    }
  });
})();

/* ── ACTIVE NAV LINK ── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();

/* ── COST BAR ANIMATION (on scroll) ── */
(function () {
  const bars = document.querySelectorAll('.cost-fill');
  const stored = {};

  bars.forEach((bar, i) => {
    stored[i] = bar.style.width;
    bar.style.width = '0%';
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const idx = Array.from(bars).indexOf(bar);
        setTimeout(() => {
          bar.style.width = stored[idx];
        }, 200);
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach(b => observer.observe(b));
})();

/* ── COUNTER ANIMATION ── */
(function () {
  function animateNum(el, target, suffix, duration = 1200) {
    const start = Date.now();
    const isFloat = target % 1 !== 0;

    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isFloat
        ? (target * eased).toFixed(1)
        : Math.round(target * eased);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    step();
  }

  const metricNums = document.querySelectorAll('.metric-num');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Simple pulse animation for text-based metrics
        entry.target.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        entry.target.style.opacity = '0';
        entry.target.style.transform = 'scale(0.8)';
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'scale(1)';
        }, 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  metricNums.forEach(el => observer.observe(el));
})();

/* ── SMOOTH HOVER on PROJECT CARDS ── */
(function () {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
      card.style.transform = `perspective(1200px) rotateX(${-y}deg) rotateY(${x}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();
