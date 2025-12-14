// 페이지 로드 시 즉시 실행 (문지기 역할)
(function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    
    // 현재 페이지가 로그인/회원가입 페이지가 *아닌데*
    const isProtectedPage = !window.location.pathname.endsWith('login.html') && 
                            !window.location.pathname.endsWith('signup.html');

    if (!token && isProtectedPage) {
        // 토큰이 없으면 로그인 페이지로 강제 이동
        window.location.href = 'login.html';
    } else if (token && isProtectedPage) {
        // 토큰이 있으면, 공통 레이아웃 로드 *전에* 사용자 정보부터 가져옴
        fetchAndDisplayUserInfo(token);
    }
})();

// HTML 문서가 로드되면(DOMContentLoaded) 공통 레이아웃(사이드바) 불러오기 (즉시 실행)
document.addEventListener('DOMContentLoaded', () => {
    loadLayout();
    setupLogoutButton(); // (4단계에서 추가할 로그아웃 버튼 설정)
});

/**
 * (신규) 토큰으로 백엔드에 사용자 정보를 요청하고 화면에 표시
 */
async function fetchAndDisplayUserInfo(token) {
    // [백엔드 약속] 사용자 정보를 반환하는 API 주소
    const API_ENDPOINT = '/api/v1/me'; 

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'GET',
            headers: {
                // [핵심] 요청 헤더에 토큰을 실어 보냄
                'Authorization': `Bearer ${token}` 
            }
        });

        if (response.ok) {
            const userData = await response.json(); // { "name": "OOO" }
            
            // (주의!) 이 코드는 common.js가 로드된 *이후*에 실행되므로,
            // 동적으로 로드될 HTML 요소가 아닌, *페이지 자체*에 있는 요소를 바꿔야 함.
            // index.html의 "홍길동님"을 바꿀 준비.
            // (이 부분은 loadLayout과 연동되어야 함 - 4단계에서 수정)
            
            // 임시로 사용자 이름을 localStorage에도 저장해두면 편함
            localStorage.setItem('userName', userData.name);

        } else if (response.status === 401) {
            // 401 (Unauthorized): 토큰이 만료되었거나 유효하지 않음
            localStorage.removeItem('authToken');
            localStorage.removeItem('userName');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('사용자 정보 요청 오류:', error);
    }
}

/**
 * 공통 레이아웃(사이드바 등)을 불러옵니다.
 */
async function loadLayout() {
    // 1. 플레이스홀더(자리표시자) 요소를 찾습니다.
    const leftSidebarPlaceholder = document.getElementById('sidebar-left-placeholder');
    const rightSidebarPlaceholder = document.getElementById('sidebar-right-placeholder');

    try {
        // 2. 왼쪽 사이드바 불러오기
        if (leftSidebarPlaceholder) {
            const response = await fetch('_sidebar-left.html'); // 템플릿 파일 fetch
            if (!response.ok) throw new Error('왼쪽 사이드바 로드 실패');
            const html = await response.text();
            // [핵심] 플레이스홀더(div)를 통째로 불러온 사이드바(aside) HTML로 교체
            leftSidebarPlaceholder.outerHTML = html; 
        }

        // 3. 오른쪽 사이드바 불러오기
        if (rightSidebarPlaceholder) {
            const response = await fetch('_sidebar-right.html'); // 템플릿 파일 fetch
            if (!response.ok) throw new Error('오른쪽 사이드바 로드 실패');
            const html = await response.text();
            rightSidebarPlaceholder.outerHTML = html;
        }

        // 4. 사용자 이름 표시하기
        // 사이드바가 로드된 *후에* 사용자 이름을 표시해야 함 (index.html의 경우)
        const userName = localStorage.getItem('userName');
        if (userName) {
            const greetingElement = document.getElementById('user-greeting');
            if (greetingElement) {
                greetingElement.textContent = userName; // "홍길동" -> "OOO"
            }
        }

        // 5. (중요!) 사이드바 로드가 완료된 후, 현재 페이지에 맞는 탭 활성화
        setActiveTab();
        setActiveNav(); // (index.html '홈' 버튼 활성화를 위해 추가)

    } catch (error) {
        console.error('공통 레이아웃 로드 중 오류:', error);
    }
}

/**
 * 현재 페이지 URL을 확인하여 오른쪽 사이드바의 탭을 활성화합니다.
 */
function setActiveTab() {
    // 현재 페이지 파일 이름 (예: "resume.html")
    const currentPage = window.location.pathname.split('/').pop();

    // 템플릿에서 'active'가 제거되었으므로, 현재 페이지에 맞는 탭을 찾아서 'active'를 추가
    if (currentPage === 'resume.html') {
        document.querySelector('.doc-tab[href="resume.html"]')?.classList.add('active');
    } else if (currentPage === 'experience.html') {
        document.querySelector('.doc-tab[href="experience.html"]')?.classList.add('active');
    } else if (currentPage === 'mungteong.html') {
        document.querySelector('.doc-tab[href="mungteong.html"]')?.classList.add('active');
    }
    // chat.html 등 다른 페이지는 아무것도 활성화되지 않음
}

/**
 * 현재 페이지가 'index.html'이면 왼쪽 사이드바의 '홈' 버튼을 활성화합니다.
 */
function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'index.html') {
        document.querySelector('.nav-button[href="index.html"]')?.classList.add('active');
    }
}

/**
 * (신규) 로그아웃 버튼 설정
 */
function setupLogoutButton() {
    // (4단계) 로그아웃 버튼(id="logout-button")이 클릭되면 실행
    // 이 버튼은 _sidebar-left.html 템플릿에 추가해야 함
    
    // 'click' 이벤트 위임 (사이드바가 동적으로 로드되므로 document에 이벤트를 검)
    document.addEventListener('click', (event) => {
        if (event.target && event.target.id === 'logout-button') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userName');
            window.location.href = 'login.html';
        }
    });
}