// DOM 요소가 모두 로드된 후 스크립트 실행
document.addEventListener('DOMContentLoaded', () => {

    // HTML에서 주요 요소들 가져오기
    const chatHistory = document.getElementById('chat-history');
    const chatPrompt = document.getElementById('chat-prompt');
    const chatSubmit = document.getElementById('chat-submit');

    // 1. 페이지 로드 시: 첫 번째 질문 처리
    // -------------------------------------------------
    (function handleInitialPrompt() {
        // index.html에서 저장한 첫 질문을 가져옴
        const initialPrompt = localStorage.getItem('initialPrompt');

        if (initialPrompt) {
            // 화면에 사용자 질문 표시
            appendMessage(initialPrompt, 'user');
            // AI에게 즉시 질문 전송
            fetchAIResponse(initialPrompt);
            
            // 사용한 첫 질문은 localStorage에서 삭제
            localStorage.removeItem('initialPrompt');
        }
    })();

    // 2. 이벤트 리스너: 사용자가 새 메시지 입력
    // -------------------------------------------------
    
    // 전송 버튼 클릭
    chatSubmit.addEventListener('click', sendNewMessage);
    
    // Enter 키로 전송 (Shift+Enter는 줄바꿈)
    chatPrompt.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendNewMessage();
        }
    });

    // 새 메시지 전송 처리 함수
    function sendNewMessage() {
        const promptText = chatPrompt.value;
        if (promptText.trim() === "") return;

        // 1. 화면에 사용자 메시지 표시
        appendMessage(promptText, 'user');
        // 2. 입력창 비우기
        chatPrompt.value = "";
        // 3. AI에게 질문 전송
        fetchAIResponse(promptText);
    }

    // 3. 핵심 기능: AI 응답 요청 (FastAPI/RAG 연동)
    // -------------------------------------------------
    async function fetchAIResponse(prompt) {
        // 1. "생각중..." 로딩 버블 표시
        const loadingBubble = appendMessage("생각중...", 'ai', true);

        // [중요] 여기에 FastAPI 엔드포인트 주소를 입력하세요
        const API_ENDPOINT = "/api/v1/chat"; // (예시)

        try {
            // fetch API를 사용해 백엔드에 POST 요청
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    prompt: prompt 
                    // (추가) 필요시 사용자 ID나 이전 대화 내역도 보낼 수 있음
                }) 
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // 백엔드에서 온 JSON 응답 받기
            const data = await response.json();
            const aiText = data.response; // (백엔드 응답 형식에 맞게 수정)

            // 2. 로딩 버블을 실제 AI 응답으로 교체
            // (또는 로딩 버블 지우고 새 버블 추가)
            loadingBubble.classList.remove('loading');
            loadingBubble.innerHTML = aiText; // (간단한 텍스트 응답)
            // 만약 스트리밍(typing) 효과를 원한다면 이 부분이 더 복잡해집니다.

        } catch (error) {
            console.error("AI 응답 오류:", error);
            // 3. 에러 발생 시 로딩 버블을 에러 메시지로 교체
            loadingBubble.classList.remove('loading');
            loadingBubble.classList.add('error'); // (CSS로 에러 스타일 추가 가능)
            loadingBubble.innerText = "죄송합니다. 답변을 생성하는 데 실패했습니다.";
        }
    }


    // 4. 유틸리티: 화면에 말풍선 추가
    // -------------------------------------------------
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
            // (보안) 실제 서비스에서는 text를 innerText로 넣거나
            // HTML 파싱을 방지하는 라이브러리를 사용해야 합니다.
            bubble.innerText = text;
        }

        // 채팅창에 새 말풍선 추가
        chatHistory.appendChild(bubble);
        
        // [중요] 스크롤을 항상 맨 아래로 이동
        chatHistory.scrollTop = chatHistory.scrollHeight;

        return bubble; // (로딩 버블을 나중에 수정하기 위해 반환)
    }
});