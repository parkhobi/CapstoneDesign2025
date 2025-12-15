document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('login-error');

    loginButton.addEventListener('click', async () => {
        const username = usernameInput.value;
        const password = passwordInput.value;

        // 간단한 유효성 검사
        if (username.trim() === "" || password.trim() === "") {
            errorMessage.textContent = '아이디와 비밀번호를 입력하세요.';
            return;
        }

        // [백엔드 약속] Django 서버의 로그인 API 주소
        const API_ENDPOINT = 'http://localhost:8000/api/auth/login/'; 

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.status === 200) { // 2. 로그인 성공 (백엔드가 토큰을 보냄)
                // [핵심] 받은 토큰을 브라우저 localStorage에 저장
                localStorage.setItem('accessToken', data.access);
                localStorage.setItem('refreshToken', data.refresh); 

                // 3. 메인 페이지(index.html)로 이동
                window.location.href = 'index.html'; 
            } else { // 4. 로그인 실패 (아이디/비번 틀림 등)
                errorMessage.textContent = data.error || '아이디/비밀번호를 확인하세요.';
            }
        } catch (error) { // 서버 통신 자체에 실패
            console.error('로그인 요청 오류:', error);
            errorMessage.textContent = '서버와 통신 중 오류가 발생했습니다.';
        }

        // 메인 페이지(index.html)로 이동
        window.location.href = 'index.html';
    });
});