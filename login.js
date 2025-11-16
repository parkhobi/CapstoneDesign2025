document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('login-error');

    loginButton.addEventListener('click', async () => {
        const username = usernameInput.value;
        const password = passwordInput.value;

        // [백엔드 약속] Django 서버의 로그인 API 주소
        const API_ENDPOINT = '/api/v1/login'; 

        // 실제 API 호출 로직을 잠시 주석 처리합니다.
        // try {
        //     const response = await fetch(API_ENDPOINT, {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({
        //             username: username,
        //             password: password,
        //         }),
        //     });

        //     const data = await response.json();

        //     if (response.ok) { // 2. 로그인 성공 (백엔드가 토큰을 보냄)
        //         // [핵심] 받은 토큰을 브라우저 localStorage에 저장
        //         localStorage.setItem('authToken', data.token); 

        //         // 3. 메인 페이지(index.html)로 이동
        //         window.location.href = 'index.html'; 
        //     } else { // 4. 로그인 실패 (아이디/비번 틀림 등)
        //         errorMessage.textContent = data.error || '로그인에 실패했습니다.';
        //     }
        // } catch (error) { // 5. 서버 통신 자체에 실패
        //     console.error('로그인 요청 오류:', error);
        //     errorMessage.textContent = '서버와 통신 중 오류가 발생했습니다.';
        // }


        
        // --- ▼▼▼ [가짜 로그인 테스트 로직 추가] ▼▼▼ ---
        // "로그인" 버튼을 누르면 이 코드가 대신 실행됩니다.

        // 1. (선택) 간단한 유효성 검사
        if (username.trim() === "" || password.trim() === "") {
            errorMessage.textContent = '아이디와 비밀번호를 입력하세요.';
            return; // 함수 종료
        }

        // 2. 가짜 토큰과 사용자 이름 생성
        const fakeToken = 'fake-token-for-' + username;
        // (입력한 아이디를 사용자 이름으로 사용)
        const fakeUserName = username; 

        // 3. [핵심] localStorage에 가짜 정보 저장
        localStorage.setItem('authToken', fakeToken);
        localStorage.setItem('userName', fakeUserName);
        
        // 4. 메인 페이지(index.html)로 이동
        window.location.href = 'index.html';
    });
});