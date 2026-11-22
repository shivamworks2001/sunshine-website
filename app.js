const form = document.getElementById('calcForm');
const chatScript = document.createElement('script');
chatScript.src = new URL('chatbot.js', document.currentScript.src).href;
document.head.append(chatScript);
// Animate only after intersection; content stays visible if motion is unsupported.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const entranceObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.animate([
        { transform: 'translateY(24px)' },
        { transform: 'translateY(0)' }
      ], { duration: 700, easing: 'cubic-bezier(.2,.7,.2,1)' });
      observer.unobserve(target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => entranceObserver.observe(element));
}
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
    if (quoteForm.classList.contains('contact-form')) {
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
  menuButton.addEventListener('click', () => {
    const isOpen = header.classList.toggle('nav-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });
  document.querySelectorAll('#primary-nav a').forEach((link) => link.addEventListener('click', () => {
    header.classList.remove('nav-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
  }));
}
