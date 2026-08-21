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
    }
  });

  // 5. Scroll Reveal Animations (IntersectionObserver a 60fps com aceleração via GPU)
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
    // Fallback para navegadores sem suporte a IntersectionObserver
    revealElements.forEach(el => el.classList.add('in'));
  }

  // 6. Carrossel Infinito e Interativo de Depoimentos (Continuous Marquee Loop 60fps + Pointer Drag + Auto Resume + IntersectionObserver)
  function initMarqueeLoops() {
    const wrappers = document.querySelectorAll('.social-marquee-wrapper, .resultados-marquee-wrapper');

    wrappers.forEach(wrapper => {
      const track = wrapper.querySelector('.social-marquee-track, .resultados-marquee-track');
      if (!track) return;

      // Desativa animação CSS pura para assumir o controle 60fps via JS com suporte a Drag & Resume
      track.style.animation = 'none';
      track.style.willChange = 'transform';
      wrapper.style.touchAction = 'pan-y';
      wrapper.style.userSelect = 'none';
      wrapper.style.webkitUserSelect = 'none';

      // Sentido de rolagem: Left to Right ou Right to Left
      const isLeftToRight = track.classList.contains('marquee-left-to-right');
      const speed = isLeftToRight ? 0.65 : -0.65; // Velocidade contínua ultra-suave

      let currentX = 0;
      let isDragging = false;
      let isVisible = true;
      let startX = 0;
      let dragStartX = 0;
      let hasDragged = false;
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

      // Recalcula a largura dinamicamente quando as imagens terminarem de carregar em servidores remotos (GitHub Pages)
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

      // Loop de Animação Contínua (Roda apenas quando a seção estiver visível)
      const animateMarquee = () => {
        if (halfWidth <= 0) {
          updateHalfWidth();
        }
        if (isVisible && !isDragging && halfWidth > 0) {
          currentX += speed;
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

      // Pausa a execução no JS quando o carrossel rolar para fora da tela (Economia de CPU/Bateria)
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

      // Manipulação de Arraste (Mouse no PC e Touch no Celular via Pointer Events)
      const onPointerDown = (e) => {
        isDragging = true;
        hasDragged = false;
        startX = e.clientX;
        dragStartX = currentX;
        updateHalfWidth();
        wrapper.classList.add('is-dragging');
        if (e.pointerId !== undefined) {
          try { wrapper.setPointerCapture(e.pointerId); } catch (err) {}
        }
      };

      const onPointerMove = (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        if (Math.abs(deltaX) > 5) {
          hasDragged = true;
        }
        currentX = dragStartX + deltaX;

        // Mantém a rotação infinita contínua mesmo se a pessoa arrastar por muito tempo
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
        if (e && e.pointerId !== undefined) {
          try { wrapper.releasePointerCapture(e.pointerId); } catch (err) {}
        }
      };

      wrapper.addEventListener('pointerdown', onPointerDown, { passive: true });
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerup', onPointerUp, { passive: true });
      window.addEventListener('pointercancel', onPointerUp, { passive: true });

      // Previne abrir a foto em lightbox se o usuário estava apenas arrastando
      wrapper.addEventListener('click', (e) => {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
    });
  }

  initMarqueeLoops();
});
