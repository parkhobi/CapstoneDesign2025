// HTML 문서가 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    
    // 검사에 필요한 요소들을 모두 가져옵니다.
    const signupForm = document.getElementById('signup-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('password-confirm');
    
    // 에러 메시지를 표시할 <p> 태그들
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    const passwordConfirmError = document.getElementById('password-confirm-error');

    // 'form'에서 'submit' 이벤트가 발생했을 때(버튼 클릭) 실행될 함수
    signupForm.addEventListener('submit', async (event) => {
        // [핵심] 1. 일단 기본 동작(페이지 이동)을 막습니다.
        event.preventDefault(); 
        
        // 2. 에러 메시지 초기화 (이전 에러를 지움)
        usernameError.textContent = "";
        passwordError.textContent = "";
        passwordConfirmError.textContent = "";
        
        let isValid = true; // 유효성 상태를 저장할 변수

        // 3. 유효성 검사 시작
        if (usernameInput.value.trim() === "") {
            usernameError.textContent = "아이디를 입력해 주세요.";
            isValid = false;
        }
        if (passwordInput.value.trim() === "") {
            passwordError.textContent = "비밀번호를 입력해 주세요.";
            isValid = false;
        }
        if (passwordInput.value !== passwordConfirmInput.value) {
            passwordConfirmError.textContent = "비밀번호가 일치하지 않습니다.";
            isValid = false;
        }
        
        // 유효성 검사를 통과하지 못했으면 여기서 중단
        if (!isValid) return;

        // 3. [백엔드 연결] 회원가입 요청 보내기
        const REGISTER_API = '/api/auth/register/';
        const LOGIN_API = '/api/token/'; // ★ 추가된 로그인 주소

        try {
            // (1) 회원가입 요청
            const response = await fetch(REGISTER_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: usernameInput.value,
                    password: passwordInput.value,
                    password_confirm: passwordConfirmInput.value
                }),
            });

            const data = await response.json();

            if (response.status === 201) {
                // ★★★ [여기서부터 변경] 가입 성공 시 '자동 로그인' 시도 ★★★
                
                // (2) 바로 로그인 요청 보내기 (토큰 받기 위해)
                const loginResponse = await fetch(LOGIN_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: usernameInput.value, // 로그인엔 id대신 username 필드명 사용 (일반적)
                        password: passwordInput.value
                    })
                });

                if (loginResponse.ok) {
                    const loginData = await loginResponse.json();

                    // (3) 토큰 저장 (이게 있어야 add-info에서 안 쫓겨남!)
                    localStorage.setItem('accessToken', loginData.access);
                    localStorage.setItem('refreshToken', loginData.refresh);

                    alert('회원가입이 완료되었습니다! 추가 정보를 입력해주세요.');
                    window.location.href = '/addinfo/'; 
                } else {
                    // 가입은 됐는데 자동 로그인이 실패한 경우
                    alert('회원가입 완료! 로그인 페이지로 이동합니다.');
                    window.location.href = '/login/';
                }
                // ★★★ [여기까지 변경] ★★★

            } else {
                // [실패 시] 에러 처리
                if (data.field === 'username') {
                    usernameError.textContent = data.error;
                } else if (data.field === 'password') {
                    passwordError.textContent = data.error;
                } else {
                    alert(data.error || '회원가입에 실패했습니다.');
                }
            }
        } catch (error) {
            console.error('요청 오류:', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }
    });
});