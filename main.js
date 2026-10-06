/* ============================================================
   planC base — main.js
   1) data-reveal のスクロール表示（IntersectionObserver）
   2) ハンバーガーメニューの開閉
   依存なし。DOM の最後で読み込む前提（index.html 末尾）。
   ============================================================ */
(function () {
  'use strict';

  /* JS が有効なときだけ [data-reveal] を初期非表示にする。
     JS が落ちた／エラーで止まった場合はコンテンツが最初から見える。 */
  document.documentElement.classList.add('js');

  /* ----------------------------------------------------------
     1) reveal
     ---------------------------------------------------------- */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!els.length) return;

    function show(el) { el.classList.add('is-shown'); }
    function showAll() { els.forEach(show); }

    // ⚠ 保険（元の x-dc 実装から必ず引き継ぐこと）
    // 画像が読み込めない／observer が発火しない等で永久に非表示になる事故を防ぐ。
    // 1800ms 経ったら理由を問わず全部表示する。
    var safety = setTimeout(showAll, 1800);

    if (!('IntersectionObserver' in window)) { clearTimeout(safety); showAll(); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        show(e.target);
        io.unobserve(e.target);
      });
    }, {
      // 元実装の「r.top < vh * 0.9」に相当。画面下から 10% 手前で表示を始める。
      rootMargin: '0px 0px -10% 0px',
      threshold: 0
    });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------
     2) ハンバーガー
     ---------------------------------------------------------- */
  function initNav() {
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('gnav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // ナビ内リンクを押したら閉じる
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    // Esc で閉じる
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });

    // PC 幅に戻ったら状態をリセット
    var mq = window.matchMedia('(min-width: 860px)')   /* CSS のナビ切替幅と必ず揃える */;
    var onChange = function (e) { if (e.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  initReveal();
  initNav();
})();
