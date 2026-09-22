(function(){
    var html = document.documentElement;
    var isDesktop = window.matchMedia('(min-width: 861px)').matches;
    html.classList.add(isDesktop ? 'device-desktop' : 'device-mobile');

    // ===== THEME (manual toggle, saved preference) =====
    var savedTheme = null;
    try { savedTheme = localStorage.getItem('asael-theme'); } catch(e){}
    var initialTheme = savedTheme || 'light';
    html.setAttribute('data-theme', initialTheme);

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var loader = document.getElementById('loader');

    if (reduceMotion) {
      if (loader) loader.remove();
      html.classList.add('ready');
    } else {
      html.classList.add('loading');
      var loaderDuration = isDesktop ? 1350 : 780;
      var hideDuration = isDesktop ? 1300 : 550;
      setTimeout(function(){
        loader.classList.add('hide');
        html.classList.add('ready');
        html.classList.remove('loading');
        setTimeout(function(){
          if (loader) loader.remove();
          if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        }, hideDuration);
      }, loaderDuration);
    }
  })();

  // ===== BOX-OPENING SCENE (GSAP ScrollTrigger) =====
  (function(){
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    var lid = document.querySelector('.box-lid');
    var caption = document.querySelector('.box-scene-caption');
    var items = [
      { el: document.querySelector('.box-cap-1'),  x:-220, y:-185, rotate:-22, scale:1.05 },
      { el: document.querySelector('.box-cap-2'),  x: 220, y:-175, rotate: 18, scale:0.95 },
      { el: document.querySelector('.box-cap-3'),  x:   0, y:-240, rotate: -8, scale:0.9  },
      { el: document.querySelector('.box-leaflet'),x:-290, y:   5, rotate: -6, scale:1    },
      { el: document.querySelector('.box-blister'),x: 290, y:   5, rotate:  6, scale:1    },
      { el: document.querySelector('.box-tab-1'),  x:-250, y: 105, rotate: -12,scale:1    },
      { el: document.querySelector('.box-tab-2'),  x: 260, y: 105, rotate:  14,scale:0.95 },
      { el: document.querySelector('.box-tab-3'),  x: -90, y: 145, rotate:  8, scale:0.9  },
      { el: document.querySelector('.box-tab-4'),  x: 100, y: 145, rotate: -10,scale:1.05 }
    ].filter(function(it){ return it.el; });

    // Each letter is drawn (in the SVG) at its final position in the word.
    // dx/dy below is how far back toward the box center it must start from.
    var letterEls = gsap.utils.toArray('.box-letter');
    var letters = letterEls.map(function(el, i){
      var dx = [125, 99, 76, 52, 33, -1, -27, -52, -73, -99, -128][i] || 0;
      return { el: el, dx: dx, dy: -205, rotate: gsap.utils.random(-16, 16) };
    });

    if (!lid || !caption || !items.length) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isDesktop = window.matchMedia('(min-width: 861px)').matches;

    if (reduceMotion){
      gsap.set(lid, { y:-90, rotate:-7, opacity:.15 });
      items.forEach(function(it){
        gsap.set(it.el, { opacity:1, scale:it.scale, x:it.x, y:it.y, rotate:it.rotate });
      });
      letters.forEach(function(l){ gsap.set(l.el, { opacity:1, x:0, y:0, scale:1, rotate:0 }); });
      gsap.set(caption, { opacity:1, y:0 });
      return;
    }

    if (isDesktop){
      var tl = gsap.timeline({
        scrollTrigger:{
          trigger:'#boxScene',
          start:'top top',
          end:'+=2100',
          scrub:0.8,
          pin:true
        }
      });
      tl.to(lid, { y:-90, rotate:-7, opacity:.15, duration:1, ease:'power2.out' }, 0);
      items.forEach(function(it, i){
        tl.to(it.el, {
          x: it.x, y: it.y, rotate: it.rotate, scale: it.scale, opacity: 1,
          duration: 1, ease: 'power2.out'
        }, 0.08 + i * 0.05);
      });
      // The brand name assembles once the medicines have burst outward
      letters.forEach(function(l, i){
        gsap.set(l.el, { x: l.dx, y: l.dy, scale: .3, opacity: 0, rotate: l.rotate });
        tl.to(l.el, {
          x: 0, y: 0, scale: 1, opacity: 1, rotate: 0,
          duration: 0.7, ease: 'back.out(1.7)'
        }, 0.58 + i * 0.032);
      });
      tl.to(caption, { opacity:1, y:0, duration:.5 }, 1.0);
    } else {
      ScrollTrigger.create({
        trigger:'#boxScene',
        start:'top 65%',
        once:true,
        onEnter:function(){
          var tl = gsap.timeline();
          tl.to(lid, { y:-50, rotate:-6, opacity:.18, duration:.6, ease:'power2.out' });
          items.forEach(function(it, i){
            tl.to(it.el, {
              x: it.x * 0.55, y: it.y * 0.55, rotate: it.rotate, scale: it.scale * 0.9, opacity: 1,
              duration: .5, ease: 'power2.out'
            }, i === 0 ? '-=0.3' : '-=0.42');
          });
          letters.forEach(function(l, i){
            gsap.set(l.el, { x: l.dx * 0.6, y: l.dy * 0.6, scale: .4, opacity: 0, rotate: l.rotate });
            tl.to(l.el, {
              x: 0, y: 0, scale: 1, opacity: 1, rotate: 0,
              duration: 0.45, ease: 'back.out(1.6)'
            }, i === 0 ? '-=0.1' : '-=0.34');
          });
          tl.to(caption, { opacity:1, y:0, duration:.5 }, '-=0.1');
        }
      });
    }

    window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
  })();

  var nav = document.getElementById('siteNav');
  window.addEventListener('scroll', function(){
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  // ===== COVERAGE MAP — communes light up one by one on scroll =====
  (function(){
    var chips = document.querySelectorAll('.commune-chip:not(.chip-excluded)');
    if (!chips.length) return;
    var mapEl = document.querySelector('.coverage-map');
    if (!mapEl) return;

    function lightUp(){
      chips.forEach(function(chip, i){
        setTimeout(function(){ chip.classList.add('lit'); }, i * 110);
      });
    }

    if ('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting){ lightUp(); io.unobserve(entry.target); }
        });
      }, { threshold: 0.35 });
      io.observe(mapEl);
    } else {
      lightUp();
    }
  })();

  // ===== REAL-TIME DAY/NIGHT ICON (Africa/Abidjan) =====
  (function(){
    var icon = document.getElementById('dayNightIcon');
    if (!icon) return;
    var sun = '<circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.6"/><path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>';
    var moon = '<path d="M20 14.5A8.5 8.5 0 0110.2 4.7 8.5 8.5 0 1020 14.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>';
    var hour;
    try {
      hour = parseInt(new Intl.DateTimeFormat('en-GB', { hour:'numeric', hour12:false, timeZone:'Africa/Abidjan' }).format(new Date()), 10);
    } catch(e) {
      hour = new Date().getUTCHours(); // Abidjan = UTC+0 year-round
    }
    icon.innerHTML = (hour >= 6 && hour < 18) ? sun : moon;
  })();

  // ===== FAQ ACCORDION =====
  document.querySelectorAll('.faq-item').forEach(function(item){
    var btn = item.querySelector('.faq-question');
    btn.addEventListener('click', function(){
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(openItem){
        if (openItem !== item) openItem.classList.remove('open');
      });
      item.classList.toggle('open', !isOpen);
    });
  });

  // ===== FLOATING WHATSAPP BUTTON =====
  var waFloat = document.querySelector('.wa-float');
  if (waFloat){
    window.addEventListener('scroll', function(){
      waFloat.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });
  }

  // ===== CUSTOM CURSOR (desktop only, smooth trailing ring) =====
  (function(){
    var canHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canHover || reduceMotion) return;

    var dot = document.getElementById('cursorDot');
    var ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    var dotX, dotY, ringX, ringY;
    if (typeof gsap !== 'undefined'){
      gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
      dotX = gsap.quickTo(dot, 'x', { duration:0.12, ease:'power3.out' });
      dotY = gsap.quickTo(dot, 'y', { duration:0.12, ease:'power3.out' });
      ringX = gsap.quickTo(ring, 'x', { duration:0.32, ease:'power3.out' });
      ringY = gsap.quickTo(ring, 'y', { duration:0.32, ease:'power3.out' });
    }

    document.addEventListener('mousemove', function(e){
      dot.classList.add('visible');
      ring.classList.add('visible');
      if (dotX){
        dotX(e.clientX); dotY(e.clientY);
        ringX(e.clientX); ringY(e.clientY);
      } else {
        var t = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%,-50%)';
        dot.style.transform = t;
        ring.style.transform = t;
      }
    }, { passive: true });

    document.addEventListener('mouseleave', function(){
      dot.classList.remove('visible');
      ring.classList.remove('visible');
    });

    var hoverTargets = 'a, button, .tilt, input, textarea, .theme-toggle';
    document.addEventListener('mouseover', function(e){
      if (e.target.closest(hoverTargets)) ring.classList.add('hovering');
    });
    document.addEventListener('mouseout', function(e){
      if (e.target.closest(hoverTargets)) ring.classList.remove('hovering');
    });
  })();

  // ===== MAGNETIC BUTTONS (desktop only) =====
  (function(){
    var canHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canHover || reduceMotion || typeof gsap === 'undefined') return;

    var targets = document.querySelectorAll('.btn, .btn-call, .theme-toggle');
    targets.forEach(function(el){
      var moveX = gsap.quickTo(el, 'x', { duration:.4, ease:'power3.out' });
      var moveY = gsap.quickTo(el, 'y', { duration:.4, ease:'power3.out' });
      var strength = 0.4;

      el.addEventListener('mousemove', function(e){
        var rect = el.getBoundingClientRect();
        var relX = e.clientX - (rect.left + rect.width / 2);
        var relY = e.clientY - (rect.top + rect.height / 2);
        moveX(relX * strength);
        moveY(relY * strength);
      });
      el.addEventListener('mouseleave', function(){
        moveX(0);
        moveY(0);
      });
    });
  })();

  // ===== WHATSAPP PRE-FILLED MESSAGE (editable, not auto-sent) =====
  var WA_MESSAGE = "Bonjour, j'ai visité le site d'Asael Pharma et j'aimerais avoir davantage d'informations. Merci d'avance pour votre retour.";
  document.querySelectorAll('.wa-link').forEach(function(link){
    var base = link.getAttribute('href').split('?')[0];
    var text = link.getAttribute('data-wa-text') || WA_MESSAGE;
    link.setAttribute('href', base + '?text=' + encodeURIComponent(text));
  });

  // ===== THEME TOGGLE BUTTON =====
  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn){
    themeBtn.addEventListener('click', function(){
      var html = document.documentElement;
      var current = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      try { localStorage.setItem('asael-theme', next); } catch(e){}
    });
  }

  // ===== SCROLL PROGRESS BAR =====
  var progressBar = document.getElementById('scrollProgress');
  window.addEventListener('scroll', function(){
    var h = document.documentElement;
    var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progressBar.style.width = scrolled + '%';
  }, { passive: true });

  // ===== DESKTOP TILT ON CARDS =====
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    document.addEventListener('mousemove', function(e){
      var el = e.target.closest('.tilt');
      document.querySelectorAll('.tilt.tilting').forEach(function(t){
        if (t !== el) { t.classList.remove('tilting'); t.style.transform = ''; }
      });
      if (!el) return;
      var rect = el.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      el.classList.add('tilting');
      el.style.transform = 'perspective(700px) rotateX(' + (y * -6) + 'deg) rotateY(' + (x * 8) + 'deg) translateY(-3px)';
    }, { passive: true });
    document.addEventListener('mouseleave', function(){
      document.querySelectorAll('.tilt.tilting').forEach(function(t){
        t.classList.remove('tilting'); t.style.transform = '';
      });
    });
  }

  // ===== DYNAMIC SCROLL REVEAL (GSAP) =====
  // "Clock card" glow still needs its .in class for the CSS-driven glow fade
  (function(){
    var clockCard = document.querySelector('.clock-card');
    if (clockCard && 'IntersectionObserver' in window){
      var glowIO = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting){ entry.target.classList.add('in'); glowIO.unobserve(entry.target); }
        });
      }, { threshold: 0.3 });
      glowIO.observe(clockCard);
    }
  })();

  (function(){
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    var isDesktop = window.matchMedia('(min-width: 861px)').matches;

    // Section headings: mask-line reveal with a snappier, more dramatic swish
    gsap.utils.toArray('.mask-inner').forEach(function(el){
      gsap.fromTo(el,
        { yPercent: 115, rotate: isDesktop ? 3 : 0 },
        {
          yPercent: 0, rotate: 0,
          duration: isDesktop ? 0.9 : 0.55,
          ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none play reverse' }
        }
      );
    });

    // Paragraphs under headings
    gsap.utils.toArray('.reveal-fade').forEach(function(el){
      gsap.fromTo(el,
        { autoAlpha: 0, y: isDesktop ? 30 : 16 },
        {
          autoAlpha: 1, y: 0,
          duration: isDesktop ? 0.75 : 0.48,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none play reverse' }
        }
      );
    });

    // Generic section blocks — arrive with real presence, not a gentle fade
    gsap.utils.toArray('.reveal').forEach(function(el){
      gsap.fromTo(el,
        { autoAlpha: 0, y: isDesktop ? 90 : 40, scale: isDesktop ? 0.9 : 0.95, filter: 'blur(6px)' },
        {
          autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)',
          duration: isDesktop ? 0.9 : 0.55,
          ease: 'back.out(1.6)',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none play reverse' }
        }
      );
    });

    // Grids — each card flies in from alternating sides with a little rotation and pop
    gsap.utils.toArray('.reveal-children').forEach(function(container){
      var children = container.children;
      if (!children.length) return;
      gsap.fromTo(children,
        {
          autoAlpha: 0,
          x: function(i){ return isDesktop ? (i % 2 === 0 ? -70 : 70) : 0; },
          y: isDesktop ? 36 : 26,
          scale: 0.82,
          rotate: function(i){ return isDesktop ? (i % 2 === 0 ? -6 : 6) : 0; }
        },
        {
          autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0,
          duration: isDesktop ? 0.8 : 0.48,
          ease: 'back.out(1.8)',
          stagger: isDesktop ? 0.14 : 0.08,
          scrollTrigger: { trigger: container, start: 'top 85%', toggleActions: 'play none play reverse' }
        }
      );
    });

    window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
  })();