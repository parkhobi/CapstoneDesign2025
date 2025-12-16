document.addEventListener('DOMContentLoaded', () => {
    
    const addInfoForm = document.querySelector('form'); // form이 1개뿐이라 간단히 선택

    addInfoForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // 기본 제출 막기
        
        // 1. 저장된 토큰 가져오기 (이게 없으면 저장 불가)
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            alert('로그인 정보가 없습니다. 다시 로그인해 주세요.');
            window.location.href = '/login/';
            return;
        }

        // 2. 입력된 값들로 데이터 객체 만들기
        // (주의: 백엔드가 원하는 필드명(key)과 일치해야 함)
        const requestBody = {
            email: document.getElementById('email').value, // 이메일은 profile 밖
            profile: {
                name_kor: document.getElementById('name-ko').value,
                name_eng: document.getElementById('name-en').value,
                gender: document.getElementById('gender').value, // "M" or "F"
                nationality: document.getElementById('nationality').value,
                address1: document.getElementById('address').value, // 상세주소 1
                phone: document.getElementById('phone').value
                // postal_code, address2는 현재 입력창이 없으므로 생략 (부분 수정 가능하므로 OK)
            }
        };
        
        // 3. [백엔드 연결] 프로필 저장 API 요청
        // 백엔드 개발자에게 받은 주소로 변경하세요.
        const API_ENDPOINT = '/api/auth/me/';

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'PATCH', // 처음 생성이면 POST, 수정이면 PUT
                headers: {
                    'Content-Type': 'application/json',
                    // [핵심] 인증 토큰을 헤더에 포함
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                // 성공 시 성공 페이지로 이동
                window.location.href = '/singupsuccess/'; 
            } else {
                // 실패 시 에러 처리
                const data = await response.json();
                alert(data.error || '정보 저장에 실패했습니다.');
            }
        } catch (error) {
            console.error('프로필 저장 오류:', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }
    });
});