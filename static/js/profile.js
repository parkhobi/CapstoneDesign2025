document.addEventListener('DOMContentLoaded', () => {

    const profileForm = document.getElementById('profile-form');
    // ID 변경 반영
    const nameKoInput = document.getElementById('name-ko');
    const nameEnInput = document.getElementById('name-en');
    const genderInput = document.getElementById('gender');
    const nationalityInput = document.getElementById('nationality');
    const addressInput = document.getElementById('address');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    
    // 1. 토큰 확인
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login/';
        return;
    }

    // 백엔드 API 주소 (조회와 수정 주소가 같을 수도, 다를 수도 있음)
    const API_ENDPOINT = '/api/auth/me/';


    // --- [기능 1] 페이지 로드 시: 내 정보 불러오기 (GET) ---
    async function loadProfile() {
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` // 토큰 필수
                }
            });

            if (response.ok) {
                const data = await response.json();
                const profile = data.profile || {}; // profile이 없을 경우 대비
                // 받아온 데이터로 입력창 채우기
                emailInput.value = data.email || '';
                nameKoInput.value = profile.name_kor || '';
                nameEnInput.value = profile.name_eng || '';
                genderInput.value = profile.gender || ''; // "M" or "F"
                nationalityInput.value = profile.nationality || '';
                addressInput.value = profile.address1 || ''; // address1을 주소창에 표시
                phoneInput.value = profile.phone || '';
            } else {
                console.error('프로필 불러오기 실패');
            }
        } catch (error) {
            console.error('프로필 로드 통신 오류:', error);
        }
    }

    // 페이지 열리자마자 실행
    loadProfile();

    // --- [기능 2] 저장 버튼 클릭 시: 수정된 정보 보내기 (PUT) ---
    profileForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        
        const updatedData = {
            email: emailInput.value,
            profile: {
                name_kor: nameKoInput.value,
                name_eng: nameEnInput.value,
                gender: genderInput.value,
                nationality: nationalityInput.value,
                address1: addressInput.value,
                phone: phoneInput.value
            }
        };

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'PATCH', // 수정은 보통 PUT 또는 PATCH
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                alert('정보가 성공적으로 수정되었습니다!');
                window.location.href = '/';
            } else {
                const data = await response.json();
                alert('수정 실패: ' + JSON.stringify(data));
            }
        } catch (error) {
            console.error('프로필 수정 통신 오류:', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }
    });
});