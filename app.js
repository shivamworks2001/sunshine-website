const form = document.getElementById('calcForm');
const calculatorDialog = document.getElementById('calculator-dialog');
if (calculatorDialog) {
  let calculatorOpener;
  document.querySelectorAll('[data-open-calculator]').forEach(button => button.addEventListener('click', () => {
    calculatorOpener = button;
    calculatorDialog.showModal();
    document.body.classList.add('calculator-modal-open');
  }));
  calculatorDialog.querySelector('.calculator-close').addEventListener('click', () => calculatorDialog.close());
  calculatorDialog.addEventListener('click', event => {
    const bounds = calculatorDialog.getBoundingClientRect();
    if (event.target === calculatorDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) calculatorDialog.close();
  });
  calculatorDialog.addEventListener('close', () => {
    document.body.classList.remove('calculator-modal-open');
    calculatorOpener?.focus();
  });
}
const chatScript = document.createElement('script');
chatScript.src = new URL('chatbot.js', document.currentScript.src).href;
document.head.append(chatScript);
// Replay entrances after a complete viewport exit; keep all content visible by default.
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window) || !Element.prototype.animate || motion.matches) return;
  const active = new Set();
  const entered = new WeakSet();
  const running = new WeakMap();
  const cards = '.product-card, .solution-card, .resource, .gallery-grid figure, .project-card, .why-list article, .process li, .testimonial-pending, .contact-detail';
  const selectors = `${cards}, main h1, main h2, main h3, main .eyebrow, main p, main .hero-actions, main .hero-note, main .about-image, main .hero-image, main .scope-list, main .brand-mark, main .section-heading .text-link`;
  const candidates = Array.from(document.querySelectorAll(selectors)).filter(element => {
    if (element.closest('dialog, form, .calc-result, .solar-chat, [data-no-motion]')) return false;
    // Animate cards as a unit so their children never move twice.
    if (element.parentElement.closest(cards)) return false;
    return true;
  });
  const observer = new IntersectionObserver(entries => {
    let order = 0;
    entries.forEach(({target, isIntersecting, intersectionRatio}) => {
      if (!isIntersecting) {
        entered.delete(target);
        running.get(target)?.cancel();
        return;
      }
      if (intersectionRatio < .18 || entered.has(target)) return;
      entered.add(target);
      if (motion.matches || target.contains(document.activeElement)) return;
      const isImage = target.matches('.about-image, .hero-image, .gallery-grid figure');
      const distance = matchMedia('(max-width: 640px)').matches ? 22 : 36;
      const animation = target.animate([
        { opacity: .12, transform: `translateY(${distance}px)${isImage ? ' scale(.98)' : ''}` },
        { opacity: 1, transform: 'translateY(0) scale(1)' }
      ], { duration: isImage ? 1100 : 900, delay: Math.min(order++ * 70, 210), easing: 'cubic-bezier(.22,.65,.3,1)', fill: 'backwards' });
      active.add(animation);
      running.set(target, animation);
      animation.onfinish = () => active.delete(animation);
      animation.oncancel = () => active.delete(animation);
    });
  }, { threshold: [0, .18], rootMargin: '0px' });
  candidates.forEach(element => observer.observe(element));
  motion.addEventListener('change', event => {
    if (event.matches) { observer.disconnect(); active.forEach(animation => animation.cancel()); active.clear(); }
  });
  document.addEventListener('focusin', event => {
    active.forEach(animation => { if (animation.effect?.target?.contains(event.target)) animation.cancel(); });
  });
})();
const result = document.getElementById('calcResult');
if (form && result) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = id => Number(document.getElementById(id).value);
    const bill = value('bill'), units = value('units'), roof = value('roof');
    const yieldRate = value('yield'), unitCost = value('unitCost'), selfUse = value('selfUse') / 100;
    const capacity = Math.floor(Math.min(units / yieldRate, roof / 108) * 10) / 10;
    if (capacity < 0.1) { result.textContent = 'The entered roof area or consumption is too small for this preliminary estimate. Please contact our team for a site assessment.'; return; }
    const generation = capacity * yieldRate;
    const tariff = bill * 0.9 / units;
    const savingsLow = Math.min(generation * 0.85 * selfUse, units) * tariff;
    const savingsHigh = Math.min(generation * 1.15 * selfUse, units) * tariff;
    const lowCost = capacity * unitCost * 0.8, highCost = capacity * unitCost * 1.2;
    const number = n => Math.round(n).toLocaleString('en-IN');
    result.replaceChildren();
    const heading = document.createElement('p');
    heading.textContent = `${document.getElementById('property').value} · ${document.getElementById('location').value.trim()} — indicative on-grid estimate`;
    result.append(heading);
    const grid = document.createElement('div'); grid.className = 'result-grid';
    const metrics = [
      ['Estimated system capacity', `${capacity.toFixed(1)} kW`],
      ['Monthly generation', `${number(generation * .85)}–${number(generation * 1.15)} units`],
      ['Potential monthly savings', `₹${number(savingsLow)}–₹${number(savingsHigh)}`],
      ['Indicative installation cost', `₹${number(lowCost)}–₹${number(highCost)}`],
      ['Simple payback', `${(lowCost / (12 * savingsHigh)).toFixed(1)}–${(highCost / (12 * savingsLow)).toFixed(1)} years`],
      ['Roof area required', `${number(capacity * 108)} sq. ft.`]
    ];
    metrics.forEach(([label, value]) => { const cell = document.createElement('span'); cell.textContent = label; const bold = document.createElement('b'); bold.textContent = value; cell.append(bold); grid.append(cell); });
    result.append(grid);
    const note = document.createElement('p');
    note.textContent = `${roof / 108 < units / yieldRate ? 'Roof area limits the suggested capacity. ' : ''}Uses an estimated energy tariff of ₹${tariff.toFixed(2)}/unit after a 10% fixed-charge allowance. Assumed yield: ${yieldRate} units/kW/month; on-site use: ${Math.round(selfUse * 100)}%; base installed cost: ₹${number(unitCost)}/kW. Not a quotation or guarantee. Actual costs, tariffs, shading and seasonal output require a site survey. No subsidy or export revenue included.`;
    result.append(note);
    const link = document.createElement('a'); link.className = 'text-link'; link.href = 'contact/index.html'; link.textContent = 'Request a site assessment →'; result.append(link);
  });
}
const quoteForm = document.getElementById('quoteForm');
if (quoteForm) {
  quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (quoteForm.classList.contains('contact-form') || quoteForm.hasAttribute('data-email-enquiry')) {
      const details = new FormData(quoteForm);
      const message = ['Solar enquiry', '', ...Array.from(details, ([key, value]) => `${key}: ${value}`)].join('\n');
      window.location.href = `mailto:solarengineering@yahoo.com?subject=${encodeURIComponent('Solar enquiry — Sunshine Engineering')}&body=${encodeURIComponent(message)}`;
      quoteForm.querySelector('.form-response').textContent = 'Your email app has been requested. Please send the draft there to complete your enquiry. If it does not open, email solarengineering@yahoo.com directly.';
      return;
    }
    event.currentTarget.querySelector('.form-response').textContent = 'Thank you — your enquiry is ready for the Sunshine Engineering team.';
  });
}
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
const menuButton = document.querySelector('.menu');
const header = document.querySelector('.site-header');
if (menuButton && header) {
  const setMenu = (isOpen) => {
    header.classList.toggle('nav-open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  };
  menuButton.addEventListener('click', () => setMenu(!header.classList.contains('nav-open')));
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('nav-open')) { setMenu(false); menuButton.focus(); }
  });
  header.addEventListener('focusout', event => { if (!header.contains(event.relatedTarget)) setMenu(false); });
  matchMedia('(max-width: 1440px)').addEventListener('change', () => setMenu(false));
  document.querySelectorAll('#primary-nav a').forEach(link => link.addEventListener('click', () => setMenu(false)));
}

// Automatically move customer stories; keep all content available without motion.
(() => {
  const track = document.querySelector('.testimonial-track');
  if (!track) return;
  const cards = [...track.querySelectorAll('.customer-story')];
  if (!cards.length) return;
  const belt = document.createElement('div');
  belt.className = 'testimonial-belt';
  cards.forEach(card => belt.append(card));
  cards.forEach(card => {
    const copy = card.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.setAttribute('inert', '');
    copy.dataset.storyClone = '';
    belt.append(copy);
  });
  track.append(belt);
  track.setAttribute('aria-label', 'Five customer experiences; moving cards pause when focused');
  const measure = () => {
    const gap = parseFloat(getComputedStyle(belt).gap) || 0;
    const distance = cards.reduce((total, card) => total + card.getBoundingClientRect().width + gap, 0);
    belt.style.setProperty('--testimonial-distance', `${distance}px`);
  };
  new ResizeObserver(measure).observe(track);
  measure();
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'testimonial-motion';
  button.textContent = 'Pause testimonials';
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => {
    const paused = track.classList.toggle('is-paused');
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Play testimonials' : 'Pause testimonials';
  });
  track.after(button);
})();
