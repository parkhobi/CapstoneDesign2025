document.addEventListener('DOMContentLoaded', () => {

    // 1. 요소 가져오기
    const chatHistory = document.getElementById('chat-history');
    const chatPrompt = document.getElementById('chat-prompt');
    const chatSubmit = document.getElementById('chat-submit');

    // 2. 토큰 확인 (로그인 안 했으면 쫓아내기)
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }

    // 3. [백엔드 연결] 실제 AI 채팅 API 주소
    // (백엔드 개발자에게 받은 주소로 꼭 수정하세요!)
    const API_ENDPOINT = 'http://localhost:8000/api/v1/chat';


    // --- (A) 페이지 로드 시: 홈에서 입력했던 첫 질문 처리 ---
    (function handleInitialPrompt() {
        const initialPrompt = localStorage.getItem('initialPrompt');
        if (initialPrompt) {
            // 화면에 표시
            appendMessage(initialPrompt, 'user');
            // AI에게 전송
            fetchAIResponse(initialPrompt);
            // 저장소에서 삭제
            localStorage.removeItem('initialPrompt');
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

    function sendNewMessage() {
        const promptText = chatPrompt.value;
        if (promptText.trim() === "") return;

        // 1. 내 메시지 화면에 표시
        appendMessage(promptText, 'user');
        chatPrompt.value = ""; // 입력창 비우기

        // 2. AI에게 요청
        fetchAIResponse(promptText);
    }


    // --- (C) [핵심] AI 응답 요청 함수 ---
    async function fetchAIResponse(prompt) {
        // 1. "생각중..." 로딩 버블 표시
        const loadingBubble = appendMessage("생각중...", 'ai', true);

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // [중요] 인증 토큰을 헤더에 포함 (로그인한 사람만 사용 가능)
                    'Authorization': `Bearer ${token}`
                },
                // [중요] 백엔드가 원하는 키값(prompt, message, query 등) 확인 필요
                body: JSON.stringify({ 
                    prompt: prompt 
                    // 필요하다면 chat_history_id 등을 같이 보낼 수 있음
                }) 
            });

            // 2. 응답 처리
            if (response.ok) {
                const data = await response.json();
                
                // [중요] 백엔드가 보내주는 응답의 키값(reply, response, answer 등) 확인 필요
                const aiText = data.response; 

                // 로딩 버블을 걷어내고 실제 텍스트로 교체
                loadingBubble.classList.remove('loading');
                // 줄바꿈 처리를 위해 innerHTML이나 innerText 사용
                // (보안을 위해 텍스트만 넣는다면 innerText 권장)
                loadingBubble.innerText = aiText; 
                
            } else if (response.status === 401) {
                // 토큰 만료 시
                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                window.location.href = 'login.html';
            } else {
                // 그 외 에러
                throw new Error('API Error');
            }

        } catch (error) {
            console.error("AI 응답 오류:", error);
            // 에러 발생 시 로딩 버블을 에러 메시지로 변경
            loadingBubble.classList.remove('loading');
            loadingBubble.style.color = 'red';
            loadingBubble.innerText = "죄송합니다. 답변을 생성하는 데 실패했습니다.";
        }
        
        // 스크롤 맨 아래로
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }


    // --- (D) 화면에 말풍선 그리기 (UI 유틸리티) ---
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

        return bubble; // 로딩 버블 제어를 위해 요소 반환
    }
});