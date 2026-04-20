(() => {
  const SECTION_SELECTOR = '#MainContent > .shopify-section';
  const REVEAL_CLASS = 'velvet-reveal';
  const VISIBLE_CLASS = 'is-visible';

  function canAnimate() {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function collectSections(root = document) {
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

  document.addEventListener('DOMContentLoaded', () => initReveal(document));

  if (window.Shopify && Shopify.designMode) {
    document.addEventListener('shopify:section:load', () => initReveal(document));
    document.addEventListener('shopify:section:reorder', () => initReveal(document));
  }
})();
