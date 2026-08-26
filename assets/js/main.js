/* ==========================================================================
   JCA — site scripts
   Vanilla JS, no dependencies. Every block bails out early if the markup it
   drives is not on the current page, so this one file is safe to load on all.
   ========================================================================== */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Header: condense on scroll
     ------------------------------------------------------------------ */
  (function stickyHeader() {
    var header = document.getElementById('siteHeader');
    if (!header) return;

    var update = function () {
      header.classList.toggle('is-stuck', window.scrollY > 40);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
  })();

  /* ------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------ */
  (function mobileNav() {
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('nav');
    if (!toggle || !nav) return;

    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setOpen(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) setOpen(false);
    });
  })();

  /* ------------------------------------------------------------------
     Hero slider
     ------------------------------------------------------------------ */
  (function heroSlider() {
    var hero = document.querySelector('[data-slider]');
    if (!hero) return;

    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero__slide'));
    var dotsWrap = hero.querySelector('.hero__dots');
    var prev = hero.querySelector('.hero__arrow--prev');
    var next = hero.querySelector('.hero__arrow--next');
    if (slides.length < 2) return;

    var index = 0;
    var timer = null;
    var DELAY = 6500;

    var dots = slides.map(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', function () { go(i); restart(); });
      if (dotsWrap) dotsWrap.appendChild(dot);
      return dot;
    });

    function go(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
        slide.setAttribute('aria-hidden', String(i !== index));
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      if (reducedMotion) return;
      timer = window.setInterval(function () { go(index + 1); }, DELAY);
    }

    function stop() {
      window.clearInterval(timer);
      timer = null;
    }

    function restart() { stop(); start(); }

    if (prev) prev.addEventListener('click', function () { go(index - 1); restart(); });
    if (next) next.addEventListener('click', function () { go(index + 1); restart(); });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    hero.addEventListener('focusin', stop);
    hero.addEventListener('focusout', start);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stop(); } else { start(); }
    });

    // Touch swipe
    var startX = null;
    hero.addEventListener('touchstart', function (e) {
      startX = e.changedTouches[0].clientX;
    }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var delta = e.changedTouches[0].clientX - startX;
      if (Math.abs(delta) > 50) { go(delta < 0 ? index + 1 : index - 1); restart(); }
      startX = null;
    }, { passive: true });

    go(0);
    start();
  })();

  /* ------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------ */
  (function scrollReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    items.forEach(function (el) { observer.observe(el); });
  })();

  /* ------------------------------------------------------------------
     Animated stat counters
     ------------------------------------------------------------------ */
  (function counters() {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;

    var run = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      if (reducedMotion) { el.textContent = target + suffix; return; }

      var duration = 1400;
      var startTime = null;

      var tick = function (now) {
        if (startTime === null) startTime = now;
        var progress = Math.min((now - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) window.requestAnimationFrame(tick);
      };

      window.requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      nums.forEach(run);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    nums.forEach(function (el) { observer.observe(el); });
  })();

  /* ------------------------------------------------------------------
     Gallery: category filter
     ------------------------------------------------------------------ */
  (function galleryFilter() {
    var filters = document.querySelectorAll('[data-filter]');
    var tiles = document.querySelectorAll('[data-category]');
    if (!filters.length || !tiles.length) return;

    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter');

        filters.forEach(function (b) {
          b.classList.toggle('is-active', b === button);
          b.setAttribute('aria-pressed', String(b === button));
        });

        tiles.forEach(function (tile) {
          var match = value === 'all' || tile.getAttribute('data-category') === value;
          tile.hidden = !match;
        });
      });
    });
  })();

  /* ------------------------------------------------------------------
     Gallery: lightbox
     ------------------------------------------------------------------ */
  (function lightbox() {
    var box = document.getElementById('lightbox');
    if (!box) return;

    var image = box.querySelector('img');
    var caption = box.querySelector('.lightbox__caption');
    var closeBtn = box.querySelector('.lightbox__close');
    var prevBtn = box.querySelector('.lightbox__nav--prev');
    var nextBtn = box.querySelector('.lightbox__nav--next');
    var lastFocused = null;
    var current = 0;

    var visibleTiles = function () {
      return Array.prototype.slice
        .call(document.querySelectorAll('.tile'))
        .filter(function (tile) { return !tile.hidden; });
    };

    function show(i) {
      var tiles = visibleTiles();
      if (!tiles.length) return;
      current = (i + tiles.length) % tiles.length;

      var tile = tiles[current];
      var img = tile.querySelector('img');
      image.src = img.getAttribute('src');
      image.alt = img.getAttribute('alt');
      caption.textContent = tile.getAttribute('data-caption') || img.getAttribute('alt') || '';
    }

    function open(i) {
      lastFocused = document.activeElement;
      show(i);
      box.classList.add('is-open');
      box.setAttribute('aria-hidden', 'false');
      document.body.classList.add('nav-open');
      closeBtn.focus();
    }

    function close() {
      box.classList.remove('is-open');
      box.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('nav-open');
      image.src = '';
      if (lastFocused) lastFocused.focus();
    }

    document.addEventListener('click', function (event) {
      var tile = event.target.closest('.tile');
      if (!tile) return;
      event.preventDefault();
      open(visibleTiles().indexOf(tile));
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { show(current - 1); });
    nextBtn.addEventListener('click', function () { show(current + 1); });

    box.addEventListener('click', function (event) {
      if (event.target === box) close();
    });

    document.addEventListener('keydown', function (event) {
      if (!box.classList.contains('is-open')) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') show(current - 1);
      if (event.key === 'ArrowRight') show(current + 1);
    });
  })();

  /* ------------------------------------------------------------------
     Contact form: validation + Supabase submission

     Posts straight to the PostgREST endpoint with fetch. No client library:
     one INSERT does not justify pulling ~50 KB from a CDN into a site that
     otherwise ships zero dependencies.

     The publishable key below is meant to be public. What protects the data
     is Row Level Security on the table: the anon role holds an INSERT policy
     and nothing else, so this key cannot read, edit or delete a single row.
     ------------------------------------------------------------------ */
  (function contactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var SUPABASE_URL = 'https://hjmvyrkxruywmjcpfpvr.supabase.co';
    var SUPABASE_KEY = 'sb_publishable_aZziZFBJO9Uo4eEZqlG00Q_cLhkVxbv';
    var TABLE = 'contact_submissions';

    var status = form.querySelector('.form__status');
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var phonePattern = /^[\d\s()+.-]{10,}$/;

    function fieldError(input, message) {
      var slot = form.querySelector('#' + input.id + '-error');
      if (slot) slot.textContent = message || '';
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      return !message;
    }

    function validate(input) {
      var value = input.value.trim();

      if (input.required && !value) {
        return fieldError(input, 'This field is required.');
      }
      if (input.type === 'email' && value && !emailPattern.test(value)) {
        return fieldError(input, 'Enter a valid email address.');
      }
      if (input.type === 'tel' && value && !phonePattern.test(value)) {
        return fieldError(input, 'Enter a valid phone number.');
      }
      if (input.tagName === 'TEXTAREA' && value && value.length < 10) {
        return fieldError(input, 'Please add a little more detail.');
      }
      return fieldError(input, '');
    }

    var inputs = Array.prototype.slice.call(
      form.querySelectorAll('input, select, textarea')
    );

    inputs.forEach(function (input) {
      input.addEventListener('blur', function () { validate(input); });
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') validate(input);
      });
    });

    var submitBtn = form.querySelector('button[type="submit"]');
    var submitLabel = submitBtn ? submitBtn.textContent : 'Send Request';

    function setStatus(text, state) {
      status.textContent = text;
      status.className = 'form__status' + (state ? ' is-' + state : '');
    }

    function clearForm() {
      form.reset();
      inputs.forEach(function (input) { fieldError(input, ''); });
    }

    function submitForm() {
      var payload = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        vehicle: document.getElementById('vehicle').value.trim(),
        service: document.getElementById('service').value,
        message: document.getElementById('message').value.trim()
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }
      setStatus('', null);

      fetch(SUPABASE_URL + '/rest/v1/' + TABLE, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          if (response.ok) return null;
          return response.text().then(function (body) {
            throw new Error(response.status + ' ' + body);
          });
        })
        .then(function () {
          clearForm();
          setStatus(
            'Thanks. Your request is in and we will get back to you shortly. ' +
            'Need it sooner? Call or text (678) 898-4249.',
            'ok'
          );
        })
        .catch(function (error) {
          setStatus(
            'We could not send your request just now. Please try again, or call ' +
            'or text us at (678) 898-4249.',
            'error'
          );
          if (window.console) console.error('[contact form]', error);
        })
        .then(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitLabel;
          }
          status.scrollIntoView({ block: 'nearest' });
        });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      status.textContent = '';

      var valid = inputs.map(validate).every(Boolean);

      if (!valid) {
        var firstBad = form.querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
        return;
      }

      submitForm();
    });
  })();

  /* ------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------ */
  (function currentYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  })();
})();
