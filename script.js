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

  // 2. Smooth Scroll em Links Internos (Desktop e Geral)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#' && targetId.startsWith('#')) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
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

  // 4. Sistema do Modal Lightbox (Zoom de Fotos)
  const lightboxModal = document.querySelector('.lightbox-modal');
  const lightboxImg = document.querySelector('.lightbox-img');
  const lightboxCaption = document.querySelector('.lightbox-caption');
  const lightboxClose = document.querySelector('.lightbox-close');

  function openLightbox(card) {
    if (!card) return;
    const img = card.querySelector('img');
    if (!img || !lightboxModal || !lightboxImg) return;

    const hasTitle = card.hasAttribute('data-title');
    const title = hasTitle ? card.getAttribute('data-title') : (card.classList.contains('resultados-card') ? '' : (img.alt || 'Dr. Henrique Alves'));
    const subtitle = card.getAttribute('data-subtitle') || '';

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || 'Procedimento Dr. Henrique Alves';

    if (lightboxCaption) {
      if (title && subtitle) {
        lightboxCaption.innerHTML = `<strong style="font-size: 1.15rem; color: #FFFFFF; font-family: var(--font-serif); letter-spacing: 0.03em;">${title}</strong><div style="font-size: 0.9rem; opacity: 0.85; margin-top: 0.35rem; font-family: var(--font-sans); color: #E8E0D7; line-height: 1.4;">${subtitle}</div>`;
      } else if (title) {
        lightboxCaption.innerHTML = `<strong style="font-size: 1.15rem; color: #FFFFFF; font-family: var(--font-serif);">${title}</strong>`;
      } else if (subtitle) {
        lightboxCaption.innerHTML = `<div style="font-size: 0.95rem; opacity: 0.9; font-family: var(--font-sans); color: #E8E0D7; line-height: 1.4;">${subtitle}</div>`;
      } else {
        lightboxCaption.innerHTML = '';
      }
    }

    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightboxModal?.classList.remove('active');
    document.body.style.overflow = '';
  }

  lightboxClose?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  lightboxModal?.addEventListener('click', (e) => {
    if (e.target === lightboxModal || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  });

  // 5. Scroll Reveal Animations (IntersectionObserver a 60fps)
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
      threshold: 0.10,
      rootMargin: '0px 0px -40px 0px'
    });
    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('in'));
  }

  // 6. Motor de Carrossel Infinito + Arraste + Abertura de Imagens Unificados (60fps HWA)
  function initMarqueeLoops() {
    const wrappers = document.querySelectorAll('.social-marquee-wrapper, .resultados-marquee-wrapper');

    wrappers.forEach(wrapper => {
      const track = wrapper.querySelector('.social-marquee-track, .resultados-marquee-track');
      if (!track) return;

      // Desativa animação CSS pura para assumir o controle dinâmico 60fps via JS
      track.style.animation = 'none';
      track.style.willChange = 'transform';
      wrapper.style.touchAction = 'pan-y';
      wrapper.style.userSelect = 'none';
      wrapper.style.webkitUserSelect = 'none';

      // Sentido de rolagem: Left to Right ou Right to Left
      const isLeftToRight = track.classList.contains('marquee-left-to-right');
      const baseSpeed = isLeftToRight ? 0.7 : -0.7; // Velocidade suave

      let currentX = 0;
      let isDragging = false;
      let isVisible = true;
      let startX = 0;
      let startY = 0;
      let dragStartX = 0;
      let hasDragged = false;
      let pointerDownTime = 0;
      let clickedCard = null;
      let halfWidth = 0;
      let animationFrameId = null;

      const updateHalfWidth = () => {
        const calculatedHalf = track.scrollWidth / 2;
        if (calculatedHalf > 0) {
          halfWidth = calculatedHalf;
          if (currentX === 0 && isLeftToRight) {
            currentX = -halfWidth;
          }
        }
      };

      updateHalfWidth();

      // Monitora carregamento assíncrono de imagens no GitHub Pages
      track.querySelectorAll('img').forEach(img => {
        if (img.complete) {
          updateHalfWidth();
        } else {
          img.addEventListener('load', updateHalfWidth, { passive: true });
        }
      });

      if ('ResizeObserver' in window) {
        const ro = new ResizeObserver(() => updateHalfWidth());
        ro.observe(track);
      }

      window.addEventListener('resize', updateHalfWidth, { passive: true });
      window.addEventListener('load', updateHalfWidth, { passive: true });

      // Animação Contínua 60fps
      const animateMarquee = () => {
        if (halfWidth <= 0) {
          updateHalfWidth();
        }
        if (isVisible && !isDragging && halfWidth > 0) {
          currentX += baseSpeed;
          if (currentX <= -halfWidth) {
            currentX += halfWidth;
          } else if (currentX > 0) {
            currentX -= halfWidth;
          }
          track.style.transform = `translate3d(${currentX.toFixed(2)}px, 0, 0)`;
        }
        if (isVisible) {
          animationFrameId = requestAnimationFrame(animateMarquee);
        }
      };

      // IntersectionObserver para pausar quando fora da tela
      if ('IntersectionObserver' in window) {
        const visibilityObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            const wasVisible = isVisible;
            isVisible = entry.isIntersecting;
            if (isVisible && !wasVisible) {
              cancelAnimationFrame(animationFrameId);
              animationFrameId = requestAnimationFrame(animateMarquee);
            }
          });
        }, { rootMargin: '100px' });
        visibilityObserver.observe(wrapper);
      }

      animationFrameId = requestAnimationFrame(animateMarquee);

      // Eventos de Ponteiro Unificados (Mouse no PC e Touch no Mobile)
      const onPointerDown = (e) => {
        if (e.button !== undefined && e.button !== 0) return;

        isDragging = true;
        hasDragged = false;
        startX = e.clientX;
        startY = e.clientY;
        dragStartX = currentX;
        pointerDownTime = Date.now();
        clickedCard = e.target.closest('.social-card, .resultados-card');
        updateHalfWidth();
        wrapper.classList.add('is-dragging');
      };

      const onPointerMove = (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        // Se o movimento for maior que 6px, registra como arraste/swipe
        if (Math.hypot(deltaX, deltaY) > 6) {
          hasDragged = true;
        }

        currentX = dragStartX + deltaX;

        // Wrap infinito contínuo mesmo ao arrastar longas distâncias
        if (halfWidth > 0) {
          while (currentX <= -halfWidth) {
            currentX += halfWidth;
            dragStartX += halfWidth;
          }
          while (currentX > 0) {
            currentX -= halfWidth;
            dragStartX -= halfWidth;
          }
        }

        track.style.transform = `translate3d(${currentX.toFixed(2)}px, 0, 0)`;
      };

      const onPointerUp = (e) => {
        if (!isDragging) return;
        isDragging = false;
        wrapper.classList.remove('is-dragging');

        const pressDuration = Date.now() - pointerDownTime;

        // Se NÃO arrastou e foi um toque/clique rápido (< 500ms): ABRE O MODAL LIGHTBOX!
        if (!hasDragged && pressDuration < 500 && clickedCard) {
          openLightbox(clickedCard);
        }

        clickedCard = null;
      };

      wrapper.addEventListener('pointerdown', onPointerDown, { passive: true });
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerup', onPointerUp, { passive: true });
      window.addEventListener('pointercancel', () => {
        isDragging = false;
        wrapper.classList.remove('is-dragging');
        clickedCard = null;
      }, { passive: true });
    });
  }

  initMarqueeLoops();
});
