```markdown
# 📂 HMH - AI 기반 커리어 관리 플랫폼 (Capstone Design Project)

취업 준비생을 위한 **올인원 커리어 관리 서비스**입니다.
자신의 경험을 기록하고, 표준 이력서를 작성하며, AI와의 채팅을 통해 진로 상담을 받을 수 있습니다.

## 🛠️ 기술 스택 (Tech Stack)

* **Backend:** Python 3.9+, Django 4.2 (LTS), Django REST Framework (DRF)
* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Database:** SQLite (기본)
* **Environment:** Windows / macOS

```

## 🚀 설치 및 실행 방법 (Installation & Execution)

이 프로젝트를 로컬 환경에서 실행하기 위해 아래 절차를 순서대로 따라주세요.

### 1. 프로젝트 클론 (Clone)
```bash
git clone [여기에_본인의_깃허브_주소_입력]
cd [프로젝트_폴더명]

```

### 2. 가상환경 생성 및 활성화 (Virtual Environment)

시스템 간 충돌을 방지하기 위해 가상환경 사용을 권장합니다.

* **Windows:**
```bash
python -m venv venv
venv\Scripts\activate

```


* **macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate

```



### 3. 필수 라이브러리 설치 (Dependencies)

```bash
pip install -r requirements.txt

```

> **Note:** 만약 설치 중 에러가 발생하면 `pip install --upgrade pip`를 먼저 실행해주세요.

### 4. 데이터베이스 마이그레이션 (Migration)

```bash
python manage.py makemigrations
python manage.py migrate

```

### 5. 서버 실행 (Run Server)

```bash
python manage.py runserver

```

### 6. 접속

브라우저를 열고 `http://127.0.0.1:8000/` 으로 접속합니다.

---

## 📂 프로젝트 구조 및 파일 설명 (File Structure)

핵심 폴더와 파일에 대한 설명입니다.

```
HMH_PROJECT/
├── manage.py                 # Django 프로젝트 실행 및 관리 스크립트
├── requirements.txt          # 프로젝트에 필요한 Python 패키지 목록
├── db.sqlite3                # 로컬 데이터베이스 파일
│
├── backend/ (또는 config/)    # 프로젝트 전역 설정
│   ├── settings.py           # 앱 등록, DB 설정, 정적 파일 경로 등 설정
│   └── urls.py               # 전체 API 및 페이지 URL 라우팅
│
├── accounts/                 # [APP] 회원 관리 (로그인/회원가입)
│   ├── models.py             # User 모델 확장 (필요 시)
│   └── views.py              # JWT 토큰 발급 및 사용자 인증 로직
│
├── career/                   # [APP] 핵심 기능 (이력서, 경험정리, 채팅)
│   ├── models.py             # DB 모델 (Experience, StandardResume, CoverLetter 등)
│   ├── views.py              # 데이터 조회/저장 API (DRF View)
│   └── urls.py               # API 엔드포인트 관리
│
├── templates/                # [Frontend] HTML 화면 파일
│   ├── index.html            # 메인 대시보드
│   ├── resume.html           # 표준 이력서 작성/수정 페이지
│   ├── experience.html       # 경험 정리(카드형) 페이지
│   ├── mungteong.html        # AI 채팅(뭉텅이) 페이지
│   ├── profile.html          # 내 정보 수정 페이지
│   └── _sidebar-left.html    # 공통 왼쪽 사이드바 (메뉴)
│
└── static/                   # [Frontend] 정적 파일 (CSS, JS, Images)
    ├── css/
    │   └── style.css         # 전체 페이지 공통 스타일 및 레이아웃
    └── js/
        ├── common.js         # 로그인 토큰 체크 등 공통 로직
        ├── resume.js         # 이력서 데이터 로드/저장 (탭, 동적 폼 처리)
        ├── experience.js     # 경험 카드 CRUD 및 모달 처리
        ├── mungteong.js      # 채팅 기록 불러오기
        └── sidebar.js        # 페이지별 오른쪽 사이드바 내용 변경 로직

```

---

## 🔑 주요 기능 및 API (Key Features)

### 1. 회원가입 및 로그인

* 사용자 인증을 통해 개인화된 데이터를 제공합니다.
* **API:** `POST /api/token/` (로그인)

### 2. 표준 이력서 관리

* 복잡한 이력서 양식(학력, 자격증, 어학 등)을 웹에서 작성하고 저장합니다.
* **API:** `GET, POST /api/resume/`

### 3. 경험 정리 (도토리 창고)

* 자신의 경험을 태그와 함께 카드 형태로 기록하고 관리합니다.
* **API:** `GET, POST, DELETE /api/experiences/`

### 4. AI 챗봇 (뭉텅이)

* AI와 진로 상담을 진행하고 대화 내용을 저장합니다.
* **API:** `GET /api/chat-sessions/`

---

## ⚠️ 트러블슈팅 (Troubleshooting)

**Q. `ModuleNotFoundError: No module named 'django'` 에러가 나요.**
A. 가상환경이 활성화되었는지 확인(`(venv)` 표시)하고, `pip install -r requirements.txt`를 다시 실행하세요.

**Q. 로그인이 안 돼요.**
A. `python manage.py createsuperuser`로 관리자 계정을 만들거나, 회원가입 페이지에서 새 계정을 생성해주세요.

```
