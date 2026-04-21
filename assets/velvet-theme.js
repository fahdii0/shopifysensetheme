(() => {
  document.documentElement.classList.add('reveal-ready');

  const SECTION_SELECTOR = '#MainContent > .shopify-section';
  const REVEAL_CLASS = 'velvet-reveal';
  const VISIBLE_CLASS = 'is-visible';
  const MAGNETIC_SELECTOR = '.button--primary, .product-form__submit, .sticky-mobile-buy-bar__button, .shopify-payment-button__button--unbranded';

  function canAnimate() {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function collectSections(root = document) {
    if (!document.body.classList.contains('template-index') && !window.Shopify?.designMode) {
      return [];
    }

    return Array.from(root.querySelectorAll(SECTION_SELECTOR)).filter((section) => {
      return !section.classList.contains('shopify-section-group-header-group');
    });
  }

  function revealAll(sections) {
    sections.forEach((section) => section.classList.add(VISIBLE_CLASS));
  }

  function initReveal(root = document) {
    const sections = collectSections(root);
    if (!sections.length) return;

    sections.forEach((section, index) => {
      section.classList.add(REVEAL_CLASS);
      section.style.setProperty('--velvet-reveal-order', String(index));
    });

    if (!canAnimate()) {
      revealAll(sections);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(VISIBLE_CLASS);
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.08,
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  function initMagneticButtons(root = document) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const buttons = Array.from(root.querySelectorAll(MAGNETIC_SELECTOR));
    buttons.forEach((button) => {
      if (button.dataset.magneticBound === 'true') return;
      button.dataset.magneticBound = 'true';

      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
        const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
        button.style.setProperty('--magnetic-x', `${offsetX.toFixed(2)}px`);
        button.style.setProperty('--magnetic-y', `${offsetY.toFixed(2)}px`);
        button.style.transform = `translate3d(var(--magnetic-x, 0), var(--magnetic-y, 0), 0)`;
      });

      button.addEventListener('pointerleave', () => {
        button.style.removeProperty('--magnetic-x');
        button.style.removeProperty('--magnetic-y');
        button.style.transform = '';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => initReveal(document));
  document.addEventListener('DOMContentLoaded', () => initMagneticButtons(document));

  if (window.Shopify && Shopify.designMode) {
    document.addEventListener('shopify:section:load', () => initReveal(document));
    document.addEventListener('shopify:section:reorder', () => initReveal(document));
    document.addEventListener('shopify:section:load', () => initMagneticButtons(document));
    document.addEventListener('shopify:section:reorder', () => initMagneticButtons(document));
  }
})();
