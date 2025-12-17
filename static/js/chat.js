document.addEventListener('DOMContentLoaded', () => {

    // 1. 요소 가져오기
    const chatHistory = document.getElementById('chat-history');
    const chatPrompt = document.getElementById('chat-prompt');
    const chatSubmit = document.getElementById('chat-submit');

    // 2. 토큰 확인 (로그인 안 했으면 쫓아내기)
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login/';
        return;
    }

    // 3. [백엔드 연결] 실제 AI 채팅 API 주소
    // (백엔드 개발자에게 받은 주소로 꼭 수정하세요!)
    const SESSION_ENDPOINT = '/api/career/sessions/'; // POST(생성), GET(목록)
    const sessionIdKey = 'careerSessionId';        // localStorage에 저장할 키


  // --- (0) 유틸 ---
  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  function appendMessage(text, sender, isLoading = false) {
    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble', sender);

    if (isLoading) {
      bubble.classList.add('loading');
      bubble.innerHTML = `
        <p>${text}</p>
        <div class="loader-bar"></div>
        <div class="loader-bar"></div>
        <div class="loader-bar"></div>
      `;
    } else {
      bubble.innerText = text;
    }

    chatHistory.appendChild(bubble);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return bubble;
  }

  async function ensureSessionId() {
    // 1) 로컬에 세션 id가 있으면 그대로 사용
    const saved = localStorage.getItem(sessionIdKey);
    if (saved) return saved;

    // 2) 없으면 새 세션 생성
    const res = await fetch(SESSION_ENDPOINT, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({}), // 현재 백엔드는 바디 없어도 생성됨
    });

    if (res.status === 401 || res.status === 403) {
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login/';
      return null;
    }
    if (!res.ok) throw new Error('세션 생성 실패');

    const data = await res.json();
    const newSessionId = String(data.session_id);
    localStorage.setItem(sessionIdKey, newSessionId);
    return newSessionId;
  }

  async function loadMessages(sessionId) {
    const res = await fetch(`${SESSION_ENDPOINT}${sessionId}/messages/`, {
      method: 'GET',
      headers: authHeaders(),
    });

    if (res.status === 401 || res.status === 403) {
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login/';
      return;
    }
    if (res.status === 404) {
      localStorage.removeItem(sessionIdKey);
      const newId = await ensureSessionId(); // 새 세션 생성
      if (newId) return loadMessages(newId);
      return;
    }

    if (!res.ok) return; // 없으면 그냥 무시

    const data = await res.json();
    const messages = data.messages || [];

    // 화면 초기화 후 다시 그리기
    chatHistory.innerHTML = '';
    for (const m of messages) {
      appendMessage(m.content, m.sender === 'assistant' ? 'ai' : 'user');
    }
  }

  // --- (A) 초기 진입: 세션 확보 + 기존 메시지 로드 + initialPrompt 처리 ---
  (async function init() {
    try {
      const sessionId = await ensureSessionId();
      if (!sessionId) return;

      await loadMessages(sessionId);

      const initialPrompt = localStorage.getItem('initialPrompt');
      if (initialPrompt) {
        appendMessage(initialPrompt, 'user');
        await fetchAIResponse(sessionId, initialPrompt);
        localStorage.removeItem('initialPrompt');
      }
    } catch (e) {
      console.error(e);
      alert('채팅 초기화에 실패했습니다. 콘솔 로그를 확인해주세요.');
    }
  })();

  // --- (B) 메시지 전송 이벤트 ---
  chatSubmit.addEventListener('click', sendNewMessage);

  chatPrompt.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendNewMessage();
    }
  });

  async function sendNewMessage() {
    const promptText = chatPrompt.value;
    if (promptText.trim() === "") return;

    appendMessage(promptText, 'user');
    chatPrompt.value = "";

    const sessionId = await ensureSessionId();
    if (!sessionId) return;

    await fetchAIResponse(sessionId, promptText);
  }

  // --- (C) “세션 메시지 생성” API로 보내기 ---
  async function fetchAIResponse(sessionId, prompt) {
    const loadingBubble = appendMessage("생각중...", 'ai', true);

    try {
      const res = await fetch(`${SESSION_ENDPOINT}${sessionId}/messages/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ content: prompt }),
      });

      if (res.status === 401) {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login/';
        return;
      }

      if (!res.ok) {
        // 400/500 등 처리
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'API Error');
      }

      const data = await res.json();

      const aiText = data.assistant_reply || "";

      loadingBubble.classList.remove('loading');
      loadingBubble.innerText = aiText;

      // 추천 버튼 토글
      const ready = !!(data.control && data.control.ready_for_recommend);

    } catch (error) {
      console.error("AI 응답 오류:", error);
      loadingBubble.classList.remove('loading');
      loadingBubble.style.color = 'red';
      loadingBubble.innerText = "죄송합니다. 답변을 생성하는 데 실패했습니다.";
    }

    chatHistory.scrollTop = chatHistory.scrollHeight;
  }
});