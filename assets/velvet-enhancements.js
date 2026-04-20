(() => {
  const SELECTORS = {
    reveal: '.velvet-reveal',
    addForm: '.js-velvet-add-form',
    popup: '[data-velvet-newsletter-popup]',
    popupClose: '[data-velvet-popup-close]',
    toast: '[data-velvet-toast]',
    marquee: '[data-velvet-marquee]'
  };

  function initReveal() {
    const nodes = Array.from(document.querySelectorAll(SELECTORS.reveal));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    nodes.forEach((node) => observer.observe(node));
  }

  function initStickyHeaderTint() {
    const header = document.querySelector('.section-header');
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle('is-velvet-sticky', window.scrollY > 8);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  async function updateCartDrawer() {
    const drawer = document.querySelector('cart-drawer');
    if (!drawer) return;

    const response = await fetch(`${window.routes.cart_url}?section_id=cart-drawer`);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const source = doc.querySelector('cart-drawer');
    const target = document.querySelector('cart-drawer');

    if (source && target) {
      target.innerHTML = source.innerHTML;
      if (typeof target.open === 'function') target.open();
    }
  }

  function showToast(message) {
    const toast = document.querySelector(SELECTORS.toast);
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  function initAjaxAddToCart() {
    const forms = Array.from(document.querySelectorAll(SELECTORS.addForm));
    if (!forms.length) return;

    forms.forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const button = form.querySelector('[type="submit"]');
        if (button) button.disabled = true;

        try {
          const formData = new FormData(form);
          formData.append('sections', 'cart-drawer,cart-icon-bubble');
          formData.append('sections_url', window.location.pathname);

          const response = await fetch(window.routes.cart_add_url, {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: formData,
          });

          const payload = await response.json();
          if (payload.status) throw new Error(payload.description || 'Unable to add product');

          await updateCartDrawer();
          showToast(window.velvetStrings?.added || 'Added to cart');
        } catch (error) {
          showToast(error.message || (window.velvetStrings?.error || 'Something went wrong'));
        } finally {
          if (button) button.disabled = false;
        }
      });
    });
  }

  function initNewsletterPopup() {
    const popup = document.querySelector(SELECTORS.popup);
    if (!popup) return;

    const storageKey = popup.dataset.storageKey || 'velvet_newsletter_seen';
    if (localStorage.getItem(storageKey) === '1') return;

    const delay = Number(popup.dataset.delay || 5000);
    const close = () => {
      popup.classList.remove('is-open');
      localStorage.setItem(storageKey, '1');
    };

    setTimeout(() => popup.classList.add('is-open'), delay);

    popup.addEventListener('click', (event) => {
      if (event.target === popup || event.target.matches(SELECTORS.popupClose)) {
        close();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && popup.classList.contains('is-open')) close();
    });
  }

  function initMarqueePauseOnHover() {
    const marquee = document.querySelector(SELECTORS.marquee);
    if (!marquee) return;

    marquee.addEventListener('mouseenter', () => {
      const text = marquee.querySelector('span');
      if (text) text.style.animationPlayState = 'paused';
    });

    marquee.addEventListener('mouseleave', () => {
      const text = marquee.querySelector('span');
      if (text) text.style.animationPlayState = 'running';
    });
  }

  function init() {
    initReveal();
    initStickyHeaderTint();
    initAjaxAddToCart();
    initNewsletterPopup();
    initMarqueePauseOnHover();
  }

  document.addEventListener('DOMContentLoaded', init);

  if (window.Shopify && Shopify.designMode) {
    document.addEventListener('shopify:section:load', init);
  }
})();
