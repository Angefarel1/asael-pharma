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
        setTimeout(function(){ if (loader) loader.remove(); }, hideDuration);
      }, loaderDuration);
    }
  })();

  var nav = document.getElementById('siteNav');
  window.addEventListener('scroll', function(){
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

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