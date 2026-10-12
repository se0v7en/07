/* ============================================
   六页翻页 · 自动缩放画布（避开顶底文字框）· 内容编辑 · 音乐
   ============================================ */
(function () {
  const DESIGN_W = 800;
  const DESIGN_H = 600;

  const viewport  = document.getElementById('viewport');
  const topBar    = document.getElementById('topBar');
  const bottomBar = document.getElementById('bottomBar');
  const slides    = document.querySelectorAll('.slide');
  let cur = 0;

  /* ============================================
     ★ 核心：把 800×600 画布等比缩放进中间可用区域
     可用区域 = 屏幕 - 顶部栏 - 底部栏 - 四周留白
     ============================================ */
  function fitViewport() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const topH    = topBar.offsetHeight;
    const bottomH = bottomBar.offsetHeight;

    const padding = 16;                              // 画布四周留白
    const availW  = vw - padding * 2;
    const availH  = vh - topH - bottomH - padding * 2;

    const scale = Math.min(availW / DESIGN_W, availH / DESIGN_H);

    // 画布垂直位置：位于顶栏和底栏之间的正中
    const centerX = vw / 2;
    const centerY = topH + (vh - topH - bottomH) / 2;

    viewport.style.left = centerX + 'px';
    viewport.style.top  = centerY + 'px';
    viewport.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  window.addEventListener('resize', fitViewport);
  window.addEventListener('orientationchange', () => setTimeout(fitViewport, 120));

  // 顶底文字框高度变化时也重新适配
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(fitViewport);
    ro.observe(topBar);
    ro.observe(bottomBar);
  }

  // 初次适配
  fitViewport();
  // 图片/字体加载后再校准一次
  window.addEventListener('load', fitViewport);

  /* ============================================
     翻页
     ============================================ */
  window.goTo = function (i) {
    if (i < 0 || i >= slides.length) return;
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    cur = i;
  };

  document.addEventListener('keydown', e => {
    if (document.activeElement && document.activeElement.isContentEditable) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); goTo(cur + 1); }
    if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  { e.preventDefault(); goTo(cur - 1); }
  });

  // 触屏滑动（只在画布内有效，避免误触顶底文字框）
  let tX = 0;
  viewport.addEventListener('touchstart', e => tX = e.touches[0].clientX, { passive: true });
  viewport.addEventListener('touchend', e => {
    const d = e.changedTouches[0].clientX - tX;
    if (Math.abs(d) > 60) goTo(cur + (d < 0 ? 1 : -1));
  }, { passive: true });

  /* ============================================
     文字自动保存 / 恢复
     ============================================ */
  document.addEventListener('input', e => {
    const el = e.target.closest('[data-key]');
    if (el) {
      localStorage.setItem('edit_' + el.dataset.key, el.textContent);
      // 顶底文字框内容变长时，重新适配画布
      if (el.dataset.key === 'top_text' || el.dataset.key === 'bottom_text') {
        requestAnimationFrame(fitViewport);
      }
    }
    if (e.target.classList.contains('link-label')) {
      localStorage.setItem('linkLabel' + e.target.dataset.linkLabel, e.target.value);
    }
  });
  document.querySelectorAll('[data-key]').forEach(el => {
    const v = localStorage.getItem('edit_' + el.dataset.key);
    if (v !== null) el.textContent = v;
  });
  document.querySelectorAll('.link-label').forEach(inp => {
    const v = localStorage.getItem('linkLabel' + inp.dataset.linkLabel);
    if (v !== null) inp.value = v;
  });

  /* ============================================
     头像上传
     ============================================ */
  const avUp = document.getElementById('avatarUploader');
  let curAv = null;
  window.uploadAvatar = n => { curAv = 'avatar' + n; avUp.click(); };
  avUp.addEventListener('change', function () {
    const f = this.files[0]; if (!f || !curAv) return;
    const r = new FileReader();
    r.onload = e => {
      const img = document.getElementById(curAv);
      if (img) { img.src = e.target.result; img.classList.add('visible'); }
      localStorage.setItem('img_' + curAv, e.target.result);
    };
    r.readAsDataURL(f); this.value = '';
  });

  /* ============================================
     图片上传
     ============================================ */
  const imUp = document.getElementById('imageUploader');
  let curIm = null;
  window.uploadImage = (p, s) => { curIm = 'img_p' + p + '_' + s; imUp.click(); };
  imUp.addEventListener('change', function () {
    const f = this.files[0]; if (!f || !curIm) return;
    const r = new FileReader();
    r.onload = e => {
      const img = document.getElementById(curIm);
      if (img) { img.src = e.target.result; img.classList.add('visible'); }
      localStorage.setItem('img_' + curIm, e.target.result);
    };
    r.readAsDataURL(f); this.value = '';
  });

  // 恢复所有图片 / 头像
  ['avatar1','avatar2',
   'img_p2_big','img_p2_side',
   'img_p3_back','img_p3_front',
   'img_p4_mini1','img_p4_mini2','img_p4_mini3','img_p4_tall','img_p4_side',
   'img_p5_i1','img_p5_i2','img_p5_i3','img_p5_i4',
   'img_p6_i1','img_p6_i2','img_p6_i3'
  ].forEach(id => {
    const v = localStorage.getItem('img_' + id);
    if (!v) return;
    const img = document.getElementById(id);
    if (img) { img.src = v; img.classList.add('visible'); }
  });

  /* ============================================
     链接地址（右键 / 长按编辑）
     ============================================ */
  document.querySelectorAll('.link-card').forEach(c => {
    c.addEventListener('contextmenu', e => {
      e.preventDefault();
      const n = c.dataset.link;
      const curUrl = (c.href === '#' || c.href.endsWith('#')) ? '' : c.href;
      const url = prompt('输入链接地址（完整 URL）：', curUrl);
      if (url !== null) {
        c.href = url || '#';
        localStorage.setItem('linkUrl' + n, url || '#');
      }
    });
    const saved = localStorage.getItem('linkUrl' + c.dataset.link);
    if (saved) c.href = saved;
  });

  /* ============================================
     音乐
     ============================================ */
  const bgm = document.getElementById('bgm');
  const mBtn = document.getElementById('musicBtn');
  mBtn.addEventListener('click', () => {
    if (bgm.paused) { bgm.play().catch(()=>{}); mBtn.textContent = '❚❚'; }
    else { bgm.pause(); mBtn.textContent = '▶'; }
  });
  bgm.addEventListener('play', () => mBtn.textContent = '❚❚');
  bgm.addEventListener('pause', () => mBtn.textContent = '▶');

  goTo(0);
})();
