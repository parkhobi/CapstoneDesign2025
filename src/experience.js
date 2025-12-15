document.addEventListener('DOMContentLoaded', () => {
    
    // 요소 가져오기
    const modal = document.getElementById('exp-modal');
    const btnOpen = document.getElementById('btn-open-modal');
    const btnCloseList = document.querySelectorAll('.close-modal'); // 닫기 버튼들
    const expForm = document.getElementById('exp-form');
    const listContainer = document.getElementById('experience-list-container');

    // 토큰 확인 (로그인 체크)
    const token = localStorage.getItem('authToken');
    if (!token) { /* 로그인 체크 생략 (common.js가 해줌) */ }

    // API 주소
    const API_ENDPOINT = 'http://localhost:8000/api/v1/experiences'; 

    // --- [기능 1] 모달 열기/닫기 ---
    btnOpen.addEventListener('click', () => {
        modal.classList.add('open');
    });

    btnCloseList.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('open');
        });
    });

    // --- [기능 2] 목록 불러오기 (GET) ---
    async function loadExperiences() {
        // [백엔드 연결 시 주석 해제]
        /*
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json(); // data는 배열이어야 함
                renderList(data);
            }
        } catch (error) { console.error(error); }
        */

        // [현재: 테스트용 가짜 데이터]
        const dummyData = [
            { id: 1, title: "00 대외활동", date: "2025.03.08-2025.08.09", tags: "#첫도전 #성장" },
            { id: 2, title: "파이썬 프로젝트", date: "2024.01.01-2024.02.01", tags: "#코딩 #백엔드" }
        ];
        renderList(dummyData);
    }
    
    // 화면에 그리는 함수
    function renderList(items) {
        listContainer.innerHTML = ""; // 초기화

        items.forEach(item => {
            const html = `
                <div class="exp-item">
                    <span class="doc-icon icon-gdoc">📘</span>
                    <div class="exp-info">
                        <strong>${item.title}</strong>
                        <span class="exp-tags">${item.date} ${item.tags}</span>
                    </div>
                    <div class="exp-actions">
                        <button class="btn-action">확인하기</button>
                        <button class="btn-action btn-delete">삭제하기</button>
                    </div>
                </div>
            `;
            listContainer.innerHTML += html;
        });
    }

    loadExperiences(); // 페이지 로드 시 실행


    // --- [기능 3] 새 경험 추가하기 (POST) ---
    expForm.addEventListener('submit', async (e) => {
        e.preventDefault();

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

        // [백엔드 연결]
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
                alert('경험이 추가되었습니다!');
                modal.classList.remove('open'); // 모달 닫기
                expForm.reset(); // 입력창 비우기
                loadExperiences(); // 목록 다시 불러오기 (새로고침)
            } else {
                // [테스트용] 백엔드 없을 때 성공 처리 (나중에 지우세요)
                alert('경험 추가 성공 (테스트)');
                modal.classList.remove('open');
                
                // 가짜로 화면에 하나 추가해보기
                const tempItem = { 
                    title: title, 
                    date: `${start}~${end}`, 
                    tags: tags 
                };
                // 기존 목록에 추가하는 척 (새로고침하면 사라짐)
                const currentHtml = listContainer.innerHTML;
                const newHtml = `
                    <div class="exp-item">
                        <span class="doc-icon icon-gdoc">📘</span>
                        <div class="exp-info">
                            <strong>${tempItem.title}</strong>
                            <span class="exp-tags">${tempItem.date} ${tempItem.tags}</span>
                        </div>
                        <div class="exp-actions">
                            <button class="btn-action">확인하기</button>
                            <button class="btn-action btn-delete">삭제하기</button>
                        </div>
                    </div>
                `;
                listContainer.innerHTML = newHtml + currentHtml;
            }
        } catch (error) {
            console.error(error);
        }
    });
});