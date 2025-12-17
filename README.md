# 📂 HMH - AI 기반 커리어 관리 플랫폼 (Capstone Design Project)

**2025 성신여자대학교 융합캡스톤디자인**

취업 준비생을 위한 **올인원 커리어 관리 서비스**입니다.
자신의 경험을 기록하고, 표준 이력서를 작성하며, AI와의 채팅을 통해 진로 상담을 받을 수 있습니다.

## 🛠️ 기술 스택 (Tech Stack)

* **Backend:** Python 3.9+, Django 4.2 (LTS), Django REST Framework (DRF), Simple JWT (JWT 인증)
* **Frontend:** HTML5, CSS3, Vanilla JavaScript, Django Template Engine
* **Database:** SQLite (기본)
* **Environment:** Windows / macOS
---

## 🚀 설치 및 실행 방법 (Installation & Execution)

이 프로젝트를 로컬 환경에서 실행하기 위해 아래 절차를 순서대로 따라주세요.

### 1. 프로젝트 클론 (Clone)
```bash
git clone https://github.com/parkhobi/CapstoneDesign2025.git
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
├── manage.py                     # Django 프로젝트 실행 스크립트
├── requirements.txt              # Python 패키지 의존성 목록
├── db.sqlite3                    # 로컬 SQLite DB (개발용)
├── .env                          # 환경 변수 파일 (GitHub 제외)
├── .gitignore                    # Git 제외 설정
│
├── backend/                      # Django 프로젝트 설정(App-level)
│   ├── __init__.py
│   ├── settings.py               # 전역 설정 (INSTALLED_APPS, DB, JWT 등)
│   ├── urls.py                   # 전체 URL 라우팅 (API + 페이지)
│   ├── asgi.py
│   └── wsgi.py
│
├── accounts/                     # [APP] 사용자 계정 / 인증
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py                 # 사용자 관련 모델
│   ├── serializers.py            # 인증/회원 관련 Serializer
│   ├── urls.py                   # /api/auth/* 라우팅
│   ├── views.py                  # 로그인, 회원가입, 페이지 렌더링
│   ├── tests.py
│   └── migrations/
│       └── __init__.py
│
├── career/                       # [APP] 커리어 핵심 도메인
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py                 # Experience, ExperienceDoc, Resume 등
│   ├── serializers.py            # Career 관련 Serializer
│   ├── services.py               # DB Snapshot 생성 로직
│   ├── views.py                  # REST API (DRF View / ViewSet)
│   ├── urls.py                   # /api/career/* 엔드포인트
│   ├── tests.py
│   └── migrations/
│       ├── __init__.py
│
├── templates/                    # Django Template (Frontend)
│   ├── index.html                # 메인 대시보드
│   ├── login.html                # 로그인 페이지
│   ├── signup.html               # 회원가입 페이지
│   ├── signup-success.html       # 회원가입 완료 페이지
│   ├── profile.html              # 내 정보 페이지
│   ├── resume.html               # 표준 이력서 페이지
│   ├── experience.html           # 경험 입력/관리 페이지
│   ├── experience_docs.html      # 경험정리서류 목록 페이지
│   ├── experience_doc_detail.html# 경험정리서류 상세 페이지
│   ├── mungteong.html            # AI 채팅 페이지
│   ├── add-info.html             # 추가 정보 입력 페이지
│   ├── _sidebar-left.html        # 공통 왼쪽 사이드바
│   └── _sidebar-right.html       # 공통 오른쪽 사이드바
│
└── static/                       # 정적 파일 (CSS / JavaScript / Images)
    ├── css/
    │   └── style.css             # 전체 공통 스타일
    ├── js/
    │   ├── common.js             # 공통 유틸 (토큰 체크 등)
    │   ├── sidebar.js             # 오른쪽 사이드바 제어
    │   ├── experience.js          # 경험 카드 CRUD
    │   ├── experience_doc.js      # 경험정리서류 목록/상세 처리
    │   ├── resume.js              # 이력서 관리
    │   ├── mungteong.js           # AI 채팅 로직
    │   ├── login.js
    │   ├── signup.js
    │   └── profile.js

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

### 5. 경험정리서류
* DB에 저장된 정보만을 기반으로 스냅샷 생성
* AI 없이도 즉시 문서 생성 가능
* 결과는 JSON 형태로 저장 및 조회

* **API:**
* GET  /api/career/experience-docs/
* POST /api/career/experience-docs/
* GET  /api/career/experience-docs/{id}/

---

## ⚠️ 트러블슈팅 (Troubleshooting)

**Q. `ModuleNotFoundError: No module named 'django'` 에러가 나요.**
A. 가상환경이 활성화되었는지 확인(`(venv)` 표시)하고, `pip install -r requirements.txt`를 다시 실행하세요.

**Q. 로그인이 안 돼요.**
A. `python manage.py createsuperuser`로 관리자 계정을 만들거나, 회원가입 페이지에서 새 계정을 생성해주세요.

```
