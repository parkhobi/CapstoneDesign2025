document.addEventListener('DOMContentLoaded', () => {

    // 1. 탭 전환 기능
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 2. 기본 정보 불러오기 (프로필 연동)
    const token = localStorage.getItem('accessToken');
    const API_PROFILE = '/api/auth/me/';
    
    // 읽기 전용 필드들
    const resName = document.getElementById('res-name');
    const resNameEn = document.getElementById('res-name-en');
    const resGender = document.getElementById('res-gender');
    const resNationality = document.getElementById('res-nationality');
    const resAddress = document.getElementById('res-address');
    const resEmail = document.getElementById('res-email');
    const resPhone = document.getElementById('res-phone');

    if (token) {
        loadBasicInfo(); 
        loadResumeData(); // 이력서 저장 내용 로드
    }

    async function loadBasicInfo() {
        try {
            const response = await fetch(API_PROFILE, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const profile = data.profile || {};
                
                if(resName) resName.value = profile.name_kor || '';
                if(resNameEn) resNameEn.value = profile.name_eng || '';
                if(resGender) resGender.value = (profile.gender === 'M' ? '남성' : '여성');
                if(resNationality) resNationality.value = profile.nationality || '';
                if(resAddress) resAddress.value = profile.address1 || '';
                if(resEmail) resEmail.value = data.email || '';
                if(resPhone) resPhone.value = profile.phone || '';
            }
        } catch (error) { console.error('프로필 로드 실패:', error); }
    }

    // 저장 버튼 이벤트
    const btnSave = document.querySelector('.btn-save');
    const btnSubmit = document.querySelector('.btn-submit');
    
    if(btnSave) btnSave.addEventListener('click', saveResumeData);
    if(btnSubmit) btnSubmit.addEventListener('click', (e) => {
        e.preventDefault();
        saveResumeData();
    });
});


// ----------------------------------------------------------------
// [동적 항목 추가 기능] (6가지 항목 모두 포함됨)
// ----------------------------------------------------------------
function addResumeItem(type, data = null) {
    const container = document.getElementById(`container-${type}`);
    const itemBox = document.createElement('div');
    itemBox.className = 'resume-item-box'; 
    itemBox.dataset.type = type;

    // 데이터가 있으면(불러오기 모드) 그 값을 사용, 없으면 빈칸
    const v = (key) => data ? (data[key] || '') : '';

    let html = '';

    switch(type) {
        case 'lang-test': // 1. 공인외국어시험
            html = `
                <div class="input-row">
                    <div class="input-group">
                        <label>시험명</label>
                        <input type="text" class="field-name" placeholder="예: TOEIC" value="${v('name')}">
                    </div>
                    <div class="input-group">
                        <label>점수/등급</label>
                        <input type="text" class="field-score" placeholder="점수" value="${v('score')}">
                    </div>
                    <div class="input-group">
                        <label>취득일</label>
                        <input type="date" class="field-date" value="${v('date')}">
                    </div>
                </div>`;
            break;

        case 'language': // 2. 외국어 활용능력
            html = `
                <div class="input-row">
                    <div class="input-group">
                        <label>외국어명</label>
                        <input type="text" class="field-lang" placeholder="예: 영어" value="${v('lang')}">
                    </div>
                    <div class="input-group">
                        <label>회화</label>
                        <select class="field-speak">
                            <option value="상" ${v('speak')==='상'?'selected':''}>상</option>
                            <option value="중" ${v('speak')==='중'?'selected':''}>중</option>
                            <option value="하" ${v('speak')==='하'?'selected':''}>하</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>작문</label>
                        <select class="field-write">
                            <option value="상" ${v('write')==='상'?'selected':''}>상</option>
                            <option value="중" ${v('write')==='중'?'selected':''}>중</option>
                            <option value="하" ${v('write')==='하'?'selected':''}>하</option>
                        </select>
                    </div>
                </div>`;
            break;

        case 'overseas': // 3. 해외경험
            html = `
                <div class="input-row">
                    <div class="input-group">
                        <label>국가명</label>
                        <input type="text" class="field-country" placeholder="국가 입력" value="${v('country')}">
                    </div>
                    <div class="input-group">
                        <label>거주목적</label>
                        <input type="text" class="field-purpose" placeholder="예: 워킹홀리데이" value="${v('purpose')}">
                    </div>
                </div>
                <div class="input-group">
                    <label>상세내용</label>
                    <textarea class="field-content" rows="2" placeholder="내용 입력">${v('content')}</textarea>
                </div>`;
            break;

        case 'license': // 4. 자격증
            html = `
                <div class="input-row">
                    <div class="input-group">
                        <label>자격증명</label>
                        <input type="text" class="field-name" placeholder="예: 정보처리기사" value="${v('name')}">
                    </div>
                    <div class="input-group">
                        <label>발행처</label>
                        <input type="text" class="field-org" placeholder="발행기관" value="${v('org')}">
                    </div>
                    <div class="input-group">
                        <label>취득일</label>
                        <input type="date" class="field-date" value="${v('date')}">
                    </div>
                </div>`;
            break;

        case 'computer': // 5. 컴퓨터 활용능력
            html = `
                <div class="input-row">
                    <div class="input-group">
                        <label>프로그램/종류</label>
                        <input type="text" class="field-name" placeholder="예: Excel, Photoshop" value="${v('name')}">
                    </div>
                    <div class="input-group">
                        <label>활용 수준</label>
                        <select class="field-level">
                            <option value="상" ${v('level')==='상'?'selected':''}>상</option>
                            <option value="중" ${v('level')==='중'?'selected':''}>중</option>
                            <option value="하" ${v('level')==='하'?'selected':''}>하</option>
                        </select>
                    </div>
                </div>`;
            break;

        case 'award': // 6. 수상경력
            html = `
                <div class="input-row">
                    <div class="input-group">
                        <label>상훈명</label>
                        <input type="text" class="field-name" placeholder="상장 이름" value="${v('name')}">
                    </div>
                    <div class="input-group">
                        <label>수여기관</label>
                        <input type="text" class="field-org" placeholder="기관명" value="${v('org')}">
                    </div>
                    <div class="input-group">
                        <label>수상일자</label>
                        <input type="date" class="field-date" value="${v('date')}">
                    </div>
                </div>
                <div class="input-group">
                    <label>수상내역</label>
                    <textarea class="field-content" rows="2">${v('content')}</textarea>
                </div>`;
            break;
    }

    // 삭제 버튼 추가
    html += `
        <button type="button" class="btn-remove-item" onclick="removeResumeItem(this)">
            <i class="fas fa-trash-alt"></i> 삭제
        </button>
    `;

    itemBox.innerHTML = html;
    container.appendChild(itemBox);
}

function removeResumeItem(button) {
    button.closest('.resume-item-box').remove();
}

function extractListData(containerId, fields) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    const items = [];
    container.querySelectorAll('.resume-item-box').forEach(box => {
        const itemObj = {};
        fields.forEach(field => {
            const input = box.querySelector(`.field-${field}`);
            if (input) itemObj[field] = input.value;
        });
        items.push(itemObj);
    });
    return items;
}


// ----------------------------------------------------------------
// [핵심] 이력서 저장 및 불러오기 (ID 기반 + 동적 리스트)
// ----------------------------------------------------------------

// 도우미 함수들
const getVal = (id) => document.getElementById(id) ? document.getElementById(id).value : '';
const setVal = (id, val) => { if(document.getElementById(id) && val) document.getElementById(id).value = val; };

async function saveResumeData() {
    const token = localStorage.getItem('accessToken');
    if (!token) { alert("로그인이 필요합니다."); return; }

    const resumeData = {
        // [Tab 1] 추가 정보
        wish1: getVal('wish-1'),
        wish2: getVal('wish-2'),
        wish3: getVal('wish-3'),
        wish4: getVal('wish-4'),
        prevSalary: getVal('prev-salary'),
        joinDate: getVal('join-date'),

        // [Tab 2] 학력/경력 (모든 필드 저장)
        highSchool: {
            status: getVal('hs-status'),
            start: getVal('hs-start'),
            end: getVal('hs-end'),
            name: getVal('hs-name'),
            location: getVal('hs-location'),
            field: getVal('hs-field'),
            daynight: getVal('hs-daynight')
        },
        university: {
            degree: getVal('univ-degree'),
            type: getVal('univ-type'),
            status: getVal('univ-status'),
            name: getVal('univ-name'),
            branch: getVal('univ-branch'),
            start: getVal('univ-start'),
            end: getVal('univ-end'),
            category: getVal('univ-category'),
            major: getVal('univ-major'),
            score: getVal('univ-score'),
            maxScore: getVal('univ-max-score')
        },
        gradSchool: {
            degree: getVal('grad-degree'),
            status: getVal('grad-status'),
            name: getVal('grad-name'),
            major: getVal('grad-major'),
            start: getVal('grad-start'),
            end: getVal('grad-end')
        },
        career: {
            company: getVal('career-company'),
            start: getVal('career-start'),
            end: getVal('career-end'),
            dept: getVal('career-dept'),
            rank: getVal('career-rank'),
            salary: getVal('career-salary'),
            task: getVal('career-task'),
            reason: getVal('career-reason'),
            desc: getVal('career-desc')
        },
        
        // [Tab 4] 자기소개서
        selfIntroMain: getVal('self-intro-main'),

        // [Tab 3] 동적 리스트 (6개 항목 모두 포함)
        langTests: extractListData('container-lang-test', ['name', 'score', 'date']),
        languages: extractListData('container-language', ['lang', 'speak', 'write']),
        overseas: extractListData('container-overseas', ['country', 'purpose', 'content']),
        licenses: extractListData('container-license', ['name', 'org', 'date']),
        computers: extractListData('container-computer', ['name', 'level']),
        awards: extractListData('container-award', ['name', 'org', 'date', 'content'])
    };

    try {
        const response = await fetch('/api/resume/', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(resumeData)
        });
        if (response.ok) alert("이력서가 안전하게 저장되었습니다! 💾");
        else alert("저장 실패: 서버 오류");
    } catch(e) { console.error("저장 에러:", e); }
}

async function loadResumeData() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
        const response = await fetch('/api/resume/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (Object.keys(data).length === 0) return;

            // [Tab 1] 복원
            setVal('wish-1', data.wish1);
            setVal('wish-2', data.wish2);
            setVal('wish-3', data.wish3);
            setVal('wish-4', data.wish4);
            setVal('prev-salary', data.prevSalary);
            setVal('join-date', data.joinDate);

            // [Tab 2] 복원 (날짜 포함 모든 필드 복원)
            if(data.highSchool) {
                setVal('hs-status', data.highSchool.status);
                setVal('hs-start', data.highSchool.start);
                setVal('hs-end', data.highSchool.end);
                setVal('hs-name', data.highSchool.name);
                setVal('hs-location', data.highSchool.location);
                setVal('hs-field', data.highSchool.field);
                setVal('hs-daynight', data.highSchool.daynight);
            }
            if(data.university) {
                setVal('univ-degree', data.university.degree);
                setVal('univ-type', data.university.type);
                setVal('univ-status', data.university.status);
                setVal('univ-name', data.university.name);
                setVal('univ-branch', data.university.branch);
                setVal('univ-start', data.university.start);
                setVal('univ-end', data.university.end);
                setVal('univ-category', data.university.category);
                setVal('univ-major', data.university.major);
                setVal('univ-score', data.university.score);
                setVal('univ-max-score', data.university.maxScore);
            }
            if(data.gradSchool) {
                setVal('grad-degree', data.gradSchool.degree);
                setVal('grad-status', data.gradSchool.status);
                setVal('grad-name', data.gradSchool.name);
                setVal('grad-major', data.gradSchool.major);
                setVal('grad-start', data.gradSchool.start);
                setVal('grad-end', data.gradSchool.end);
            }
            if(data.career) {
                setVal('career-company', data.career.company);
                setVal('career-start', data.career.start);
                setVal('career-end', data.career.end);
                setVal('career-dept', data.career.dept);
                setVal('career-rank', data.career.rank);
                setVal('career-salary', data.career.salary);
                setVal('career-task', data.career.task);
                setVal('career-reason', data.career.reason);
                setVal('career-desc', data.career.desc);
            }

            // [Tab 4] 복원
            setVal('self-intro-main', data.selfIntroMain);

            // [Tab 3] 동적 리스트 복원 (6가지 항목 모두 포함)
            if(data.langTests) data.langTests.forEach(item => addResumeItem('lang-test', item));
            if(data.languages) data.languages.forEach(item => addResumeItem('language', item));
            if(data.overseas) data.overseas.forEach(item => addResumeItem('overseas', item));
            if(data.licenses) data.licenses.forEach(item => addResumeItem('license', item));
            if(data.computers) data.computers.forEach(item => addResumeItem('computer', item));
            if(data.awards) data.awards.forEach(item => addResumeItem('award', item));
        }
    } catch(e) { console.error("로드 에러:", e); }
}