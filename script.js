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
      var hideDuration = isDesktop ? 900 : 550;
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

    if (!lid || !caption || !items.length) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isDesktop = window.matchMedia('(min-width: 861px)').matches;

    if (reduceMotion){
      gsap.set(lid, { y:-90, rotate:-7, opacity:.15 });
      items.forEach(function(it){
        gsap.set(it.el, { opacity:1, scale:it.scale, x:it.x, y:it.y, rotate:it.rotate });
      });
      gsap.set(caption, { opacity:1, y:0 });
      return;
    }

    if (isDesktop){
      var tl = gsap.timeline({
        scrollTrigger:{
          trigger:'#boxScene',
          start:'top top',
          end:'+=1700',
          scrub:0.8,
          pin:true
        }
      });
      tl.to(lid, { y:-90, rotate:-7, opacity:.15, duration:1, ease:'power2.out' }, 0);
      items.forEach(function(it, i){
        tl.to(it.el, {
          x: it.x, y: it.y, rotate: it.rotate, scale: it.scale, opacity: 1,
          duration: 1, ease: 'power2.out'
        }, 0.1 + i * 0.06);
      });
      tl.to(caption, { opacity:1, y:0, duration:.6 }, 0.95);
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
          tl.to(caption, { opacity:1, y:0, duration:.5 }, '-=0.15');
        }
      });
    }

    window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
  })();

  var nav = document.getElementById('siteNav');
  window.addEventListener('scroll', function(){
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

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
      ringX = gsap.quickTo(ring, 'x', { duration:0.45, ease:'power3.out' });
      ringY = gsap.quickTo(ring, 'y', { duration:0.45, ease:'power3.out' });
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

  // ===== WHATSAPP PRE-FILLED MESSAGE (editable, not auto-sent) =====
  var WA_MESSAGE = "Bonjour, j'ai visité le site d'Asael Pharma et j'aimerais avoir davantage d'informations. Merci d'avance pour votre retour.";
  document.querySelectorAll('.wa-link').forEach(function(link){
    var base = link.getAttribute('href').split('?')[0];
    link.setAttribute('href', base + '?text=' + encodeURIComponent(WA_MESSAGE));
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
          duration: isDesktop ? 1.1 : 0.65,
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
          duration: isDesktop ? 0.9 : 0.55,
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
          duration: isDesktop ? 1.1 : 0.65,
          ease: 'back.out(1.5)',
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
          duration: isDesktop ? 0.95 : 0.55,
          ease: 'back.out(1.7)',
          stagger: isDesktop ? 0.14 : 0.08,
          scrollTrigger: { trigger: container, start: 'top 85%', toggleActions: 'play none play reverse' }
        }
      );
    });

    window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
  })();