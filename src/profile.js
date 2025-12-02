document.addEventListener('DOMContentLoaded', () => {

    const profileForm = document.getElementById('profile-form');
    // 입력창 요소들 가져오기
    const nameInput = document.getElementById('name');
    const genderInput = document.getElementById('gender');
    const birthdateInput = document.getElementById('birthdate');
    const phoneInput = document.getElementById('phone');
    const schoolInput = document.getElementById('school');
    const majorInput = document.getElementById('major');
    const admissionYearInput = document.getElementById('admission-year');
    const graduationYearInput = document.getElementById('graduation-year');
    
    // 1. 토큰 확인
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }

    // 백엔드 API 주소 (조회와 수정 주소가 같을 수도, 다를 수도 있음)
    const API_ENDPOINT = 'http://localhost:8000/api/v1/profile';


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
                
                // 받아온 데이터로 입력창 채우기
                // (백엔드에서 오는 데이터 필드명 확인 필요: data.name, data.gender 등)
                nameInput.value = data.name || '';
                genderInput.value = data.gender || '';
                birthdateInput.value = data.birthdate || '';
                phoneInput.value = data.phone || '';
                schoolInput.value = data.school || '';
                majorInput.value = data.major || '';
                admissionYearInput.value = data.admission_year || ''; 
                graduationYearInput.value = data.graduation_year || '';
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
            name: nameInput.value,
            gender: genderInput.value,
            birthdate: birthdateInput.value,
            phone: phoneInput.value,
            school: schoolInput.value,
            major: majorInput.value,
            admission_year: admissionYearInput.value,
            graduation_year: graduationYearInput.value
        };

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'PUT', // 수정은 보통 PUT 또는 PATCH
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                alert('정보가 성공적으로 수정되었습니다!');
                // (선택) 수정 후 메인으로 이동하려면 주석 해제
                // window.location.href = 'index.html';
            } else {
                const data = await response.json();
                alert(data.error || '정보 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('프로필 수정 통신 오류:', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }
    });
});