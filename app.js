const form = document.getElementById('calcForm');
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
    const bill = +document.getElementById('bill').value || 0;
    const roof = +document.getElementById('roof').value || 0;
    const capacity = Math.max(1, Math.min(roof ? roof / 100 : bill / 1200, bill / 600));
    const generation = Math.round(capacity * 120);
    const savings = Math.round(Math.min(bill * .75, generation * 7));
    const payback = capacity <= 3 ? '4–6 years' : '5–7 years';
    result.innerHTML = `<div class="result-grid"><span>Indicative system size<b>${capacity.toFixed(1)} kW</b></span><span>Est. monthly generation<b>~${generation} units</b></span><span>Potential monthly savings<b>~₹${savings.toLocaleString('en-IN')}</b></span></div><small>Indicative payback: ${payback}. Site survey required for a final recommendation.</small>`;
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
