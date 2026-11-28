// Shore Fire Studio — storefront v0.2 "The living waterline"
{
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- 0. Lock scene height to the screen ----
  // Phones change the viewport height when the keyboard opens and when the address bar
  // slides; if scenes followed every change the page would jump. So scenes use a --screen
  // height that ignores the keyboard and small address-bar wobbles, but always resyncs on
  // rotation, real resizes, and when the page becomes visible again (phones can report odd
  // sizes while waking up, so we measure again once things settle).
  {
    const rootEl = document.documentElement;
    let w = innerWidth, h = innerHeight;
    const sane = () => innerWidth > 200 && innerHeight > 300 && !document.hidden;
    const set = () => { rootEl.style.setProperty('--screen', h + 'px'); dispatchEvent(new Event('screenchange')); };
    set();
    const typingNow = () => { const a = document.activeElement; return a && a.matches('input, select, textarea'); };
    const check = (force) => {
      if (!sane()) return;
      if (innerWidth !== w) { w = innerWidth; h = innerHeight; set(); return; }   // rotation / window resize
      if (typingNow() && !force) return;                                          // keyboard: ignore
      const d = innerHeight - h;
      if (force ? d !== 0 : Math.abs(d) > 120) { h = innerHeight; set(); }       // real change, not the address bar
    };
    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => check(false), 300); });
    const resync = () => { clearTimeout(rt); rt = setTimeout(() => check(true), 450); };
    document.addEventListener('visibilitychange', () => { if (!document.hidden) resync(); });
    addEventListener('pageshow', resync);
    addEventListener('orientationchange', resync);
  }

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---- 1. The cut: split every [data-cut] into a top and bottom half ----
  $$('[data-cut]').forEach(el => {
    const html = el.innerHTML, txt = el.textContent;
    el.innerHTML = `<span class="sr">${txt}</span><span class="g1" aria-hidden="true">${html}</span><span class="g2" aria-hidden="true">${html}</span><span class="ct" aria-hidden="true">${html}</span><span class="cb" aria-hidden="true">${html}</span>`;
  });

  // ---- 2. Hero: clone the type layer for the water side ----
  const hero = $('.hero'), layerA = $('.hero-layer.a');
  const layerB = layerA.cloneNode(true);
  layerB.className = 'hero-layer b';
  layerB.setAttribute('aria-hidden', 'true');
  layerB.querySelector('h1').removeAttribute('id');
  layerA.after(layerB);

  // Water glints
  const gl = $('.glints');
  for (let i = 0; i < 14; i++) {
    const g = document.createElement('i');
    g.style.cssText = `left:${Math.random() * 92}%;top:${66 + Math.random() * 32}%;width:${12 + Math.random() * 40}px;animation-delay:${Math.random() * 5}s;animation-duration:${4 + Math.random() * 4}s`;
    gl.appendChild(g);
  }

  // ---- 4. Scatter letters in "Say hel— lo." ----
  $$('[data-scatter]').forEach(el => { el.innerHTML = [...el.textContent].map(c => `<i>${c}</i>`).join(''); });
  const hello = $('.hello');
  if (!calm) {
    hello.addEventListener('pointermove', e => {
      $$('i', hello).forEach(l => {
        const r = l.getBoundingClientRect(), dx = r.left + r.width / 2 - e.clientX, dy = r.top + r.height / 2 - e.clientY;
        const d = Math.hypot(dx, dy), f = Math.max(0, 1 - d / 260);
        l.style.transform = `translate(${dx / d * f * 26 || 0}px,${dy / d * f * 26 || 0}px) rotate(${f * (dx > 0 ? 8 : -8)}deg)`;
      });
    });
    hello.addEventListener('pointerleave', () => $$('i', hello).forEach(l => l.style.transform = ''));
  }

  // ---- Glitch helpers ----
  const glitch = el => { if (calm) return; el.classList.remove('glitch'); void el.offsetWidth; el.classList.add('glitch'); setTimeout(() => el.classList.remove('glitch'), 520); };
  const reveal = (el, delay = 0) => setTimeout(() => {
    el.classList.add('in');
    if (el.matches('[data-cut]')) { setTimeout(() => glitch(el), 120); setTimeout(() => glitch(el), 900); }
  }, delay);

  // ---- 5. Reveal on scroll ----
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
  }), { threshold: 0.2, rootMargin: '0px 0px -5% 0px' });
  $$('[data-cut], .stairs, .mani').forEach(el => {
    if (el.closest('.pun') || el.closest('.menu') || el.closest('.slide:not(.is-on)')) return;
    io.observe(el);
  });

  // ---- 7. Jolts: now and then a visible headline shudders along its cut ----
  if (!calm) setInterval(() => {
    const vis = $$('[data-cut].in').filter(el => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; });
    if (!vis.length) return;
    const el = vis[Math.floor(Math.random() * vis.length)];
    glitch(el);
  }, innerWidth < 700 ? 3600 : 2000);

  // ---- 8. Live loop: waterline, hero drift, sliding rows, depth gauge ----
  const r1 = $('.r1'), r2 = $('.r2'), local = $('.local'), depth = $('#depth');
  // place-name rows: two identical halves so the marquee loops seamlessly
  [r1, r2].forEach(r => { const t = r.dataset.phrase.repeat(4); r.innerHTML = `<span class="rt"><span>${t}</span><span>${t}</span></span>`; });
  let px = 0.5, py = 0.5, kick = 0, kx = 0;
  if (!calm) setInterval(() => {
    kick = (Math.random() > .5 ? 1 : -1) * (4 + Math.random() * 5); kx = (Math.random() - .5) * 60;
    hero.classList.add('tear'); setTimeout(() => { kick = 0; kx = 0; hero.classList.remove('tear'); }, 160 + Math.random() * 120);
  }, innerWidth < 700 ? 6000 : 4200);
  addEventListener('pointermove', e => { px = e.clientX / innerWidth; py = e.clientY / innerHeight; }, { passive: true });
  // v0.7: aim the resting waterline through SITES / that at every size, so the colour change
  // always happens inside the headline. Slope (L - R, in % of hero height) is set per band.
  let baseL = 62, baseR = 42;
  const aimWater = () => {
    const hr = hero.getBoundingClientRect();
    const w2 = $('.w2', layerA).getBoundingClientRect(), w3 = $('.w3', layerA).getBoundingClientRect();
    if (!hr.height || !w2.height) return;
    const wide = innerWidth >= 700 && innerWidth / innerHeight >= 1.25;
    const slope = innerWidth < 700 ? 8 : wide ? 20 : 12;
    const x = (w2.left + Math.min(w2.right, innerWidth)) / 2;               // middle of SITES on screen
    const y = ((w2.top + w2.bottom) / 2 + (w3.top + w3.bottom) / 2) / 2 - hr.top; // between SITES and that
    baseL = y / hr.height * 100 + slope * x / innerWidth;
    baseR = baseL - slope;
  };
  // v0.13: safety net for every window shape. If the headline would touch the copy, the
  // buttons or the header, shrink it until it doesn't; if it's already at its smallest,
  // let the hero grow taller instead of overlapping.
  const fitHero = () => {
    if (document.hidden || innerHeight < 300 || innerWidth < 200) return;
    const ctasEl = $('.ctas');
    hero.style.removeProperty('--f'); hero.style.removeProperty('height');
    ctasEl.style.removeProperty('top'); ctasEl.style.removeProperty('bottom');
    const hw = $('.hw', layerA), pad = 18;
    const R = el => el.getBoundingClientRect();
    const words = () => ['.w1', '.w2', '.w3', '.w4'].map(c => { const r = R($(c, layerA)); return { left: r.left, right: Math.min(r.right, innerWidth), top: r.top, bottom: r.bottom }; });
    const hits = (a, b) => !(a.right + pad <= b.left || b.right + pad <= a.left || a.bottom + pad <= b.top || b.bottom + pad <= a.top);
    const overlapY = (a, b) => Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) + pad;
    // 1. buttons go under the copy if they'd collide with it
    const placeCtas = () => {
      const hp = R($('.hero-sub .hp')), ct = R(ctasEl);
      if (hits(hp, ct)) { ctasEl.style.top = (hp.bottom - R(hero).top + 22) + 'px'; ctasEl.style.bottom = 'auto'; }
    };
    // 2. how badly the headline touches the header, copy or buttons
    const clash = () => {
      const w = words(), c = [R($('.hero-sub .hs')), R($('.hero-sub .hp')), R(ctasEl)], hdr = R($('.top')).bottom;
      let worst = 0;
      w.forEach(a => c.forEach(b => { if (hits(a, b)) worst = Math.max(worst, overlapY(a, b)); }));
      const below = w[0].top - R(hero).top;                      // measured within the hero, wherever we're scrolled
      if (below < hdr + 8) worst = Math.max(worst, hdr + 8 - below);
      return worst;
    };
    placeCtas();
    let fs = parseFloat(getComputedStyle(hw).fontSize), n = 0;
    while (clash() > 0 && fs > 44 && n++ < 40) {
      fs *= 0.94; hero.style.setProperty('--f', fs.toFixed(1) + 'px');
      ctasEl.style.removeProperty('top'); ctasEl.style.removeProperty('bottom'); placeCtas();
    }
    // 3. last resort: let the hero grow so nothing overlaps or falls off its bottom
    const hr = R(hero), lowest = Math.max(R(ctasEl).bottom, ...words().map(r => r.bottom));
    const extra = Math.max(clash(), lowest + 28 - hr.bottom);
    if (extra > 0) hero.style.height = (hero.offsetHeight + Math.min(extra, innerHeight * 0.35)) + 'px';
  };
  const refit = () => { fitHero(); aimWater(); };
  refit();
  if (document.fonts) document.fonts.ready.then(refit);
  // re-fit only after the locked screen height has been updated (it fires 'screenchange'),
  // plus a late safety pass after any resize settles
  let aimT;
  addEventListener('screenchange', () => { clearTimeout(aimT); aimT = setTimeout(refit, 30); });
  addEventListener('resize', () => { clearTimeout(aimT); aimT = setTimeout(refit, 450); });
  addEventListener('orientationchange', () => setTimeout(refit, 600));
  addEventListener('pageshow', e => { if (e.persisted) refit(); });
  if (document.fonts) document.fonts.addEventListener('loadingdone', () => { clearTimeout(aimT); aimT = setTimeout(refit, 30); });
  function frame(t) {
    const s = t / 1000, sy = scrollY;
    // waterline breathes and leans toward the pointer
    const l = kick + baseL + Math.sin(s * 0.5) * 2.5 + (py - 0.5) * 6 - sy * 0.02;
    const r = -kick * .6 + baseR + Math.sin(s * 0.37 + 1.3) * 2.5 + (py - 0.5) * 6 - (px - 0.5) * 6 - sy * 0.035;
    hero.style.setProperty('--l', l.toFixed(2) + '%');
    hero.style.setProperty('--r', r.toFixed(2) + '%');
    hero.style.setProperty('--d1', (Math.sin(s * 0.4) * 14 + sy * -0.15 + kx).toFixed(1));
    hero.style.setProperty('--d2', (Math.sin(s * 0.33 + 2) * -18 + sy * 0.25).toFixed(1));
    // local rows slide in opposite directions with scroll: the halves of the S
    const lr = local.getBoundingClientRect();
    const p = (innerHeight - lr.top) / (innerHeight + lr.height);
    if (p > -0.2 && p < 1.2) {
      r1.style.setProperty('--sx', (-p * 12).toFixed(2) + 'vw');
      r2.style.setProperty('--sx', (p * 12).toFixed(2) + 'vw');
    }
    const max = document.documentElement.scrollHeight - innerHeight;
    if (depth) depth.textContent = String(Math.round(sy / max * 100)).padStart(3, '0');
    if (!calm) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  if (calm) addEventListener('scroll', () => requestAnimationFrame(frame), { passive: true });

  // ---- 9. Cursor ----
  const cur = $('#cur');
  if (matchMedia('(pointer:fine)').matches) {
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function follow() {
      cx += (tx - cx) * 0.25; cy += (ty - cy) * 0.25;
      cur.style.transform = `translate(${cx - 14}px,${cy - 14}px)`;
      requestAnimationFrame(follow);
    })();
    document.addEventListener('pointerover', e => cur.classList.toggle('hov', !!e.target.closest('a,button,summary,label,input,select,textarea,[role=button]')));
  }

  // ---- 10. Menu ----
  const btn = $('#menuBtn'), menu = $('#menu');
  const setMenu = open => {
    menu.hidden = !open; btn.setAttribute('aria-expanded', open); btn.textContent = open ? 'Close' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
    $$('[data-cut]', menu).forEach((el, i) => {
      el.classList.remove('in');
      if (open) reveal(el, 80 + i * 70);
    });
  };
  btn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  // ---- Strata: put each band's waterline exactly through its name ----
  const strata = $$('.stratum');
  const setLines = () => strata.forEach(st => {
    const n = $('.s-name [data-cut]', st), y = n.offsetTop + $('.s-name', st).offsetTop, h = n.offsetHeight;
    const flip = false;
    st.style.setProperty('--cl', (y + h * (flip ? .42 : .6)) + 'px');
    st.style.setProperty('--cr', (y + h * (flip ? .6 : .42)) + 'px');
  });
  setLines(); addEventListener('resize', setLines); document.fonts && document.fonts.ready.then(setLines);

  // ---- 11. Packages preselect + draft form ----
  const select = $('#package');
  $$('[data-package]').forEach(a => a.addEventListener('click', () => { select.value = a.dataset.package; }));
  const form = $('#quote'), msg = $('.form-msg', form);
  // inputs grow with what's typed, so the sentence stays a sentence
  const fit = el => { const t = el.value || el.placeholder; el.style.width = Math.max(4, t.length * 0.84 + 1).toFixed(1) + 'ch'; };
  $$('input', form).forEach(el => { fit(el); el.addEventListener('input', () => fit(el)); });
  const fitSel = () => { select.style.width = (select.options[select.selectedIndex].text.length * 0.84 + 2).toFixed(1) + 'ch'; };
  fitSel(); select.addEventListener('change', fitSel);
  $$('[data-package]').forEach(a => a.addEventListener('click', fitSel));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(form);
    if (!d.get('name') || !d.get('contact')) { msg.textContent = 'Just need your name and a way to reach you.'; return; }
    // TODO before launch: send to a form service. For now, hand over to the visitor's email app.
    const body = [`Name: ${d.get('name')}`, `Business: ${d.get('business') || '-'}`, `Contact: ${d.get('contact')}`, `Interested in: ${d.get('package')}`, '', d.get('message') || ''].join('\n');
    location.href = `mailto:hello@shorefirestudio.com?subject=${encodeURIComponent('Quote request: ' + d.get('package'))}&body=${encodeURIComponent(body)}`;
    msg.textContent = 'Your email app should open with everything filled in. If not, email hello@shorefirestudio.com.';
  });

  // ---- FAQ: one open at a time, animated open and shut ----
  const faqs = $$('.qs details');
  const shut = d => {
    const a = $('.ans', d);
    if (calm) { d.open = false; return; }
    d.classList.add('closing');
    a.animate([{ height: a.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' })
      .onfinish = () => { d.open = false; d.classList.remove('closing'); };
  };
  const show = d => {
    d.open = true;
    if (calm) return;
    const a = $('.ans', d);
    a.animate([{ height: '0px', opacity: 0 }, { height: a.scrollHeight + 'px', opacity: 1 }], { duration: 480, easing: 'cubic-bezier(.2,.8,.2,1)' });
  };
  faqs.forEach(d => $('summary', d).addEventListener('click', e => {
    e.preventDefault();
    if (d.classList.contains('closing')) return;
    if (d.open) { shut(d); return; }
    faqs.forEach(o => { if (o !== d && o.open) shut(o); });
    show(d);
  }));

  // ---- Work reel ----
  const reel = $('.reel'), slidesEls = $$('.slide', reel), dots = $$('.w-dot', reel), wNow = $('#wNow');
  // split each screenshot into a top and bottom half
  $$('.shot', reel).forEach(sh => {
    const e = $('.empty-in', sh);
    if (e) { const w = document.createElement('div'); w.className = 'empty-wrap'; e.before(w); w.appendChild(e); }
    sh.insertAdjacentHTML('beforeend', '<div class="wipe"><i></i><i></i></div>');
  });
  let wi = 0, auto = null, touched = false;
  // A full-width wipe covers the whole Work scene, the content swaps underneath, then it uncovers.
  // Forward (and looping last → first) sweeps left to right; back (and looping first → last) right to left.
  const wipeEl = document.createElement('div');
  wipeEl.className = 'w-wipe'; wipeEl.setAttribute('aria-hidden', 'true'); wipeEl.innerHTML = '<i></i><i></i>';
  $('#work').appendChild(wipeEl);
  let busy = false;
  const swap = (n, dir) => {
    reel.style.setProperty('--off', dir > 0 ? '45%' : '-45%');
    const out = slidesEls[wi], inn = slidesEls[n];
    const outName = $('.w-name [data-cut]', out), inName = $('.w-name [data-cut]', inn);
    outName.classList.remove('in');
    reel.style.setProperty('--off', dir > 0 ? '-45%' : '45%');
    inn.classList.remove('is-on'); void inn.offsetWidth;
    reel.style.setProperty('--off', dir > 0 ? '45%' : '-45%');
    out.classList.remove('is-on'); inn.classList.add('is-on');
    dots[wi].classList.remove('on'); dots[n].classList.add('on');
    wi = n; wNow.textContent = String(n + 1).padStart(2, '0');
    if (calm) { reveal(inName, 0); return; }
    // Everything lands in place instantly while covered, so the uncover shows the finished slide
    reel.classList.add('snap'); inName.classList.add('in'); void reel.offsetWidth;
    requestAnimationFrame(() => requestAnimationFrame(() => reel.classList.remove('snap')));
    setTimeout(() => glitch(inName), 520);
  };
  const go = (n, dir) => {
    n = (n + slidesEls.length) % slidesEls.length;
    if (n === wi || busy) return;
    dir = dir || (n > wi ? 1 : -1);
    if (calm) { swap(n, dir); return; }
    busy = true;
    // Full width, but only as tall as the band holding the text and screenshots
    const wr = $('#work').getBoundingClientRect(), sr = $('.slides', reel).getBoundingClientRect();
    wipeEl.style.top = (sr.top - wr.top - 12) + 'px'; wipeEl.style.height = (sr.height + 24) + 'px';
    wipeEl.className = 'w-wipe ' + (dir > 0 ? 'to-right' : 'to-left');
    void wipeEl.offsetWidth; wipeEl.classList.add('run');
    slidesEls[n].querySelectorAll('img').forEach(i => i.decode && i.decode().catch(() => {}));
    setTimeout(() => swap(n, dir), 430);                       // fully covered: swap underneath
    setTimeout(() => { wipeEl.classList.remove('run'); busy = false; }, 1000);
  };
  const stopAuto = () => { touched = true; clearInterval(auto); };
  $('.w-next', reel).addEventListener('click', () => { stopAuto(); go(wi + 1, 1); });
  $('.w-prev', reel).addEventListener('click', () => { stopAuto(); go(wi - 1, -1); });
  dots.forEach((d, i) => d.addEventListener('click', () => { stopAuto(); go(i); }));
  reel.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { stopAuto(); go(wi + 1, 1); }
    if (e.key === 'ArrowLeft') { stopAuto(); go(wi - 1, -1); }
  });
  // reveal the first name when the scene arrives; auto-advance while it's on screen
  new IntersectionObserver(es => {
    const vis = es[0].isIntersecting;
    if (vis) reveal($('.w-name [data-cut]', slidesEls[wi]));
    clearInterval(auto);
    if (vis && !touched && !calm) auto = setInterval(() => go(wi + 1, 1), 6000);
  }, { threshold: 0.6 }).observe($('#work'));
  // horizontal swipes on the reel (works with the vertical paging below)
  let sx = 0, sy = 0;
  reel.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  reel.addEventListener('touchend', e => {
    const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) { stopAuto(); go(wi + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); }
  }, { passive: true });

  // ---- 12. Touch paging ----
  // Short scenes snap: drag ~10% (or flick) and it glides to the next.
  // Tall scenes scroll freely, and only hand over once you pull past their top or bottom edge.
  // While a form field is focused, paging steps aside and the field is kept in view above the keyboard.
  if (matchMedia('(pointer: coarse)').matches) {
    const root = document.documentElement;
    root.classList.add('touch-paging');
    const scenes = $$('.scene, .svc').filter(el => getComputedStyle(el).scrollSnapAlign !== 'none');
    const maxY = () => root.scrollHeight - innerHeight;
    const segs = () => {
      const m = maxY();
      const list = scenes.map(el => {
        const t = Math.round(el.getBoundingClientRect().top + scrollY);
        return { t: Math.min(t, m), end: Math.min(m, Math.max(t, t + el.offsetHeight - innerHeight)) };
      });
      const last = list[list.length - 1];
      if (m > last.end + 1) list.push({ t: m, end: m });        // the footer
      return list;
    };
    const segIndex = (y, list) => {
      let best = 0, bd = Infinity;
      list.forEach((g, i) => {
        const d = y < g.t ? g.t - y : y > g.end ? y - g.end : 0;
        if (d < bd) { bd = d; best = i; }
      });
      return best;
    };
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const typing = () => { const a = document.activeElement; return a && a.matches('input, select, textarea'); };

    let anim = null, y0 = 0, x0 = 0, axis = 'y', s0 = 0, lastY = 0, lastT = 0, vel = 0, dragging = false;
    const stopAnim = () => { if (anim) cancelAnimationFrame(anim); anim = null; };
    const glide = (to, dur) => {
      stopAnim();
      const from = scrollY, d = to - from;
      if (Math.abs(d) < 1) return;
      dur = dur || Math.min(700, 380 + Math.abs(d) * 0.25);
      const st = performance.now(), ease = x => 1 - Math.pow(1 - x, 4);
      const step = now => {
        const k = Math.min(1, (now - st) / dur);
        scrollTo({ top: from + d * ease(k), behavior: 'instant' });
        anim = k < 1 ? requestAnimationFrame(step) : null;
      };
      anim = requestAnimationFrame(step);
    };

    addEventListener('touchstart', e => {
      dragging = false;
      if (!menu.hidden || e.touches.length > 1 || typing() || e.target.closest('input, select, textarea')) return;
      stopAnim(); dragging = true;
      y0 = lastY = e.touches[0].clientY; x0 = e.touches[0].clientX; axis = e.target.closest('.reel') ? '' : 'y'; s0 = scrollY; lastT = performance.now(); vel = 0;
    }, { passive: true });

    addEventListener('touchmove', e => {
      if (!dragging) return;
      if (!axis) {
        const dx = Math.abs(e.touches[0].clientX - x0), dy = Math.abs(e.touches[0].clientY - y0);
        if (dx < 8 && dy < 8) return;
        axis = dx > dy ? 'x' : 'y';
        if (axis === 'x') { dragging = false; return; }
      }
      e.preventDefault();
      const y = e.touches[0].clientY, now = performance.now();
      vel = vel * 0.6 + ((lastY - y) / Math.max(1, now - lastT)) * 0.4; lastY = y; lastT = now;
      scrollTo({ top: clamp(s0 + (y0 - y), 0, maxY()), behavior: 'instant' });
    }, { passive: false });

    addEventListener('touchend', () => {
      if (!dragging) return; dragging = false;
      const list = segs(), i = segIndex(s0, list), g = list[i], y = scrollY, need = innerHeight * 0.1;
      if (y > g.end + 0.5) {                                   // pulled past the bottom edge
        const next = list[i + 1];
        glide(next && (y - g.end > need || vel > 0.3) ? next.t : g.end);
      } else if (y < g.t - 0.5) {                              // pulled past the top edge
        const prev = list[i - 1];
        glide(prev && (g.t - y > need || vel < -0.3) ? prev.end : g.t);
      } else if (g.end > g.t) {                                // inside a tall scene: free scroll with a little momentum
        glide(clamp(y + vel * 320, g.t, g.end), 600);
      }
    });

    // In-page links glide too
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const el = $(a.getAttribute('href')); if (!el) return;
      e.preventDefault(); setTimeout(() => glide(Math.min(maxY(), Math.round(el.getBoundingClientRect().top + scrollY))), 30);
    }));

    // Form on phones: we own the scrolling, so moving between fields is one smooth glide.
    // Taps and the keyboard's Next key focus fields without the browser's own jump.
    const vv = window.visualViewport;
    const fields = $$('input, select', form);
    const keepInView = () => {
      const f = document.activeElement;
      if (!f || !f.matches('input, select, textarea')) return;
      const r = f.getBoundingClientRect(), h = vv ? vv.height : innerHeight, top = vv ? vv.offsetTop : 0;
      const y = r.top - top;
      if (y > h * 0.14 && r.bottom - top < h * 0.62) return;      // already comfortably in view
      glide(clamp(scrollY + (y - h * 0.3), 0, maxY()), 450);
    };
    let kv;
    const soon = (ms = 120) => { clearTimeout(kv); kv = setTimeout(keepInView, ms); };
    const focusField = f => {
      f.focus({ preventScroll: true });
      if (f.setSelectionRange && f.type !== 'email') { const n = f.value.length; try { f.setSelectionRange(n, n); } catch (_) {} }
      soon(60);
    };
    fields.forEach((f, i) => {
      if (f.tagName === 'INPUT') {
        f.setAttribute('enterkeyhint', i === fields.length - 1 ? 'done' : 'next');
        // tap: focus without the browser's scroll-into-view jump
        f.addEventListener('touchend', e => {
          if (document.activeElement === f) return;
          e.preventDefault(); focusField(f);
        });
      }
      f.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const next = fields[i + 1];
        if (next) focusField(next); else f.blur();
      });
    });
    form.addEventListener('input', () => soon(60));
    // keyboard opening or closing changes the visible area: re-check once it settles
    if (vv) vv.addEventListener('resize', () => soon(200));
    // when the keyboard is really gone (no field focused for a moment), settle back onto the scene
    form.addEventListener('focusout', () => setTimeout(() => {
      if (typing()) return;
      const sc = form.closest('.scene'), t = Math.round(sc.getBoundingClientRect().top + scrollY);
      glide(clamp(scrollY, t, Math.min(maxY(), Math.max(t, t + sc.offsetHeight - innerHeight))));
    }, 600));
  }

  // ---- 13. Desktop paging: one wheel gesture = one scene; tall scenes scroll freely to their edge ----
  if (!matchMedia('(pointer: coarse)').matches && !calm) {
    const root = document.documentElement;
    root.classList.add('js-paging');
    const maxY = () => root.scrollHeight - innerHeight;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const targets = () => $$('.scene, .svc').filter(el => getComputedStyle(el).scrollSnapAlign !== 'none');
    const segs = () => {
      const m = maxY();
      const list = targets().map(el => {
        const t = Math.round(el.getBoundingClientRect().top + scrollY);
        return { t: Math.min(t, m), end: Math.min(m, Math.max(t, t + el.offsetHeight - innerHeight)) };
      });
      const last = list[list.length - 1];
      if (m > last.end + 1) list.push({ t: m, end: m });
      return list;
    };
    const segIndex = (y, list) => { let b = 0, bd = Infinity; list.forEach((g, i) => { const d = y < g.t - 1 ? g.t - y : y > g.end + 1 ? y - g.end : 0; if (d < bd) { bd = d; b = i; } }); return b; };
    let anim = null, busyUntil = 0, lastWheel = 0, pull = 0;
    const glide = to => {
      if (anim) cancelAnimationFrame(anim);
      const from = scrollY, d = to - from; if (Math.abs(d) < 1) return;
      const dur = Math.min(900, 520 + Math.abs(d) * 0.15), st = performance.now(), ease = x => 1 - Math.pow(1 - x, 4);
      busyUntil = st + dur;
      const step = now => { const k = Math.min(1, (now - st) / dur); scrollTo({ top: from + d * ease(k), behavior: 'instant' }); anim = k < 1 ? requestAnimationFrame(step) : null; };
      anim = requestAnimationFrame(step);
    };
    const page = dir => {
      const list = segs(), i = segIndex(scrollY, list), g = list[i];
      if (dir > 0) { const n = list[i + 1]; if (n) glide(n.t); }
      else { const pv = list[i - 1]; if (pv) glide(pv.end); }
    };
    addEventListener('wheel', e => {
      if (!menu.hidden || e.ctrlKey) return;                 // menu open or pinch-zoom: leave alone
      const a = document.activeElement; if (a && a.matches('textarea')) return;
      e.preventDefault();
      const now = performance.now(), quiet = now - lastWheel > 220; lastWheel = now;
      if (now < busyUntil) return;                            // mid-glide: swallow trackpad momentum
      const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
      const list = segs(), i = segIndex(scrollY, list), g = list[i];
      if (g.end > g.t + 1) {                                  // tall scene: scroll inside it first
        const inside = clamp(scrollY + dy, g.t, g.end);
        if (Math.abs(inside - scrollY) > 0.5) { scrollTo({ top: inside, behavior: 'instant' }); pull = 0; return; }
      }
      if (quiet) pull = 0;
      pull += dy;
      if (Math.abs(pull) > 40) { const dir = Math.sign(pull); pull = 0; page(dir); }
    }, { passive: false });
    addEventListener('keydown', e => {
      if (!menu.hidden || (document.activeElement && document.activeElement.matches('input, select, textarea'))) return;
      const down = ['PageDown', 'ArrowDown', ' '].includes(e.key) && !e.shiftKey, up = ['PageUp', 'ArrowUp'].includes(e.key) || (e.key === ' ' && e.shiftKey);
      if (e.key === 'Home') { e.preventDefault(); glide(0); return; }
      if (e.key === 'End') { e.preventDefault(); glide(maxY()); return; }
      if (!down && !up) return;
      const list = segs(), g = list[segIndex(scrollY, list)];
      if (g.end > g.t + 1 && ((down && scrollY < g.end - 1) || (up && scrollY > g.t + 1))) return;   // native scroll inside a tall scene
      e.preventDefault(); if (performance.now() >= busyUntil) page(down ? 1 : -1);
    });
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const el = $(a.getAttribute('href')); if (!el) return;
      e.preventDefault(); setTimeout(() => glide(Math.min(maxY(), Math.round(el.getBoundingClientRect().top + scrollY))), 30);
    }));
  }

  $('#yr').textContent = new Date().getFullYear();
}
