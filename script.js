/**
 * Dr. Henrique Alves - Landing Page Interactive Script
 * Functionalities: Mobile Menu, Gallery Filters, Lightbox Modal, Header Scroll
 */

// Habilita a classe .js no elemento <html> para ativar as animações de scroll reveal
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header Scroll Effect
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu Fullscreen Overlay (Suporte robusto a toque em celular real)
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileOverlay = document.querySelector('.mobile-menu-overlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-list a');

  function openMobileMenu() {
    if (!mobileOverlay) return;
    mobileOverlay.classList.add('active');
    mobileToggle?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!mobileOverlay) return;
    mobileOverlay.classList.remove('active');
    mobileToggle?.classList.remove('active');
    document.body.style.overflow = '';
  }

  let lastTouchTime = 0;

  function toggleMobileMenu(e) {
    if (e && e.type === 'touchend') {
      lastTouchTime = Date.now();
      if (e.cancelable) e.preventDefault();
    } else if (e && e.type === 'click') {
      if (Date.now() - lastTouchTime < 500) {
        return; // Evita disparo duplo caso o navegador sintetize evento click logo após touchend
      }
    }
    
    if (mobileOverlay?.classList.contains('active')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('touchend', toggleMobileMenu, { passive: false });
    mobileToggle.addEventListener('click', toggleMobileMenu);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      closeMobileMenu();
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          setTimeout(() => {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
      }
    });
  });

  // Fechar ao tocar no overlay de fundo fora dos elementos de navegação
  mobileOverlay?.addEventListener('click', (e) => {
    if (e.target === mobileOverlay) {
      closeMobileMenu();
    }
  });

  // 3. Gallery Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const resultCards = document.querySelectorAll('.result-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      resultCards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'block';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 4. Lightbox Modal para os Cards de Depoimento (Marquee)
  const lightboxModal = document.querySelector('.lightbox-modal');
  const lightboxImg = document.querySelector('.lightbox-img');
  const lightboxCaption = document.querySelector('.lightbox-caption');
  const lightboxClose = document.querySelector('.lightbox-close');
  const socialCards = document.querySelectorAll('.social-card');
  const resultadosCards = document.querySelectorAll('.resultados-card');

  function bindLightboxCard(card) {
    card.addEventListener('click', (e) => {
      // No mobile (abaixo de 768px), ignora o toque no card para não travar nem disparar ações
      if (window.innerWidth < 768) {
        e.preventDefault();
        return;
      }

      const img = card.querySelector('img');
      const hasTitle = card.hasAttribute('data-title');
      const title = hasTitle ? card.getAttribute('data-title') : (card.classList.contains('resultados-card') ? '' : (img?.alt || 'Dr. Henrique Alves'));
      const subtitle = card.getAttribute('data-subtitle') || '';

      if (img && lightboxModal && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || 'Caso clínico Dr. Henrique Alves';
        if (lightboxCaption) {
          if (title && subtitle) {
            lightboxCaption.innerHTML = `<strong>${title}</strong><br><span style="font-size: 0.9rem; opacity: 0.8; font-family: var(--font-sans);">${subtitle}</span>`;
          } else if (title) {
            lightboxCaption.innerHTML = `<strong>${title}</strong>`;
          } else if (subtitle) {
            lightboxCaption.innerHTML = `<span style="font-size: 0.95rem; opacity: 0.9; font-family: var(--font-sans);">${subtitle}</span>`;
          } else {
            lightboxCaption.innerHTML = '';
          }
        }
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  socialCards.forEach(bindLightboxCard);
  resultadosCards.forEach(bindLightboxCard);

  function closeLightbox() {
    lightboxModal?.classList.remove('active');
    document.body.style.overflow = '';
  }

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxModal?.addEventListener('click', (e) => {
    if (e.target === lightboxModal) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeMobileMenu();
    }
  });

  // 5. Scroll Reveal Animations (IntersectionObserver)
  const revealElements = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('in'));
  }
});
