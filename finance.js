// Maharashtra individual-household central CFA. Reviewed against official sources 2026-11-22.
// Recheck sources before changing reviewedOn; stale rules stop producing estimates.
const subsidyRules = { reviewedOn: '2026-11-22', reviewDays: 90, firstRate: 30000, nextRate: 18000, cap: 78000 };
function subsidyAmount(kw) { return Math.min(subsidyRules.cap, Math.min(kw, 2) * subsidyRules.firstRate + Math.max(0, Math.min(kw - 2, 1)) * subsidyRules.nextRate); }
function loanPayment(principal, annualRate, months) {
  const rate = annualRate / 1200;
  return rate === 0 ? principal / months : principal * rate / (1 - Math.pow(1 + rate, -months));
}
if (typeof document !== 'undefined') {
  const money = n => '₹' + Math.round(n).toLocaleString('en-IN');
  document.getElementById('subsidyForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget), result = document.getElementById('subsidyResult');
    if (Date.now() - Date.parse(subsidyRules.reviewedOn) > subsidyRules.reviewDays * 86400000) { result.textContent = 'These scheme rules need a fresh review. Please confirm current rates and eligibility on the official portal; an estimate is temporarily unavailable.'; return; }
    if (data.get('household') !== 'yes' || data.get('grid') !== 'yes' || data.get('roof') !== 'yes' || data.get('previous') !== 'no') { result.textContent = 'A separate eligibility review is needed. This tool cannot estimate assistance for your answers. This is not an official rejection; check with your DISCOM or the national portal.'; return; }
    result.textContent = `Indicative central assistance: ${money(subsidyAmount(Number(data.get('capacity'))))}. Your answers pass this preliminary screen only. Approval depends on current scheme rules, compliant equipment, registered vendor, documentation and DISCOM verification. This is not a sanctioned subsidy or an upfront discount.`;
  });
  document.getElementById('emiForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget), result = document.getElementById('emiResult');
    const principal = Number(data.get('cost')) - Number(data.get('deposit')), months = Number(data.get('months'));
    if (principal < 0) { result.textContent = 'Your upfront payment cannot exceed the quotation.'; return; }
    if (principal === 0) { result.textContent = 'No loan required with this upfront payment. EMI and interest: ₹0.'; return; }
    const payment = loanPayment(principal, Number(data.get('rate')), months);
    result.textContent = `Loan principal: ${money(principal)} · Indicative monthly EMI: ${money(payment)} · Total interest: ${money(payment * months - principal)} · Total loan repayment: ${money(payment * months)}. Upfront payment is separate. Actual lender terms may differ.`;
  });
}
if (typeof module !== 'undefined') module.exports = {subsidyAmount, loanPayment};
