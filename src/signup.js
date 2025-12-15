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
        
        // 검사 1: 아이디가 비어있는가?
        if (usernameInput.value.trim() === "") {
            usernameError.textContent = "아이디를 입력해 주세요.";
            isValid = false;
        }

        // 검사 2: 비밀번호가 비어있는가?
        if (passwordInput.value.trim() === "") {
            passwordError.textContent = "비밀번호를 입력해 주세요.";
            isValid = false;
        }

        // 검사 3: 두 비밀번호가 일치하는가?
        if (passwordInput.value !== passwordConfirmInput.value) {
            passwordConfirmError.textContent = "비밀번호가 일치하지 않습니다.";
            isValid = false;
        }
        
        // 유효성 검사를 통과하지 못했으면 여기서 중단
        if (!isValid) return;

        // 3. [백엔드 연결] 회원가입 요청 보내기
        const API_ENDPOINT = 'http://localhost:8000/api/auth/register/';

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // 백엔드가 원하는 데이터 필드명(키값)에 맞춰서 보내야 합니다.
                body: JSON.stringify({
                    id: usernameInput.value,         // 백엔드가 'id'를 원함
                    password: passwordInput.value,
                    password_confirm: passwordConfirmInput.value // 필수 전송
                }),
            });

            const data = await response.json();

            if (response.status === 201) {
                // [성공 시]
                // 회원가입 성공 후 '추가 정보 입력' 페이지로 이동
                alert('회원가입이 완료되었습니다.');
                window.location.href = 'add-info.html'; 
            } else {
                // [실패 시] 백엔드에서 보낸 에러 메시지 표시
                // 예: "이미 존재하는 아이디입니다."
                if (data.field === 'username') {
                    usernameError.textContent = data.error;
                } else if (data.field === 'password') {
                    passwordError.textContent = data.error;
                } else {
                    // 필드가 특정되지 않은 에러는 alert 등으로 표시하거나 공통 에러칸에 표시
                    alert(data.error || '회원가입에 실패했습니다.');
                }
            }
        } catch (error) {
            console.error('회원가입 요청 오류:', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }
    });
});