function applyRevealDelays(root = document) {
  Array.from(root.querySelectorAll('.reveal')).forEach((el, i) => {
    el.style.animationDelay = `${i * 80}ms`;
  });
}

function initHeroLens(root = document) {
  const heroPanel = root.querySelector('.hero-panel');
  const lens = root.querySelector('.hero-lens');

  if (!heroPanel || !lens || lens.dataset.followMouse !== 'true') return;

  const moveLens = (event) => {
    const rect = heroPanel.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    lens.style.setProperty('--lens-left', `${(x / rect.width) * 100}%`);
    lens.style.setProperty('--lens-top', `${(y / rect.height) * 100}%`);
  };

  heroPanel.addEventListener('mouseenter', () => {
    lens.style.opacity = '1';
  });

  heroPanel.addEventListener('mousemove', moveLens);

  heroPanel.addEventListener('mouseleave', () => {
    lens.style.opacity = '0';
  });
}

let cleanupHomeBlogQuick = null;

function initHomeBlogQuick() {
  if (cleanupHomeBlogQuick) {
    cleanupHomeBlogQuick();
    cleanupHomeBlogQuick = null;
  }

  const jump = document.querySelector('[data-home-blog-jump="true"]');
  const blogHead = document.querySelector('#home-blog-head');
  const topbar = document.querySelector('.topbar');
  if (!jump) return;

  if (!blogHead || !topbar) {
    jump.style.display = 'none';
    return;
  }

  jump.style.display = '';

  const getTopbarHeight = () => topbar.getBoundingClientRect().height;
  const updateVisibility = () => {
    const rect = blogHead.getBoundingClientRect();
    const topbarHeight = getTopbarHeight();
    const fullyVisible = rect.top >= topbarHeight && rect.bottom <= window.innerHeight;
    jump.classList.toggle('is-hidden', fullyVisible);
  };

  const onClick = (event) => {
    event.preventDefault();
    const targetTop = window.scrollY + blogHead.getBoundingClientRect().top - getTopbarHeight() - 8;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
  };

  jump.addEventListener('click', onClick);
  window.addEventListener('scroll', updateVisibility, { passive: true });
  window.addEventListener('resize', updateVisibility);
  updateVisibility();

  cleanupHomeBlogQuick = () => {
    jump.removeEventListener('click', onClick);
    window.removeEventListener('scroll', updateVisibility);
    window.removeEventListener('resize', updateVisibility);
  };
}

function initPage(root = document, options = {}) {
  const animate = options.animate !== false;
  if (animate) applyRevealDelays(root);
  initHeroLens(root);
  initHomeBlogQuick();
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(root, {
      delimiters: [
        {left: "$$", right: "$$", display: true},
        {left: "$", right: "$", display: false}
      ],
      throwOnError: false
    });
  }
}

function isInternalNavLink(anchor) {
  if (!anchor || !anchor.href) return false;
  if (anchor.target && anchor.target !== '_self') return false;
  if (anchor.hasAttribute('download')) return false;
  if (anchor.getAttribute('rel') === 'external') return false;

  const url = new URL(anchor.href, window.location.origin);
  if (url.origin !== window.location.origin) return false;
  if (url.hash && url.pathname === window.location.pathname && url.search === window.location.search) return false;
  return true;
}

async function loadPage(url, push = true) {
  const main = document.querySelector('main.container');
  if (!main) {
    window.location.href = url;
    return;
  }

  try {
    const response = await fetch(url, {
      headers: { 'X-Requested-With': 'PJAX' }
    });

    if (!response.ok) {
      window.location.href = url;
      return;
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const nextMain = doc.querySelector('main.container');
    if (!nextMain) {
      window.location.href = url;
      return;
    }

    document.title = doc.title || document.title;
    main.innerHTML = nextMain.innerHTML;

    if (push) window.history.pushState({}, '', url);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    initPage(main, { animate: false });
  } catch (_err) {
    window.location.href = url;
  }
}

document.addEventListener('click', (event) => {
  const anchor = event.target.closest('a');
  if (!isInternalNavLink(anchor)) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  event.preventDefault();
  loadPage(anchor.href, true);
});

window.addEventListener('popstate', () => {
  loadPage(window.location.href, false);
});

initPage(document, { animate: true });
