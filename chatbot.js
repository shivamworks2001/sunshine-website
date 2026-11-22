(() => {
  const base = new URL('.', document.currentScript.src);
  const widget = document.createElement('aside');
  widget.className = 'solar-chat';
  widget.innerHTML = `<button class="chat-launch" aria-label="Open Sunshine Solar Assistant" aria-expanded="false" aria-controls="solar-chat-panel">
      <img class="chat-mascot" src="${new URL('assets/chat-mascot-transparent.png', base).href}" alt="" width="80" height="80" decoding="async">
      <span class="chat-greeting"><strong>Hi! 👋</strong><span>How can I help you?</span></span>
    </button>
    <section id="solar-chat-panel" class="chat-panel" hidden aria-label="Sunshine Solar Assistant">
      <header><div><strong>Sunshine Solar Assistant</strong><small>AI guidance · Confirm details with our team</small></div><button class="chat-close" aria-label="Close chat">×</button></header>
      <div class="chat-log" role="log" aria-live="polite" aria-relevant="additions"></div>
      <div class="chat-suggestions"><button>What solar solutions do you offer?</button><button>How do I request a quote?</button></div>
      <p class="chat-notice">Messages are sent to OpenAI for AI replies. Avoid sharing sensitive information. This chat does not submit an enquiry.</p>
      <form class="chat-compose"><label for="solar-question">Your solar question</label><div><input id="solar-question" maxlength="1600" required autocomplete="off" placeholder="Ask a solar question…"><button type="submit">Send</button></div></form>
      <a class="chat-contact">Contact our team ↗</a>
    </section>`;
  document.body.append(widget);
  const panel = widget.querySelector('.chat-panel'), launch = widget.querySelector('.chat-launch'), input = widget.querySelector('input'), form = widget.querySelector('form'), log = widget.querySelector('.chat-log');
  widget.querySelector('.chat-contact').href = new URL('contact/index.html', base).href;
  const history = [];
  let busy = false;
  function message(text, role) { const p = document.createElement('p'); p.className = `chat-message ${role}`; p.textContent = text; log.append(p); log.scrollTop = log.scrollHeight; return p; }
  message('Hello! Ask about solar solutions, the installation process or requesting a quote. For a confirmed proposal, please contact our team.', 'assistant');
  function toggle(open) { panel.hidden = !open; launch.setAttribute('aria-expanded', String(open)); (open ? input : launch).focus(); }
  launch.onclick = () => toggle(panel.hidden);
  widget.querySelector('.chat-close').onclick = () => toggle(false);
  widget.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) toggle(false); });
  widget.querySelectorAll('.chat-suggestions button').forEach(button => { button.onclick = () => { if (!busy) { input.value = button.textContent; form.requestSubmit(); } }; });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const question = input.value.trim();
    if (busy || !question) return;
    busy = true; input.value = ''; form.querySelector('button').disabled = true;
    message(question, 'user');
    const pending = message('Thinking…', 'assistant');
    try {
      const response = await fetch(new URL('api/chat', base), {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({messages:[...history.slice(-8), {role:'user', content:question}]}), signal:AbortSignal.timeout(25000)});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chat is unavailable. Please contact our team.');
      pending.remove(); message(data.reply, 'assistant');
      history.push({role:'user',content:question},{role:'assistant',content:data.reply.slice(0,1600)});
    } catch (error) { pending.remove(); message(error.name === 'TimeoutError' ? 'The reply took too long. Please try again.' : error.message.includes('JSON') ? 'Chat is available on our Vercel website. Please contact our team by email.' : error.message, 'assistant'); }
    finally { busy = false; form.querySelector('button').disabled = false; }
  });
})();
