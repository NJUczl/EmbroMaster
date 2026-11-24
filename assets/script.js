(() => {
  'use strict';
  const carousel = document.querySelector('#results-carousel');
  const slides = Array.from(carousel.querySelectorAll('.result-slide'));
  const dots = Array.from(document.querySelectorAll('[data-slide-to]'));
  const counter = document.querySelector('#result-counter');
  const announcement = document.querySelector('#result-announcement');
  let current = 0;
  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    dots.forEach((dot, i) => {
      if (i === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    counter.textContent = `${current + 1} / ${slides.length}`;
    announcement.textContent = `Result ${current + 1} of ${slides.length}`;
  }
  carousel.querySelector('.prev').addEventListener('click', () => showSlide(current - 1));
  carousel.querySelector('.next').addEventListener('click', () => showSlide(current + 1));
  dots.forEach((dot) => dot.addEventListener('click', () => showSlide(Number(dot.dataset.slideTo))));
  document.querySelector('#results').addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const focusedSlide = document.activeElement.closest('.result-slide');
    showSlide(current + (event.key === 'ArrowRight' ? 1 : -1));
    if (focusedSlide) slides[current].querySelector('button').focus({ preventScroll: true });
  });
  const stage = carousel.querySelector('.carousel-stage');
  let touchStart = null;
  let suppressImageClick = false;
  stage.addEventListener('touchstart', (event) => {
    if (event.touches.length !== 1) { touchStart = null; return; }
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    suppressImageClick = false;
  }, { passive: true });
  stage.addEventListener('touchend', (event) => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      suppressImageClick = true;
      showSlide(current + (dx < 0 ? 1 : -1));
      window.setTimeout(() => { suppressImageClick = false; }, 450);
    }
  }, { passive: true });
  stage.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
  const dialog = document.querySelector('#image-viewer');
  const largeImage = document.querySelector('#viewer-image');
  const title = document.querySelector('#viewer-title');
  const content = document.querySelector('#viewer-content');
  const zoomButton = document.querySelector('#viewer-zoom');
  let opener = null;
  function setZoom(zoomed) {
    content.classList.toggle('is-zoomed', zoomed);
    zoomButton.textContent = zoomed ? 'Fit to screen' : 'Original size';
    zoomButton.setAttribute('aria-pressed', String(zoomed));
    content.scrollTop = 0;
    content.scrollLeft = 0;
  }
  document.querySelectorAll('.figure-button').forEach((button) => {
    button.addEventListener('click', () => {
      if (suppressImageClick && stage.contains(button)) return;
      opener = button;
      const image = button.querySelector('img');
      largeImage.src = image.currentSrc || image.src;
      largeImage.alt = image.alt;
      title.textContent = button.dataset.title;
      setZoom(false);
      dialog.showModal();
      document.body.classList.add('modal-open');
    });
  });
  zoomButton.addEventListener('click', () => setZoom(!content.classList.contains('is-zoomed')));
  largeImage.addEventListener('click', () => setZoom(!content.classList.contains('is-zoomed')));
  document.querySelector('#viewer-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    setZoom(false);
    if (opener) opener.focus({ preventScroll: true });
  });
  showSlide(0);
})();
