// static/js/sidebar.js
document.addEventListener('DOMContentLoaded', () => {
  const listContainer = document.getElementById('sidebar-list-container');
  const titleElem = document.getElementById('sidebar-title');
  const descElem = document.getElementById('sidebar-desc');
  const addBtn = document.getElementById('sidebar-add-btn');

  const path = window.location.pathname;
  const token = localStorage.getItem('accessToken');

  if (!token) {
    if (listContainer) listContainer.innerHTML = "<p style='padding:15px'>로그인이 필요합니다.</p>";
    return;
  }

  let config = null;

  if (path.includes('/resume/')) {
    document.getElementById('tab-resume')?.classList.add('active');
    config = {
      api: '/api/cover-letters/',
      title: '회사별 자소서',
      desc: '작성한 자기소개서 목록입니다.',
      icon: '📄',
      emptyMsg: '작성된 자소서가 없습니다.',
      type: 'coverletters',
    };
  } else if (path.includes('/experience/')) {
    document.getElementById('tab-experience')?.classList.add('active');
    config = {
      api: '/api/experiences/',
      title: '경험 정리 서류',
      desc: '너만의 경험 도토리 창고',
      icon: '📘',
      emptyMsg: '등록된 경험이 없습니다.',
      type: 'experiences',
    };
  } else if (path.includes('/mungteong/') || path.includes('/chat/')) {
    document.getElementById('tab-mungteong')?.classList.add('active');
    config = {
      api: '/api/career/sessions/',
      title: '채팅 기록',
      desc: 'AI와 나눈 대화 목록입니다.',
      icon: '💬',
      emptyMsg: '대화 기록이 없습니다.',
      type: 'sessions',
    };
  } else {
    if (listContainer) listContainer.innerHTML = "<p style='padding:15px; color:#888;'>참고할 문서를 선택해주세요.</p>";
    return;
  }

  if (titleElem) titleElem.textContent = config.title;
  if (descElem) descElem.textContent = config.desc;

  if (addBtn) {
    addBtn.addEventListener('click', async () => {
      try {
        localStorage.removeItem('careerSessionId');

        const res = await fetch('/api/career/sessions/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login/';
          return;
        }

        if (!res.ok) {
          throw new Error('세션 생성 실패');
        }

        const data = await res.json();
        const newSessionId = String(data.session_id);

        localStorage.setItem('careerSessionId', newSessionId);
        window.location.href = '/chat/';
      } catch (e) {
        console.error(e);
        alert('새 대화를 시작할 수 없습니다. 다시 시도해주세요.');
      }
    });
  }

  if (listContainer) {
    listContainer.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-session-id]');
      if (!link) return;

      e.preventDefault();
      const sid = link.dataset.sessionId;
      localStorage.setItem('careerSessionId', sid);
      window.location.href = '/chat/';
    });
  }

  fetchList(config);

  async function fetchList(cfg) {
    try {
      const response = await fetch(cfg.api, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login/';
        return;
      }

      if (!response.ok) {
        if (listContainer) listContainer.innerHTML = "<p style='padding:15px'>목록을 불러올 수 없습니다.</p>";
        return;
      }

      const data = await response.json();
      let items = data;
      if (cfg.type === 'sessions') {
        items = data.sessions || [];
      }

      renderSidebarList(items, cfg);

    } catch (error) {
      console.error(error);
      if (listContainer) listContainer.innerHTML = "<p style='padding:15px'>서버 오류 발생</p>";
    }
  }

  function renderSidebarList(items, cfg) {
    if (!listContainer) return;
    listContainer.innerHTML = "";

    if (!items || items.length === 0) {
      listContainer.innerHTML = `<p style='padding:20px; text-align:center; color:#999;'>${cfg.emptyMsg}</p>`;
      return;
    }

    items.forEach(item => {
      const title =
        cfg.type === 'sessions'
          ? (item.title || `세션 #${item.session_id}`)
          : (item.title || `항목 #${item.id}`);

      const id =
        cfg.type === 'sessions'
          ? item.session_id
          : item.id;

      const actionHtml =
        cfg.type === 'sessions'
          ? `<a href="/chat/" data-session-id="${id}">불러오기</a>`
          : `<a href="#" onclick="alert('준비 중인 기능입니다: ${id}')">불러오기</a>`;

      const html = `
        <div class="doc-item">
          <div class="doc-item-info">
            <span class="doc-icon">${cfg.icon}</span>
            <strong>${title}</strong>
          </div>
          <div class="doc-item-actions">
            ${actionHtml}
          </div>
        </div>
      `;
      listContainer.innerHTML += html;
    });
  }
});
