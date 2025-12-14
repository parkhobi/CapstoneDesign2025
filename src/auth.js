// 이 스크립트는 페이지 최상단(<head>)에서 실행됩니다.

// 1. 브라우저에 저장된 토큰을 가져옵니다.
const token = localStorage.getItem('authToken');

if (!token) {
    // 2. 토큰이 없으면, 즉시 로그인 페이지로 쫓아냅니다.
    // (현재 페이지가 login.html이 아닐 경우에만)
    if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('signup.html')) {
        window.location.href = 'login.html';
    }
} else {
    // 3. 토큰이 있다면, 백엔드에 이 토큰이 유효한지 확인하고 사용자 정보를 가져옵니다.
    // (이 함수는 아래 3단계에서 만듭니다)
    fetchAndDisplayUserInfo(token);
}