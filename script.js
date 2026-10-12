/* ============================================
   六页翻页 · 画布自适应 · 音乐播放
   （内容全部在 HTML 中修改，本文件只做交互）
   ============================================ */
(function () {
  const DESIGN_W = 600;
  const DESIGN_H = 800;

  const viewport  = document.getElementById('viewport');
  const topBar    = document.querySelector('.top-bar');
  const bottomBar = document.querySelector('.bottom-bar');
  const slides    = document.querySelectorAll('.slide');
  let cur = 0;

  /* ============================================
     画布自适应
     ============================================ */
  function fitViewport() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const topH    = topBar.offsetHeight;
    const bottomH = bottomBar.offsetHeight;
    const padding = 16;

    const availW = vw - padding * 2;
    const availH = vh - topH - bottomH - padding * 2;
    const scale  = Math.min(availW / DESIGN_W, availH / DESIGN_H);

    const centerX = vw / 2;
    const centerY = topH + (vh - topH - bottomH) / 2;

    viewport.style.left = centerX + 'px';
    viewport.style.top  = centerY + 'px';
    viewport.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  window.addEventListener('resize', fitViewport);
  window.addEventListener('orientationchange', () => setTimeout(fitViewport, 120));
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(fitViewport);
    ro.observe(topBar);
    ro.observe(bottomBar);
  }
  fitViewport();
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
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); goTo(cur + 1); }
    if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  { e.preventDefault(); goTo(cur - 1); }
  });

  let tX = 0;
  viewport.addEventListener('touchstart', e => tX = e.touches[0].clientX, { passive: true });
  viewport.addEventListener('touchend', e => {
    const d = e.changedTouches[0].clientX - tX;
    if (Math.abs(d) > 60) goTo(cur + (d < 0 ? 1 : -1));
  }, { passive: true });

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
