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
        
        // 4. 모든 검사를 통과했는지 확인
        if (isValid) {
            // [백엔드 연동]
            // 모든 검사를 통과했다면, 이곳에서 fetch를 사용해
            // 백엔드(Django)의 '/api/v1/register' 같은 API로
            // 아이디, 비밀번호를 전송(POST)하여 회원가입을 요청합니다.
            
            // [프론트엔드 테스트용]
            // 지금은 백엔드가 없으므로, 
            // 성공했다고 가정하고 다음 페이지로 강제 이동시킵니다.
            alert('회원가입 성공! (테스트)');
            window.location.href = 'add-info.html'; // 다음 페이지로 이동
        }
    });
});