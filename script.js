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
    var leaflet = document.querySelector('.box-leaflet');
    var blister = document.querySelector('.box-blister');
    var capsule = document.querySelector('.box-capsule');
    var caption = document.querySelector('.box-scene-caption');
    if (!lid || !leaflet || !blister || !capsule || !caption) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isDesktop = window.matchMedia('(min-width: 861px)').matches;

    if (reduceMotion){
      gsap.set(lid, { y:-90, rotate:-7, opacity:.15 });
      gsap.set([leaflet, blister, capsule], { opacity:1, scale:1, x:0, y:0 });
      gsap.set(caption, { opacity:1, y:0 });
      return;
    }

    if (isDesktop){
      var tl = gsap.timeline({
        scrollTrigger:{
          trigger:'#boxScene',
          start:'top top',
          end:'+=1300',
          scrub:0.8,
          pin:true
        }
      });
      tl.to(lid,     { y:-90, rotate:-7, opacity:.15, duration:1, ease:'power2.out' }, 0)
        .to(blister, { x:-150, y:-10, rotate:-6, opacity:1, scale:1, duration:1, ease:'power2.out' }, 0.15)
        .to(leaflet, { x:150, y:10, rotate:6, opacity:1, scale:1, duration:1, ease:'power2.out' }, 0.15)
        .to(capsule, { y:-80, opacity:1, scale:1, rotate:-4, duration:1, ease:'power2.out' }, 0.3)
        .to(caption, { opacity:1, y:0, duration:.6 }, 0.65);
    } else {
      ScrollTrigger.create({
        trigger:'#boxScene',
        start:'top 65%',
        once:true,
        onEnter:function(){
          var tl = gsap.timeline();
          tl.to(lid,     { y:-50, rotate:-6, opacity:.18, duration:.6, ease:'power2.out' })
            .to(blister, { x:-70, y:-4, rotate:-5, opacity:1, scale:1, duration:.5, ease:'power2.out' }, '-=0.3')
            .to(leaflet, { x:70, y:6, rotate:5, opacity:1, scale:1, duration:.5, ease:'power2.out' }, '<')
            .to(capsule, { y:-40, opacity:1, scale:1, rotate:-3, duration:.5, ease:'power2.out' }, '-=0.3')
            .to(caption, { opacity:1, y:0, duration:.5 }, '-=0.2');
        }
      });
    }

    window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
  })();

  var nav = document.getElementById('siteNav');
  window.addEventListener('scroll', function(){
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

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

  var revealEls = document.querySelectorAll('.reveal, .reveal-fade, .reveal-children, .mask');
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });
  revealEls.forEach(function(el){ io.observe(el); });