(function() {
  // --- Inject CSS ---
  const style = document.createElement('style');
  style.innerHTML = `
    #bunji-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      font-family: 'Inter', sans-serif;
    }

    #bunji-toggle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--primary, #cc0000);
      color: white;
      border: none;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      cursor: pointer;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease;
    }

    #bunji-toggle:hover {
      transform: scale(1.1);
    }

    #bunji-chat-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 350px;
      height: 500px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 5px 25px rgba(0,0,0,0.2);
      display: none;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #e0e0e0;
    }

    #bunji-chat-window.open {
      display: flex;
    }

    .bunji-header {
      background: var(--primary, #cc0000);
      color: white;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      font-weight: 700;
    }

    .bunji-header-close {
      background: transparent;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
    }

    .bunji-messages {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #f8fafc;
    }

    .bunji-bubble {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.4;
      white-space: pre-wrap;
    }

    .bunji-bubble.bunji {
      background: #e2e8f0;
      color: #1e293b;
      align-self: flex-start;
      border-bottom-left-radius: 0;
    }

    .bunji-bubble.user {
      background: var(--primary, #cc0000);
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 0;
    }

    .bunji-input-area {
      display: flex;
      border-top: 1px solid #e0e0e0;
      padding: 10px;
      background: white;
    }

    #bunji-input {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 20px;
      padding: 10px 15px;
      outline: none;
      font-size: 14px;
    }

    #bunji-send {
      background: var(--primary, #cc0000);
      color: white;
      border: none;
      border-radius: 20px;
      padding: 0 15px;
      margin-left: 10px;
      cursor: pointer;
      font-weight: 600;
    }

    .bunji-typing {
      font-size: 12px;
      color: #94a3b8;
      padding: 0 15px 10px;
      display: none;
    }
  `;
  document.head.appendChild(style);

  // --- Inject HTML ---
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'bunji-widget';
  widgetContainer.innerHTML = `
    <button id="bunji-toggle">💬</button>
    <div id="bunji-chat-window">
      <div class="bunji-header">
        <span>🤖 Bunji - Virtual Advisor</span>
        <button class="bunji-header-close" id="bunji-close">×</button>
      </div>
      <div class="bunji-messages" id="bunji-messages"></div>
      <div class="bunji-typing" id="bunji-typing">Bunji is typing...</div>
      <div class="bunji-input-area">
        <input type="text" id="bunji-input" placeholder="Type your message..." autocomplete="off">
        <button id="bunji-send">Send</button>
      </div>
    </div>
  `;
  document.body.appendChild(widgetContainer);

  // --- Logic ---
  const toggleBtn = document.getElementById('bunji-toggle');
  const chatWindow = document.getElementById('bunji-chat-window');
  const closeBtn = document.getElementById('bunji-close');
  const messagesContainer = document.getElementById('bunji-messages');
  const inputEl = document.getElementById('bunji-input');
  const sendBtn = document.getElementById('bunji-send');
  const typingEl = document.getElementById('bunji-typing');

  // Random session id
  const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
  let isInit = false;
  
  const LOCAL_API = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:' 
      ? 'http://localhost:5001/api/chat/message'
      : 'https://app-server-maaw.onrender.com/api/chat/message';

  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.add('open');
    toggleBtn.style.display = 'none';
    if (!isInit) {
      // Trigger initial greeting by sending a hidden 'hello'
      isInit = true;
      sendMessage('hello', true);
    }
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.remove('open');
    toggleBtn.style.display = 'flex';
  });

  function appendMessage(text, role) {
    const bubble = document.createElement('div');
    bubble.className = 'bunji-bubble ' + role;
    bubble.textContent = text;
    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async function sendMessage(text, isHidden = false) {
    if (!text.trim()) return;
    
    if (!isHidden) {
      appendMessage(text, 'user');
      inputEl.value = '';
    }

    typingEl.style.display = 'block';

    try {
      const resp = await fetch(LOCAL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text })
      });
      const data = await resp.json();
      typingEl.style.display = 'none';

      if (resp.ok && data.reply) {
        appendMessage(data.reply, 'bunji');
      } else {
        appendMessage('❌ Sorry, I am having trouble connecting to my brain right now.', 'bunji');
      }
    } catch (e) {
      typingEl.style.display = 'none';
      appendMessage('❌ Error connecting to server.', 'bunji');
    }
  }

  sendBtn.addEventListener('click', () => sendMessage(inputEl.value));
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage(inputEl.value);
  });

  // Allow external buttons to open and send messages to Bunji
  window.addEventListener('open-bunji', (e) => {
    chatWindow.classList.add('open');
    toggleBtn.style.display = 'none';
    
    // Initialize if not already initialized, waiting for the hidden hello to process
    if (!isInit) {
      isInit = true;
      sendMessage('hello', true).then(() => {
        if (e.detail && e.detail.message) {
          sendMessage(e.detail.message);
        }
      });
    } else {
      if (e.detail && e.detail.message) {
        sendMessage(e.detail.message);
      }
    }
  });

})();
