/* ============================================
   六页翻页系统 · 暗红色风格
   功能：翻页 / 书页特效 / 内容可编辑 / 本地保存
   ============================================ */

(function () {
  'use strict';

  // ===== 页面元素引用 =====
  const pages       = document.querySelectorAll('.page');
  const prevBtn     = document.getElementById('prevBtn');
  const nextBtn     = document.getElementById('nextBtn');
  const indicator   = document.getElementById('pageIndicator');
  const uploader    = document.getElementById('avatarUploader');

  const TOTAL = pages.length;   // 6
  let current = 0;              // 当前页索引 0~5
  let isAnimating = false;      // 翻页动画锁

  // ===== 初始化：恢复本地数据 =====
  function initFromStorage() {
    // 恢复所有 contenteditable 文字
    document.querySelectorAll('[data-key]').forEach(el => {
      const saved = localStorage.getItem('edit_' + el.dataset.key);
      if (saved) el.textContent = saved;
    });

    // 恢复头像
    [1, 3, 5].forEach(n => {
      const data = localStorage.getItem('avatar' + n);
      if (data) {
        const img = document.getElementById('avatarImg' + n);
        if (img) { img.src = data; img.classList.add('visible'); }
      }
    });

    // 恢复背景图（如果之前上传过）
    [1, 3, 5].forEach(n => {
      const bg = localStorage.getItem('bg' + n);
      if (bg) {
        const el = document.getElementById('pageBg' + n);
        if (el) el.style.backgroundImage = `url(${bg})`;
      }
    });

    // 恢复价格项
    const savedPrices = localStorage.getItem('priceItems');
    if (savedPrices) {
      try {
        const arr = JSON.parse(savedPrices);
        arr.forEach(p => renderPriceItem(p.name, p.amount));
      } catch (e) { /* ignore */ }
    }
    // 如果没有任何价格项，添加默认的
    if (document.getElementById('priceList').children.length === 0) {
      renderPriceItem('基础版', '¥ 100');
      renderPriceItem('标准版', '¥ 200');
      renderPriceItem('高级版', '¥ 500');
    }

    // 恢复链接地址
    [1,2,3,4].forEach(i => {
      const href = localStorage.getItem('linkHref' + i);
      const el = document.querySelector(`[data-key="link${i}"]`);
      if (href && el) el.href = href;
    });
  }

  // ===== 保存文字编辑 =====
  document.addEventListener('input', function (e) {
    const el = e.target.closest('[data-key]');
    if (el) {
      localStorage.setItem('edit_' + el.dataset.key, el.textContent.trim());
    }
  });

  // ===== 保存价格编辑 =====
  document.addEventListener('input', function (e) {
    const el = e.target.closest('.price-name, .price-amount');
    if (el) savePrices();
  });

  function savePrices() {
    const items = [];
    document.querySelectorAll('.price-item').forEach(item => {
      items.push({
        name: item.querySelector('.price-name').textContent.trim(),
        amount: item.querySelector('.price-amount').textContent.trim()
      });
    });
    localStorage.setItem('priceItems', JSON.stringify(items));
  }

  // ===== 动态添加价格项 =====
  window.addPriceItem = function () {
    renderPriceItem('新项目', '¥ 0');
    savePrices();
  };

  function renderPriceItem(name, amount) {
    const list = document.getElementById('priceList');
    const div = document.createElement('div');
    div.className = 'price-item';
    div.innerHTML = `
      <span class="price-name" contenteditable="true">${name}</span>
      <span class="price-amount" contenteditable="true">${amount}</span>
    `;
    list.appendChild(div);
  }

  // ===== 头像上传 =====
  let activeAvatarNum = null;  // 记录当前点击的是哪个头像

  [1, 3, 5].forEach(n => {
    const avatar = document.getElementById('avatar' + n);
    if (avatar) {
      avatar.addEventListener('click', function () {
        activeAvatarNum = n;
        uploader.click();
      });
    }
  });

  uploader.addEventListener('change', function () {
    const file = this.files[0];
    if (!file || !activeAvatarNum) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      const img = document.getElementById('avatarImg' + activeAvatarNum);
      img.src = ev.target.result;
      img.classList.add('visible');
      localStorage.setItem('avatar' + activeAvatarNum, ev.target.result);
    };
    reader.readAsDataURL(file);
    this.value = '';
  });

  // ===== 长按/右键编辑链接地址 =====
  document.querySelectorAll('.link-card').forEach((card, idx) => {
    card.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      const currentHref = this.href === '#' || this.href.endsWith('#') ? '' : this.href;
      const newUrl = prompt('输入链接地址（完整 URL）：', currentHref);
      if (newUrl !== null) {
        this.href = newUrl || '#';
        localStorage.setItem('linkHref' + (idx + 1), newUrl || '#');
      }
    });
  });

  // ===== 翻页核心逻辑 =====
  function goToPage(target) {
    if (isAnimating || target === current || target < 0 || target >= TOTAL) return;
    isAnimating = true;

    const goingForward = target > current;

    if (goingForward) {
      // 向前翻：当前页翻转 180 度
      for (let i = current; i < target; i++) {
        pages[i].classList.add('flipped', 'flipping');
      }
    } else {
      // 向后翻：目标页到当前页之间的页面翻回来
      for (let i = current - 1; i >= target; i--) {
        pages[i].classList.remove('flipped');
        pages[i].classList.add('flipping');
      }
    }

    current = target;
    updateUI();

    setTimeout(() => {
      pages.forEach(p => p.classList.remove('flipping'));
      isAnimating = false;
    }, 750);
  }

  function updateUI() {
    indicator.textContent = (current + 1) + ' / ' + TOTAL;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === TOTAL - 1;

    // 更新 z-index：已翻过的页在下层，当前页在最上层
    pages.forEach((p, i) => {
      if (i < current) {
        p.style.zIndex = i;           // 已翻走，压底层
      } else if (i === current) {
        p.style.zIndex = TOTAL + 1;    // 当前页最高
      } else {
        p.style.zIndex = TOTAL - i;    // 后面的页按顺序递减
      }
    });
  }

  // ===== 按钮事件 =====
  prevBtn.addEventListener('click', () => goToPage(current - 1));
  nextBtn.addEventListener('click', () => goToPage(current + 1));

  // ===== 键盘左右方向键 =====
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      goToPage(current + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      goToPage(current - 1);
    }
  });

  // ===== 触摸滑动翻页（移动端） =====
  let touchStartX = 0;
  document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 60) {
      if (dx < 0) goToPage(current + 1);  // 左滑 → 下一页
      else        goToPage(current - 1);  // 右滑 → 上一页
    }
  }, { passive: true });

  // ===== 启动 =====
  initFromStorage();
  updateUI();

})();
