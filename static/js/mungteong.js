document.addEventListener('DOMContentLoaded', () => {
    
    const listContainer = document.getElementById('mungteong-list-container');
    const token = localStorage.getItem('accessToken');

    if (!token) {
        alert("로그인이 필요합니다.");
        window.location.href = '/login/';
        return;
    }

    // 1. 채팅 목록 불러오기
    loadChatSessions();

    async function loadChatSessions() {
        try {
            // 아까 수정한 API 주소 호출
            const response = await fetch('/api/chat-sessions/', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const sessions = await response.json();
                renderList(sessions);
            } else {
                console.error("목록 로드 실패");
            }
        } catch (error) {
            console.error("서버 통신 오류:", error);
        }
    }

    // 2. 화면에 그리기
    function renderList(items) {
        listContainer.innerHTML = ""; // 초기화

        if (items.length === 0) {
            listContainer.innerHTML = "<p style='text-align:center; padding:30px; color:#888;'>저장된 대화 기록이 없습니다. <br>새로운 대화를 시작해보세요!</p>";
            return;
        }

        items.forEach(item => {
            const html = `
                <div class="exp-item">
                    <span class="doc-icon icon-gslides">💬</span>
                    <div class="exp-info">
                        <strong>${item.title}</strong>
                        <span class="exp-tags">
                            마지막 대화: ${item.date}
                        </span>
                    </div>
                    <div class="exp-actions">
                        <button class="btn-action" onclick="alert('채팅 이어하기 기능은 준비 중입니다. (ID: ${item.id})')">
                            확인하기
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteChatSession(${item.id})">
                            삭제하기
                        </button>
                    </div>
                </div>
            `;
            listContainer.innerHTML += html;
        });
    }
});

// 3. 채팅방 삭제 함수 (추가 기능)
async function deleteChatSession(id) {
    if(!confirm("정말 이 대화 기록을 삭제하시겠습니까?")) return;

    const token = localStorage.getItem('accessToken');
    try {
        // (주의) 백엔드에 채팅 삭제 API가 구현되어 있어야 작동합니다.
        // 현재는 예시로 URL만 적어둡니다. 구현 안 되어 있으면 404 뜸.
        const response = await fetch(`/api/chat-sessions/${id}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok || response.status === 204) {
            alert("삭제되었습니다.");
            window.location.reload();
        } else {
            alert("삭제 실패 (아직 서버에 삭제 기능이 없을 수 있습니다)");
        }
    } catch(e) { console.error(e); }
}