// Shore Fire Studio — storefront v0.2 "The living waterline"
{
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  // ---- 3. Bricks ----
  const bricks = $('.bricks');
  const pattern = 'fwnnfnnwnfnnnfwnnnfnwnnnf';
  let k = 0;
  bricks.innerHTML = bricks.dataset.bricks.split('|').map(line =>
    `<div class="brow">${[...line].map(ch => {
      const c = ch === ' ' ? 'e' : ({ f: 'f', w: 'w' }[pattern[k % pattern.length]] || '');
      const out = `<span class="brick ${c}" style="--dl:${(k * 0.045).toFixed(2)}s">${ch === ' ' ? '' : ch}</span>`;
      k++; return out;
    }).join('')}</div>`).join('');

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
  $$('[data-cut], .bricks, .stairs, .mani').forEach(el => {
    if (el.closest('.pun') || el.closest('.menu')) return;
    io.observe(el);
  });

  // ---- 6. Sure fire / Shore fire: the pun keeps swapping ----
  const puns = $$('.pun-word');
  let pi = 0;
  const punIO = new IntersectionObserver(es => {
    if (es[0].isIntersecting) { reveal(puns[0]); punIO.disconnect(); }
  }, { threshold: 0.3 });
  punIO.observe($('.pun'));
  if (!calm) setInterval(() => {
    if (!puns[0].classList.contains('in') && !puns[1].classList.contains('in')) return;
    puns[pi].classList.remove('in'); pi = 1 - pi;
    reveal(puns[pi], 500);
  }, 3200);
  else puns[1].style.display = 'none';

  // ---- 7. Jolts: now and then a visible headline shudders along its cut ----
  if (!calm) setInterval(() => {
    const vis = $$('[data-cut].in').filter(el => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; });
    if (!vis.length) return;
    const el = vis[Math.floor(Math.random() * vis.length)];
    glitch(el);
  }, innerWidth < 700 ? 3600 : 2000);

  // ---- 8. Live loop: waterline, hero drift, sliding rows, depth gauge ----
  const r1 = $('.r1'), r2 = $('.r2'), local = $('.local'), depth = $('#depth');
  let px = 0.5, py = 0.5, kick = 0, kx = 0;
  if (!calm) setInterval(() => {
    kick = (Math.random() > .5 ? 1 : -1) * (4 + Math.random() * 5); kx = (Math.random() - .5) * 60;
    hero.classList.add('tear'); setTimeout(() => { kick = 0; kx = 0; hero.classList.remove('tear'); }, 160 + Math.random() * 120);
  }, innerWidth < 700 ? 6000 : 4200);
  addEventListener('pointermove', e => { px = e.clientX / innerWidth; py = e.clientY / innerHeight; }, { passive: true });
  const small = () => innerWidth < 700;
  function frame(t) {
    const s = t / 1000, sy = scrollY;
    // waterline breathes and leans toward the pointer
    const baseL = small() ? 43 : 62, baseR = small() ? 35 : 42;
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
      r1.style.transform = `translateX(${-p * 40}%)`;
      r2.style.transform = `translateX(${-30 + p * 30}%)`;
    }
    const max = document.documentElement.scrollHeight - innerHeight;
    depth.textContent = String(Math.round(sy / max * 100)).padStart(3, '0');
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
      cur.style.transform = `translate(${cx - 13}px,${cy - 13}px)`;
      requestAnimationFrame(follow);
    })();
    document.addEventListener('pointerover', e => cur.classList.toggle('hov', !!e.target.closest('a,button,summary,.ticket,[data-cut],.brick,input,select,textarea')));
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

  // ---- 12. Touch paging: drag a little way toward the next scene and it glides there ----
  if (matchMedia('(pointer: coarse)').matches) {
    const root = document.documentElement;
    root.classList.add('touch-paging');
    const scenes = $$('.scene');
    const maxY = () => root.scrollHeight - innerHeight;
    const stops = () => {
      const t = scenes.map(el => Math.round(el.getBoundingClientRect().top + scrollY));
      t.push(maxY());                                    // the footer
      return [...new Set(t.map(v => Math.min(v, maxY())))].sort((a, b) => a - b);
    };
    const nearest = (y, list) => list.reduce((best, v) => Math.abs(v - y) < Math.abs(best - y) ? v : best, list[0]);
    let anim = null, y0 = 0, s0 = 0, t0 = 0, lastY = 0, lastT = 0, vel = 0, dragging = false;
    const stopAnim = () => { if (anim) cancelAnimationFrame(anim); anim = null; };
    const glide = to => {
      stopAnim();
      const from = scrollY, d = to - from, dur = Math.min(700, 380 + Math.abs(d) * 0.25), st = performance.now();
      const ease = x => 1 - Math.pow(1 - x, 4);
      const step = now => {
        const k = Math.min(1, (now - st) / dur);
        scrollTo({ top: from + d * ease(k), behavior: 'instant' });
        anim = k < 1 ? requestAnimationFrame(step) : null;
      };
      anim = requestAnimationFrame(step);
    };
    const blocked = e => !menu.hidden || e.target.closest('select, textarea');
    addEventListener('touchstart', e => {
      if (blocked(e) || e.touches.length > 1) { dragging = false; return; }
      stopAnim(); dragging = true;
      y0 = lastY = e.touches[0].clientY; s0 = scrollY; t0 = lastT = performance.now(); vel = 0;
    }, { passive: true });
    addEventListener('touchmove', e => {
      if (!dragging) return;
      e.preventDefault();
      const y = e.touches[0].clientY, now = performance.now();
      vel = (lastY - y) / Math.max(1, now - lastT); lastY = y; lastT = now;
      scrollTo({ top: Math.max(0, Math.min(maxY(), s0 + (y0 - y))), behavior: 'instant' });
    }, { passive: false });
    addEventListener('touchend', () => {
      if (!dragging) return; dragging = false;
      const list = stops(), anchor = nearest(s0, list), i = list.indexOf(anchor);
      const moved = scrollY - anchor, need = innerHeight * 0.1;
      let target = anchor;
      if (moved > need || vel > 0.3) target = list[Math.min(list.length - 1, i + 1)];
      else if (moved < -need || vel < -0.3) target = list[Math.max(0, i - 1)];
      glide(target);
    });
    // in-page links (menu, buttons) glide too
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const el = $(a.getAttribute('href')); if (!el) return;
      e.preventDefault(); setTimeout(() => glide(Math.min(maxY(), Math.round(el.getBoundingClientRect().top + scrollY))), 30);
    }));
  }

  $('#yr').textContent = new Date().getFullYear();
}
