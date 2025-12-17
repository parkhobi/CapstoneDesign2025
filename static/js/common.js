// static/js/common.js
(function checkAuthentication() {
  const token = localStorage.getItem('accessToken');

  const path = window.location.pathname;
  const isAuthPage =
    path.endsWith('/login/') ||
    path.endsWith('/signup/');

  if (!token && !isAuthPage) {
    window.location.href = '/login/';
    return;
  }

  if (token && !isAuthPage) {
    fetchAndDisplayUserInfo(token);
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  setupLogoutButton();
});

async function fetchAndDisplayUserInfo(token) {
  const API_ENDPOINT = '/api/auth/me/';

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (response.ok) {
      const data = await response.json();

      const userName =
        (data.profile && data.profile.name_kor) ? data.profile.name_kor : (data.username || data.id);

      // 로컬에도 저장(사이드바 로드 타이밍 꼬여도 표시 가능)
      localStorage.setItem('userName', userName);

      const greetingElement = document.getElementById('user-greeting');
      if (greetingElement) greetingElement.textContent = `안녕하세요, ${userName}님`;
    } else if (response.status === 401 || response.status === 403) {
      // 403도 토큰/인증 실패로 보고 로그아웃 처리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userName');
      window.location.href = '/login/';
    }
  } catch (error) {
    console.error('사용자 정보 요청 오류:', error);
  }
}

function applyStoredGreeting() {
  const userName = localStorage.getItem('userName');
  if (!userName) return;

  const greetingElement = document.getElementById('user-greeting');
  if (greetingElement) greetingElement.textContent = `안녕하세요, ${userName}님`;
}

/**
 * 공통 레이아웃(사이드바 등)을 불러옵니다.
 * - 404면 조용히 스킵(서버에서 이 URL을 서빙 안할 수도 있으니까)
 */
async function loadLayout() {
  const leftSidebarPlaceholder = document.getElementById('sidebar-left-placeholder');
  const rightSidebarPlaceholder = document.getElementById('sidebar-right-placeholder');

  try {
    if (leftSidebarPlaceholder) {
      const response = await fetch('/_sidebar-left.html'); // ✅ 절대경로
      if (response.ok) {
        const html = await response.text();
        leftSidebarPlaceholder.outerHTML = html;
      } else {
        console.warn('왼쪽 사이드바를 서버에서 제공하지 않습니다(404 등). 템플릿 include 방식을 사용하세요.');
      }
    }

    if (rightSidebarPlaceholder) {
      const response = await fetch('/_sidebar-right.html'); // ✅ 절대경로
      if (response.ok) {
        const html = await response.text();
        rightSidebarPlaceholder.outerHTML = html;
      } else {
        console.warn('오른쪽 사이드바를 서버에서 제공하지 않습니다(404 등). 템플릿 include 방식을 사용하세요.');
      }
    }

    applyStoredGreeting();
    setActiveTab();
    setActiveNav();

  } catch (error) {
    console.error('공통 레이아웃 로드 중 오류:', error);
  }
}


function setActiveTab() {
  const path = window.location.pathname;

  if (path.includes('/resume/')) {
    document.querySelector('#tab-resume')?.classList.add('active');
  } else if (path.includes('/experience/')) {
    document.querySelector('#tab-experience')?.classList.add('active');
  } else if (path.includes('/mungteong/') || path.includes('/chat/')) {
    document.querySelector('#tab-mungteong')?.classList.add('active');
  }
}

function setActiveNav() {
  if (window.location.pathname === '/') {
    document.querySelector('.nav-button[href="/"]')?.classList.add('active');
  }
}

function setupLogoutButton() {
  document.addEventListener('click', (event) => {
    const el = event.target;
    if (el && el.id === 'logout-button') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userName');

      localStorage.removeItem('careerSessionId');

      window.location.href = '/login/';
    }
  });
}
