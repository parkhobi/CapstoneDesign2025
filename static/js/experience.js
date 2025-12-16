document.addEventListener('DOMContentLoaded', () => {
    
    // 요소 가져오기
    const modal = document.getElementById('exp-modal');
    const btnOpen = document.getElementById('btn-open-modal');
    const btnCloseList = document.querySelectorAll('.close-modal');
    const expForm = document.getElementById('exp-form');
    const listContainer = document.getElementById('experience-list-container');

    // 토큰 확인
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert("로그인이 필요합니다.");
        window.location.href = '/login/';
        return;
    }

    // ★ [수정] 백엔드 URL을 urls.py와 똑같이 맞춤
    const API_ENDPOINT = '/api/experiences/'; 

    // 모달 열기/닫기
    btnOpen.addEventListener('click', () => modal.classList.add('open'));
    btnCloseList.forEach(btn => btn.addEventListener('click', () => modal.classList.remove('open')));

    // --- [기능 1] 목록 불러오기 (GET) ---
    async function loadExperiences() {
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                renderList(data);
            }
        } catch (error) { console.error("목록 로드 실패:", error); }
    }
    
    // 화면에 그리는 함수
    function renderList(items) {
        listContainer.innerHTML = ""; // 초기화

        if (items.length === 0) {
            listContainer.innerHTML = "<p style='text-align:center; padding:20px; color:#888;'>등록된 경험이 없습니다.</p>";
            return;
        }

        items.forEach(item => {
            // 날짜 예쁘게 표시 (YYYY-MM-DD)
            const dateStr = (item.start_date && item.end_date) 
                          ? `${item.start_date} ~ ${item.end_date}` 
                          : '날짜 미입력';

            const html = `
                <div class="exp-item" id="exp-item-${item.id}">
                    <span class="doc-icon icon-gdoc">📘</span>
                    <div class="exp-info">
                        <strong>${item.title}</strong>
                        <span class="exp-tags" style="color:#666; font-size:0.9em;">
                            ${dateStr} <br> 
                            <span style="color:#4a90e2;">${item.tags}</span>
                        </span>
                    </div>
                    <div class="exp-actions">
                        <button class="btn-action">확인하기</button>
                        <button class="btn-action btn-delete" onclick="deleteExperience(${item.id})">삭제하기</button>
                    </div>
                </div>
            `;
            listContainer.innerHTML += html;
        });
    }

    loadExperiences(); // 페이지 로드 시 실행

    // --- [기능 2] 새 경험 추가하기 (POST) ---
    expForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // 새로고침 막기

        // 입력값 가져오기
        const title = document.getElementById('exp-title').value;
        const start = document.getElementById('exp-start').value;
        const end = document.getElementById('exp-end').value;
        const tags = document.getElementById('exp-tags').value;

        const newData = {
            title: title,
            start_date: start,
            end_date: end,
            tags: tags
        };

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newData)
            });

            if (response.ok) {
                alert('경험이 성공적으로 저장되었습니다! 🎉'); // 진짜 성공 메시지
                modal.classList.remove('open'); // 모달 닫기
                expForm.reset(); // 입력창 비우기
                loadExperiences(); // 목록 다시 불러오기 (진짜 데이터)
            } else {
                // 실패 시 에러 처리
                alert('저장에 실패했습니다. 내용을 확인해주세요.');
            }
        } catch (error) {
            console.error("저장 오류:", error);
            alert("서버 연결에 실패했습니다.");
        }
    });
});