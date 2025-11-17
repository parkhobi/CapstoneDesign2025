// HTML 문서가 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {

    // 1. 폼 요소들 미리 찾아놓기
    const profileForm = document.getElementById('profile-form');
    // (입력창이 많으므로 id로 하나씩 가져옵니다)
    const nameInput = document.getElementById('name');
    const genderInput = document.getElementById('gender');
    const birthdateInput = document.getElementById('birthdate');
    const phoneInput = document.getElementById('phone');
    const schoolInput = document.getElementById('school');
    const majorInput = document.getElementById('major');
    const admissionYearInput = document.getElementById('admission-year');
    const graduationYearInput = document.getElementById('graduation-year');
    
    // --- (A) 페이지 로드 시: 저장된 데이터 불러오기 ---
    
    // 1. localStorage에서 'userProfile' 데이터 가져오기
    const savedProfile = localStorage.getItem('userProfile');

    if (savedProfile) {
        // 2. JSON 문자열을 다시 객체로 변환
        const profileData = JSON.parse(savedProfile);
        
        // 3. 폼 입력창에 기존 데이터 채워넣기
        nameInput.value = profileData.name || '';
        genderInput.value = profileData.gender || '';
        birthdateInput.value = profileData.birthdate || '';
        phoneInput.value = profileData.phone || '';
        schoolInput.value = profileData.school || '';
        majorInput.value = profileData.major || '';
        admissionYearInput.value = profileData.admissionYear || '';
        graduationYearInput.value = profileData.graduationYear || '';
    }

    // --- (B) '저장하기' 버튼 클릭 시: 새 데이터 저장하기 ---
    
    profileForm.addEventListener('submit', (event) => {
        // 1. 폼의 기본 제출(새로고침) 동작 막기
        event.preventDefault(); 
        
        // 2. 폼에서 현재 입력된 값들로 새 객체 만들기
        const updatedProfile = {
            name: nameInput.value,
            gender: genderInput.value,
            birthdate: birthdateInput.value,
            phone: phoneInput.value,
            school: schoolInput.value,
            major: majorInput.value,
            admissionYear: admissionYearInput.value,
            graduationYear: graduationYearInput.value
        };

        // 3. 새 객체를 JSON 문자열로 변환하여 localStorage에 덮어쓰기
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

        // 4. 사용자에게 저장 완료 알림
        alert('정보가 성공적으로 저장되었습니다!');
        
        // (선택) 저장 후 메인 페이지로 이동
        window.location.href = 'index.html'; 
    });
});