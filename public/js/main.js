document.addEventListener('DOMContentLoaded', () => {

  /* =====================================================================
     UTILITIES
     ===================================================================== */
  const qs = (s, p) => (p || document).querySelector(s);
  const qsa = (s, p) => (p || document).querySelectorAll(s);
  const on = (el, ev, fn, opts) => { if (el) el.addEventListener(ev, fn, opts || { passive: true }); };
  const isTouch = !window.matchMedia('(hover: hover)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* =====================================================================
     1. PAGE LOADER
     ===================================================================== */
  const loader = qs('#pageLoader');
  if (loader) {
    const hideLoader = () => { setTimeout(() => loader.classList.add('loaded'), 600); };
    on(window, 'load', hideLoader);
    setTimeout(hideLoader, 3000);
  }

  /* =====================================================================
     2. SCROLL-DRIVEN REVEAL ENGINE
     ===================================================================== */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => entry.target.classList.add('revealed'));
        revealObserver.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px 0px -80px 0px', threshold: 0.06 });

  qsa('.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-clip, .stagger-children').forEach(el => {
    if (prefersReducedMotion) {
      el.classList.add('revealed');
    } else {
      revealObserver.observe(el);
    }
  });

  /* =====================================================================
     3. SMOOTH ANCHOR SCROLL
     ===================================================================== */
  qsa('a[href^="#"]').forEach(anchor => {
    on(anchor, 'click', function(e) {
      e.preventDefault();
      const target = qs(this.getAttribute('href'));
      if (target) {
        const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* =====================================================================
     4. CUSTOM CURSOR — Dual-ring with magnetic pull
     ===================================================================== */
  if (!isTouch && !prefersReducedMotion) {
    const dot = document.createElement('div');
    dot.classList.add('cursor-dot');
    document.body.appendChild(dot);

    const ring = document.createElement('div');
    ring.classList.add('cursor-ring');
    document.body.appendChild(ring);

    let mouseX = -100, mouseY = -100;
    let dotX = -100, dotY = -100;
    let ringX = -100, ringY = -100;

    on(document, 'mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    on(document, 'mousedown', () => ring.classList.add('clicking'));
    on(document, 'mouseup', () => ring.classList.remove('clicking'));

    function animateCursor() {
      dotX += (mouseX - dotX) * 0.22;
      dotY += (mouseY - dotY) * 0.22;
      ringX += (mouseX - ringX) * 0.09;
      ringY += (mouseY - ringY) * 0.09;

      dot.style.left = dotX + 'px';
      dot.style.top = dotY + 'px';
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';

      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const interactiveSelector = [
      'a', 'button',
      '.portfolio-card', '.featured-card',
      '.filter-btn', '.contact__email-btn',
      '.service-card', '.lightbox__close',
      '.error-page__btn'
    ].join(', ');

    const addHover = () => ring.classList.add('hovered');
    const removeHover = () => ring.classList.remove('hovered');

    function bindCursorHovers() {
      qsa(interactiveSelector).forEach(el => {
        el.removeEventListener('mouseenter', addHover);
        el.removeEventListener('mouseleave', removeHover);
        el.addEventListener('mouseenter', addHover);
        el.addEventListener('mouseleave', removeHover);
      });
    }
    bindCursorHovers();

    const cursorMutObs = new MutationObserver(() => {
      clearTimeout(cursorMutObs._t);
      cursorMutObs._t = setTimeout(bindCursorHovers, 100);
    });
    cursorMutObs.observe(document.body, { childList: true, subtree: true });

    on(document, 'mouseleave', () => { dot.classList.add('hidden'); ring.classList.add('hidden'); });
    on(document, 'mouseenter', () => { dot.classList.remove('hidden'); ring.classList.remove('hidden'); });
  }

  /* =====================================================================
     5. NAVIGATION — Scroll, Burger, Active
     ===================================================================== */
  const nav = qs('#mainNav');
  const menuBtn = qs('#menuBtn');
  const mobileMenu = qs('#mobileMenu');

  if (nav) {
    let scrollTicking = false;
    const onNavScroll = () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          nav.classList.toggle('nav--scrolled', window.pageYOffset > 60);
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    };
    on(window, 'scroll', onNavScroll);
    onNavScroll();
  }

  if (menuBtn && mobileMenu) {
    on(menuBtn, 'click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      menuBtn.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    qsa('a', mobileMenu).forEach(a => {
      on(a, 'click', () => {
        mobileMenu.classList.remove('open');
        menuBtn.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  const currentPath = window.location.pathname;
  qsa('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '/' && href === '/') || (currentPath !== '/' && href !== '/' && currentPath.startsWith(href))) {
      link.classList.add('nav-link--active');
    }
  });

  /* =====================================================================
     6. WORK PAGE FILTERS — Animated with stagger
     ===================================================================== */
  const filterBtns = qsa('.filter-btn');
  const mediaItems = qsa('.media-item');

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      on(btn, 'click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const cat = btn.dataset.cat;
        let delay = 0;

        mediaItems.forEach((item) => {
          const isMatch = cat === 'all' || item.dataset.cat === cat;

          if (isMatch) {
            item.style.display = '';
            item.style.opacity = '0';
            item.style.transform = 'translateY(24px)';
            item.style.pointerEvents = 'none';
            requestAnimationFrame(() => {
              setTimeout(() => {
                item.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
                item.style.pointerEvents = '';
              }, delay);
              delay += 40;
            });
          } else {
            item.style.transition = 'opacity 0.35s, transform 0.35s';
            item.style.opacity = '0';
            item.style.transform = 'scale(0.95)';
            item.style.pointerEvents = 'none';
            setTimeout(() => {
              item.style.display = 'none';
              item.style.pointerEvents = '';
            }, 350);
          }
        });
      });
    });
  }

  /* =====================================================================
     7. LIGHTBOX
     ===================================================================== */
  const lb = qs('#lightbox');
  const lbContent = qs('#lbContent');
  const lbCloseBtn = qs('#lbClose');

  qsa('.media-item').forEach(item => {
    item.style.cursor = 'pointer';
    on(item, 'click', () => {
      const inner = item.innerHTML;
      const safe = inner.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

      if (lbContent) {
        lbContent.innerHTML = safe;
        lbContent.querySelectorAll('script').forEach(old => {
          const fresh = document.createElement('script');
          Array.from(old.attributes).forEach(attr => fresh.setAttribute(attr.name, attr.value));
          fresh.textContent = old.textContent;
          old.parentNode?.replaceChild(fresh, old);
        });
      }

      if (lb) {
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeLightbox = () => {
    if (lb) {
      lb.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => { if (lbContent) lbContent.innerHTML = ''; }, 400);
    }
  };

  on(lbCloseBtn, 'click', closeLightbox);
  on(lb, 'click', (e) => { if (e.target === lb) closeLightbox(); });
  on(document, 'keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  /* =====================================================================
     8. HERO PARALLAX
     ===================================================================== */
  const heroText = qs('.hero-text-wrapper');
  if (heroText && !isTouch && !prefersReducedMotion) {
    let heroTicking = false;
    on(window, 'scroll', () => {
      if (!heroTicking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const vh = window.innerHeight;
          if (scrollY < vh) {
            heroText.style.transform = `translateY(${scrollY * 0.2}px)`;
            heroText.style.opacity = 1 - (scrollY / (vh * 0.7));
          }
          heroTicking = false;
        });
        heroTicking = true;
      }
    });
  }

  /* =====================================================================
     9. MOUSE-REACTIVE BLOBS (hero fallback)
     ===================================================================== */
  const blobs = qsa('.blob');
  if (blobs.length > 0 && !isTouch && !prefersReducedMotion) {
    let blobTime = 0;
    let blobMouseX = 0, blobMouseY = 0;

    on(document, 'mousemove', (e) => {
      blobMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      blobMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animateBlobs() {
      blobTime += 0.002;
      blobs.forEach((blob, i) => {
        const speed = 1 + i * 0.3;
        const swayX = Math.sin(blobTime * speed) * 25;
        const swayY = Math.cos(blobTime * speed * 0.8) * 20;
        const mouseX = blobMouseX * 30 * (i + 1) * 0.5;
        const mouseY = blobMouseY * 30 * (i + 1) * 0.5;
        blob.style.transform = `translate(${swayX + mouseX}px, ${swayY + mouseY}px)`;
      });
      requestAnimationFrame(animateBlobs);
    }
    animateBlobs();
  }

  /* =====================================================================
     10. PAGE TRANSITIONS — Smooth internal navigation
     ===================================================================== */
  const transition = qs('#pageTransition');
  qsa('a[href^="/"]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('/admin') && !href.startsWith('/api') && !href.includes('?lang=')) {
      on(link, 'click', function(e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (transition) {
          e.preventDefault();
          transition.classList.add('entering');
          setTimeout(() => { window.location.href = href; }, 450);
        }
      });
    }
  });

  qsa('a[href*="?lang="]').forEach(link => {
    on(link, 'click', (e) => e.stopImmediatePropagation());
  });

  /* =====================================================================
     11. 3D TILT ON PORTFOLIO / FEATURED CARDS
     ===================================================================== */
  if (!isTouch && !prefersReducedMotion) {
    qsa('.portfolio-card, .featured-card').forEach(card => {
      on(card, 'mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (y - 0.5) * -8;
        const tiltY = (x - 0.5) * 8;
        card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      });

      on(card, 'mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
        card.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
        setTimeout(() => { card.style.transition = ''; }, 600);
      });
    });
  }

});
