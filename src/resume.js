document.addEventListener('DOMContentLoaded', () => {

    // 1. 탭 전환 기능
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 모든 탭 비활성화
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // 클릭한 탭 활성화
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 2. 기본 정보 불러오기 (프로필 데이터 연동)
    const token = localStorage.getItem('authToken');
    const API_PROFILE = 'http://localhost:8000/api/v1/profile';

    // 입력창 요소들 (ID가 res- 로 시작함)
    const resName = document.getElementById('res-name');
    const resNameEn = document.getElementById('res-name-en');
    const resGender = document.getElementById('res-gender');
    const resNationality = document.getElementById('res-nationality');
    const resAddress = document.getElementById('res-address');
    const resEmail = document.getElementById('res-email');
    const resPhone = document.getElementById('res-phone');

    if (token) {
        loadBasicInfo();
    }

    async function loadBasicInfo() {
        try {
            const response = await fetch(API_PROFILE, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                
                // 받아온 데이터로 '기본 정보' 탭의 읽기 전용 칸 채우기
                resName.value = data.name_ko || '';
                resNameEn.value = data.name_en || '';
                resGender.value = data.gender || '';
                resNationality.value = data.nationality || '';
                resAddress.value = data.address || '';
                resEmail.value = data.email || '';
                resPhone.value = data.phone || '';
            }
        } catch (error) {
            console.error('이력서 기본정보 로드 실패:', error);
        }
    }
});

// --- [동적 항목 추가 기능] ---

// document.addEventListener('DOMContentLoaded', () => {
//     addResumeItem('lang-test');
//     addResumeItem('license');
// });

function addResumeItem(type) {
    const container = document.getElementById(`container-${type}`);
    const itemBox = document.createElement('div');
    itemBox.className = 'resume-item-box'; // 스타일링을 위한 클래스

    let html = '';

    // 타입별로 다른 입력폼 생성
    switch(type) {
        case 'lang-test': // 공인외국어시험
            html = `
                <div class="input-row">
                    <div class="input-group">
                        <label>시험명</label>
                        <input type="text" placeholder="예: TOEIC, OPIc">
                    </div>
                    <div class="input-group">
                        <label>점수/등급</label>
                        <input type="text" placeholder="점수 입력">
                    </div>
                    <div class="input-group">
                        <label>취득일</label>
                        <input type="date">
                    </div>
                </div>
            `;
            break;

        case 'language': // 외국어 활용능력
            html = `
                <div class="input-row">
                    <div class="input-group">
                        <label>외국어명</label>
                        <input type="text" placeholder="예: 영어, 중국어">
                    </div>
                    <div class="input-group">
                        <label>회화 수준</label>
                        <select><option>상</option><option>중</option><option>하</option></select>
                    </div>
                    <div class="input-group">
                        <label>작문 수준</label>
                        <select><option>상</option><option>중</option><option>하</option></select>
                    </div>
                    <div class="input-group">
                        <label>독해 수준</label>
                        <select><option>상</option><option>중</option><option>하</option></select>
                    </div>
                </div>
            `;
            break;

        case 'overseas': // 해외경험
            html = `
                <div class="input-row">
                    <div class="input-group">
                        <label>국가명</label>
                        <input type="text" placeholder="국가 입력">
                    </div>
                    <div class="input-group">
                        <label>거주목적</label>
                        <input type="text" placeholder="예: 어학연수, 교환학생">
                    </div>
                    <div class="input-group">
                        <label>체류기간</label>
                        <div class="date-range">
                            <input type="date"> ~ <input type="date">
                        </div>
                    </div>
                </div>
                <div class="input-group">
                    <label>상세내용</label>
                    <textarea placeholder="해외 경험 내용을 입력하세요" rows="2"></textarea>
                </div>
            `;
            break;

        case 'license': // 자격증/면허증
            html = `
                <div class="input-row">
                    <div class="input-group">
                        <label>자격증명</label>
                        <input type="text" placeholder="예: 정보처리기사">
                    </div>
                    <div class="input-group">
                        <label>발행처</label>
                        <input type="text" placeholder="발행기관 입력">
                    </div>
                    <div class="input-group">
                        <label>취득일</label>
                        <input type="date">
                    </div>
                </div>
            `;
            break;

        case 'computer': // 컴퓨터 활용능력
            html = `
                <div class="input-row">
                    <div class="input-group">
                        <label>프로그램/종류</label>
                        <input type="text" placeholder="예: 엑셀, 포토샵, Python">
                    </div>
                    <div class="input-group">
                        <label>활용 수준</label>
                        <select><option>상</option><option>중</option><option>하</option></select>
                    </div>
                    <div class="input-group">
                        <label>사용 기간</label>
                         <input type="text" placeholder="예: 3년, 6개월">
                    </div>
                </div>
            `;
            break;

        case 'award': // 수상경력
            html = `
                <div class="input-row">
                    <div class="input-group">
                        <label>상훈명</label>
                        <input type="text" placeholder="상장 이름">
                    </div>
                    <div class="input-group">
                        <label>수여기관</label>
                        <input type="text" placeholder="기관명">
                    </div>
                    <div class="input-group">
                        <label>수상일자</label>
                        <input type="date">
                    </div>
                </div>
                <div class="input-group">
                    <label>수상내역</label>
                    <textarea placeholder="수상 관련 상세 내용을 입력하세요" rows="2"></textarea>
                </div>
            `;
            break;
    }

    // [공통] 삭제 버튼 추가
    html += `
        <button type="button" class="btn-remove-item" onclick="removeResumeItem(this)">
            <i class="fas fa-trash-alt"></i> 삭제
        </button>
    `;

    itemBox.innerHTML = html;
    container.appendChild(itemBox);
}

// 항목 삭제 함수
function removeResumeItem(button) {
    // 버튼의 부모(resume-item-box)를 찾아서 삭제
    button.closest('.resume-item-box').remove();
}