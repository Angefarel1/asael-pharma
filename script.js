(function(){
    var html = document.documentElement;
    var isDesktop = window.matchMedia('(min-width: 861px)').matches;
    html.classList.add(isDesktop ? 'device-desktop' : 'device-mobile');

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

  // ===== REVIEWS (star rating + local storage) =====
  (function(){
    var STORAGE_KEY = 'asael_reviews_v1';
    var starSVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17.6l-6.1 3.4 1.5-6.8-5.2-4.7 6.9-.7z"/></svg>';

    function getReviews(){
      try{
        var raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      }catch(e){ return []; }
    }
    function saveReviews(list){
      try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }catch(e){}
    }
    function starsMarkup(count, cls){
      var out = '';
      for (var i = 1; i <= 5; i++){
        out += '<span class="' + (i <= count ? 'star-icon-fill' : 'star-icon-empty') + '">' + starSVG + '</span>';
      }
      return out;
    }
    function formatDate(iso){
      var d = new Date(iso);
      return d.toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
    }

    function render(){
      var reviews = getReviews();
      var scoreEl = document.getElementById('reviewsScore');
      var avgStarsEl = document.getElementById('reviewsStarsAvg');
      var metaEl = document.getElementById('reviewsMeta');
      var listEl = document.getElementById('reviewsList');

      if (reviews.length === 0){
        scoreEl.textContent = '—';
        avgStarsEl.innerHTML = starsMarkup(0);
        metaEl.textContent = "Aucun avis pour l'instant";
        listEl.innerHTML = '<div class="reviews-empty">Aucun avis pour le moment. Soyez la première personne à partager votre expérience.</div>';
        return;
      }

      var sum = 0;
      reviews.forEach(function(r){ sum += r.rating; });
      var avg = sum / reviews.length;

      scoreEl.textContent = avg.toFixed(1);
      avgStarsEl.innerHTML = starsMarkup(Math.round(avg));
      metaEl.textContent = reviews.length + (reviews.length > 1 ? ' avis' : ' avis');

      var sorted = reviews.slice().sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
      listEl.innerHTML = sorted.map(function(r){
        var safeName = (r.name || 'Anonyme').replace(/</g,'&lt;');
        var safeText = (r.text || '').replace(/</g,'&lt;');
        return '<div class="review-card">' +
          '<div class="rc-head"><span class="rc-name">' + safeName + '</span><span class="rc-date">' + formatDate(r.date) + '</span></div>' +
          '<div class="rc-stars">' + starsMarkup(r.rating) + '</div>' +
          (safeText ? '<p>' + safeText + '</p>' : '') +
        '</div>';
      }).join('');
    }

    var selectedRating = 0;
    var picker = document.getElementById('starPicker');
    var buttons = picker ? picker.querySelectorAll('button') : [];

    function paintPicker(value){
      buttons.forEach(function(btn){
        var v = parseInt(btn.getAttribute('data-value'), 10);
        btn.classList.toggle('filled', v <= value);
      });
    }
    buttons.forEach(function(btn){
      btn.addEventListener('click', function(){
        selectedRating = parseInt(btn.getAttribute('data-value'), 10);
        paintPicker(selectedRating);
      });
      btn.addEventListener('mouseenter', function(){
        paintPicker(parseInt(btn.getAttribute('data-value'), 10));
      });
    });
    if (picker){
      picker.addEventListener('mouseleave', function(){ paintPicker(selectedRating); });
    }

    var submitBtn = document.getElementById('reviewSubmit');
    var feedbackEl = document.getElementById('reviewFeedback');
    if (submitBtn){
      submitBtn.addEventListener('click', function(){
        if (selectedRating === 0){
          feedbackEl.textContent = "Merci de choisir une note avant d'envoyer votre avis.";
          feedbackEl.classList.add('show');
          return;
        }
        var name = document.getElementById('reviewName').value.trim();
        var text = document.getElementById('reviewText').value.trim();
        var reviews = getReviews();
        reviews.push({ name: name, text: text, rating: selectedRating, date: new Date().toISOString() });
        saveReviews(reviews);

        document.getElementById('reviewName').value = '';
        document.getElementById('reviewText').value = '';
        selectedRating = 0;
        paintPicker(0);

        feedbackEl.textContent = 'Merci ! Votre avis a bien été enregistré.';
        feedbackEl.classList.add('show');
        render();
      });
    }

    render();
  })();

  var revealEls = document.querySelectorAll('.reveal');
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });
  revealEls.forEach(function(el){ io.observe(el); });