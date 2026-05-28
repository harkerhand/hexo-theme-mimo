// Stagger reveal timing for sections
Array.from(document.querySelectorAll('.reveal')).forEach((el, i) => {
  el.style.animationDelay = `${i * 80}ms`;
});

const heroPanel = document.querySelector('.hero-panel');
const lens = document.querySelector('.hero-lens');

if (heroPanel && lens && lens.dataset.followMouse === 'true') {
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

Array.from(document.querySelectorAll('figure.highlight')).forEach((block) => {
  const langClass = Array.from(block.classList).find((cls) => cls !== 'highlight');
  if (langClass) {
    block.setAttribute('data-lang', langClass);
  }
});
