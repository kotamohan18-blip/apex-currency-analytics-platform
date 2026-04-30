/**
 * InternHub Chatbot Widget
 * Inject into any page with: <script src="/js/chatbot.js"></script>
 * Requires Font Awesome and Tailwind CSS to be loaded.
 */
(function () {
  'use strict';

  // ── Inject Widget HTML ───────────────────────────────────────────────────────
  const widgetHTML = `
    <!-- Floating Chat Button -->
    <button id="chatbotToggleBtn"
      onclick="InternBotWidget.toggle()"
      style="
        position:fixed; bottom:24px; right:24px; z-index:9999;
        width:58px; height:58px;
        background: linear-gradient(135deg, #6b46c1 0%, #4f46e5 100%);
        border:2px solid rgba(255,255,255,0.15);
        border-radius:50%;
        box-shadow: 0 8px 24px rgba(107,70,193,0.55);
        display:flex; align-items:center; justify-content:center;
        cursor:pointer; transition: transform 0.2s, box-shadow 0.2s;
        color:white; font-size:22px;
      "
      onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 12px 30px rgba(107,70,193,0.7)'"
      onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 8px 24px rgba(107,70,193,0.55)'"
      title="Ask InternBot"
    >
      <i id="chatbotBtnIcon" class="fas fa-comment-dots"></i>
    </button>

    <!-- Chat Window -->
    <div id="chatbotWindow" style="
      position:fixed; bottom:96px; right:24px; z-index:9998;
      width:360px; max-height:520px;
      background: rgba(10, 6, 22, 0.96);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius:20px;
      box-shadow: 0 24px 64px rgba(0,0,0,0.7);
      display:flex; flex-direction:column; overflow:hidden;
      transform: scale(0.88) translateY(16px);
      opacity:0; pointer-events:none;
      transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease;
    ">
      <!-- Header -->
      <div style="
        background: linear-gradient(135deg, #553c9a 0%, #3730a3 100%);
        padding: 14px 16px;
        display:flex; align-items:center; justify-content:space-between;
        border-bottom:1px solid rgba(255,255,255,0.08);
      ">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="
            width:36px; height:36px; border-radius:10px;
            background:rgba(255,255,255,0.12);
            display:flex; align-items:center; justify-content:center;
            border:1px solid rgba(255,255,255,0.2);
          ">
            <i class="fas fa-robot" style="color:white; font-size:15px;"></i>
          </div>
          <div>
            <div style="color:white; font-weight:700; font-size:14px; font-family:'Outfit',sans-serif; letter-spacing:0.02em;">InternBot</div>
            <div style="display:flex; align-items:center; gap:5px; margin-top:1px;">
              <div style="width:7px;height:7px;border-radius:50%;background:#4ade80; animation:pulse 2s infinite;"></div>
              <span style="color:rgba(200,180,255,0.8); font-size:10px; text-transform:uppercase; letter-spacing:0.1em; font-family:'Fira Code',monospace;">AI Career Assistant</span>
            </div>
          </div>
        </div>
        <button onclick="InternBotWidget.toggle()" style="
          background:rgba(255,255,255,0.08); border:none; color:rgba(255,255,255,0.6);
          width:28px;height:28px; border-radius:8px; cursor:pointer; font-size:13px;
          display:flex;align-items:center;justify-content:center;
          transition:background 0.2s;
        " onmouseover="this.style.background='rgba(255,255,255,0.18)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Messages -->
      <div id="chatbotMessages" style="
        flex:1; padding:14px; overflow-y:auto; display:flex; flex-direction:column; gap:10px;
        max-height:340px; scroll-behavior:smooth;
        background: rgba(8,3,18,0.6);
      ">
        <!-- Welcome message injected by JS -->
      </div>

      <!-- Input -->
      <div style="
        padding:12px; background:rgba(0,0,0,0.5);
        border-top:1px solid rgba(255,255,255,0.06);
        display:flex; align-items:center; gap:8px;
      ">
        <input id="chatbotInput" type="text"
          placeholder="Ask me anything..."
          onkeypress="if(event.key==='Enter') InternBotWidget.send()"
          style="
            flex:1; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
            color:white; padding:10px 14px; border-radius:12px; font-size:12px;
            outline:none; font-family:'Fira Code',monospace;
            transition:border-color 0.2s;
          "
          onfocus="this.style.borderColor='rgba(139,92,246,0.6)'"
          onblur="this.style.borderColor='rgba(255,255,255,0.1)'"
        >
        <button onclick="InternBotWidget.send()" style="
          width:40px;height:40px; border-radius:12px;
          background:linear-gradient(135deg,#6b46c1,#4f46e5);
          border:none; color:white; cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          font-size:14px; flex-shrink:0;
          transition:transform 0.15s;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>

    <style>
      @keyframes chatbot-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      #chatbotMessages::-webkit-scrollbar { width:4px; }
      #chatbotMessages::-webkit-scrollbar-track { background:transparent; }
      #chatbotMessages::-webkit-scrollbar-thumb { background:rgba(139,92,246,0.4); border-radius:4px; }
      .chatbot-msg-bot a { color:#a78bfa; text-decoration:underline; }
    </style>
  `;

  // Inject into page
  const container = document.createElement('div');
  container.innerHTML = widgetHTML;
  document.body.appendChild(container);

  // ── Widget API ────────────────────────────────────────────────────────────────
  const WIN  = () => document.getElementById('chatbotWindow');
  const MSGS = () => document.getElementById('chatbotMessages');
  const INP  = () => document.getElementById('chatbotInput');
  const ICON = () => document.getElementById('chatbotBtnIcon');

  let isOpen = false;

  // Format text: **bold** and \n → <br>
  function fmt(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#e2d9f3">$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function addBotMsg(html, isError = false) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;justify-content:flex-start;';
    const bubble = document.createElement('div');
    bubble.className = 'chatbot-msg-bot';
    bubble.style.cssText = `
      background: ${isError ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)'};
      border: 1px solid ${isError ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'};
      color: ${isError ? '#fca5a5' : '#d1c4e9'};
      padding:10px 14px; border-radius:14px; border-top-left-radius:4px;
      font-size:12px; line-height:1.7; max-width:88%;
      font-family:'Inter',sans-serif;
    `;
    bubble.innerHTML = fmt(html);
    wrap.appendChild(bubble);
    MSGS().appendChild(wrap);
    MSGS().scrollTop = MSGS().scrollHeight;
    return wrap;
  }

  function addUserMsg(text) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;justify-content:flex-end;';
    const bubble = document.createElement('div');
    bubble.style.cssText = `
      background: linear-gradient(135deg,#553c9a,#3730a3);
      color:white; padding:10px 14px; border-radius:14px; border-top-right-radius:4px;
      font-size:12px; line-height:1.6; max-width:88%;
      font-family:'Inter',sans-serif;
    `;
    bubble.textContent = text;
    wrap.appendChild(bubble);
    MSGS().appendChild(wrap);
    MSGS().scrollTop = MSGS().scrollHeight;
  }

  function addTyping() {
    const wrap = document.createElement('div');
    wrap.id = 'chatbot-typing';
    wrap.style.cssText = 'display:flex;justify-content:flex-start;';
    wrap.innerHTML = `
      <div style="
        background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08);
        padding:10px 16px; border-radius:14px; border-top-left-radius:4px;
        display:flex;gap:4px;align-items:center;
      ">
        <div style="width:6px;height:6px;border-radius:50%;background:#9f7aea;animation:chatbot-pulse 1s infinite 0s;"></div>
        <div style="width:6px;height:6px;border-radius:50%;background:#9f7aea;animation:chatbot-pulse 1s infinite 0.2s;"></div>
        <div style="width:6px;height:6px;border-radius:50%;background:#9f7aea;animation:chatbot-pulse 1s infinite 0.4s;"></div>
      </div>
    `;
    MSGS().appendChild(wrap);
    MSGS().scrollTop = MSGS().scrollHeight;
    return wrap;
  }

  // ── Public Methods ────────────────────────────────────────────────────────────
  window.InternBotWidget = {
    toggle() {
      isOpen = !isOpen;
      const win = WIN();
      if (isOpen) {
        win.style.transform = 'scale(1) translateY(0)';
        win.style.opacity = '1';
        win.style.pointerEvents = 'auto';
        ICON().className = 'fas fa-chevron-down';
        INP().focus();
      } else {
        win.style.transform = 'scale(0.88) translateY(16px)';
        win.style.opacity = '0';
        win.style.pointerEvents = 'none';
        ICON().className = 'fas fa-comment-dots';
      }
    },

    async send() {
      const input = INP();
      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      addUserMsg(text);

      const typingEl = addTyping();

      try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/ai/generate', {
          method: 'POST',
          headers,
          body: JSON.stringify({ prompt: text })
        });
        const data = await res.json();

        typingEl.remove();

        if (res.ok && data.success) {
          addBotMsg(data.text);
        } else {
          addBotMsg('Something went wrong. Please try again.', true);
        }
      } catch (err) {
        typingEl.remove();
        addBotMsg('Network error — please check your connection.', true);
      }
    }
  };

  // Welcome message on load
  document.addEventListener('DOMContentLoaded', function () {
    const welcomes = [
      "👋 Hey! I'm InternBot, your AI career assistant.\n\nAsk me about **internships**, **profile tips**, **how to apply**, or anything else!",
      "🚀 Welcome! I'm here to help you navigate InternHub.\n\nTry: **'How do I apply?'** or **'Resume tips'**",
      "🌟 Hi there! Need help finding the perfect internship?\n\nJust ask me anything — I'm always here!"
    ];
    addBotMsg(welcomes[Math.floor(Math.random() * welcomes.length)]);
  });

})();
