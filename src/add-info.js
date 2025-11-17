// add-info.js (새 파일)

document.addEventListener('DOMContentLoaded', () => {
    
    const addInfoForm = document.querySelector('form'); // form이 1개뿐이라 간단히 선택

    addInfoForm.addEventListener('submit', (event) => {
        event.preventDefault(); // 기본 제출 막기
        
        // 1. 폼에서 입력된 값들로 객체 만들기
        const profileData = {
            name: document.getElementById('name').value,
            gender: document.getElementById('gender').value,
            birthdate: document.getElementById('birthdate').value,
            phone: document.getElementById('phone').value,
            school: document.getElementById('school').value,
            major: document.getElementById('major').value,
            admissionYear: document.getElementById('admission-year').value,
            graduationYear: document.getElementById('graduation-year').value
        };
        
        // 2. localStorage에 'userProfile'로 저장
        localStorage.setItem('userProfile', JSON.stringify(profileData));

        // 3. 원래 가려던 다음 페이지(성공)로 이동
        window.location.href = 'signup-success.html'; 
    });
});