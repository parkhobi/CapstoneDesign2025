document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('sidebar-list-container');
    const titleElem = document.getElementById('sidebar-title');
    const descElem = document.getElementById('sidebar-desc');
    const addBtn = document.getElementById('sidebar-add-btn');

    // 현재 페이지 주소 확인 (/resume/, /experience/ 등)
    const path = window.location.pathname;
    const token = localStorage.getItem('accessToken');

    if (!token) {
        listContainer.innerHTML = "<p style='padding:15px'>로그인이 필요합니다.</p>";
        return;
    }

    // 페이지별 설정 (API 주소, 제목, 아이콘 등)
    let config = {};

    if (path.includes('/resume/')) {
        // [1] 표준 이력서 페이지 -> 회사별 자소서 목록
        document.getElementById('tab-resume').classList.add('active');
        config = {
            api: '/api/cover-letters/',
            title: '회사별 자소서',
            desc: '작성한 자기소개서 목록입니다.',
            icon: '📄',
            emptyMsg: '작성된 자소서가 없습니다.'
        };
    } else if (path.includes('/experience/')) {
        // [2] 경험 정리 페이지 -> 경험 목록
        document.getElementById('tab-experience').classList.add('active');
        config = {
            api: '/api/experiences/',
            title: '경험 정리 서류',
            desc: '너만의 경험 도토리 창고',
            icon: '📘',
            emptyMsg: '등록된 경험이 없습니다.'
        };
    } else if (path.includes('/mungteong/') || path.includes('/chat/')) {
        // [3] 뭉텅이/채팅 페이지 -> 대화 기록
        const tab = document.getElementById('tab-mungteong');
        if(tab) tab.classList.add('active');
        config = {
            api: '/api/chat-sessions/',
            title: '채팅 기록',
            desc: 'AI와 나눈 대화 목록입니다.',
            icon: '💬',
            emptyMsg: '대화 기록이 없습니다.'
        };
    } else {
        // 그 외 페이지 (메인 등) - 기본값 혹은 숨김
        listContainer.innerHTML = "<p style='padding:15px; color:#888;'>참고할 문서를 선택해주세요.</p>";
        return;
    }

    // --- 화면 업데이트 및 데이터 불러오기 ---
    
    // 1. 제목과 설명 변경
    if(titleElem) titleElem.textContent = config.title;
    if(descElem) descElem.textContent = config.desc;

    // 2. 데이터 가져오기 (fetch)
    fetchList(config);

    async function fetchList(cfg) {
        try {
            const response = await fetch(cfg.api, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                renderSidebarList(data, cfg);
            } else {
                listContainer.innerHTML = "<p style='padding:15px'>목록을 불러올 수 없습니다.</p>";
            }
        } catch (error) {
            console.error(error);
            listContainer.innerHTML = "<p style='padding:15px'>서버 오류 발생</p>";
        }
    }

    // 3. 목록 그리기
    function renderSidebarList(items, cfg) {
        listContainer.innerHTML = ""; // 초기화

        if (items.length === 0) {
            listContainer.innerHTML = `<p style='padding:20px; text-align:center; color:#999;'>${cfg.emptyMsg}</p>`;
            return;
        }

        items.forEach(item => {
            const html = `
                <div class="doc-item">
                    <div class="doc-item-info">
                        <span class="doc-icon">${cfg.icon}</span>
                        <strong>${item.title}</strong>
                    </div>
                    <div class="doc-item-actions">
                        <a href="#" onclick="alert('준비 중인 기능입니다: ${item.id}')">불러오기</a>
                    </div>
                </div>
            `;
            listContainer.innerHTML += html;
        });
    }
});