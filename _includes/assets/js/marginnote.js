(function () {
  function alignMarginNotes() {
    const wrappers = document.querySelectorAll('.mn-wrapper');

    wrappers.forEach((wrapper) => {
      const anchor = wrapper.querySelector('.mn-anchor');
      const noteContent = wrapper.querySelector('.mn-content');

      if (!anchor || !noteContent) return;

      // If CSS has made notes static (e.g. mobile), don't try to position.
      const computed = window.getComputedStyle(noteContent);
      if (computed.position !== 'absolute' && computed.position !== 'fixed') {
        noteContent.style.opacity = 1;
        noteContent.style.top = '';
        noteContent.style.transform = '';
        return;
      }

      // Measure anchor relative to viewport
      const anchorRect = anchor.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();

      // Compute the anchor's top relative to the wrapper's coordinate space.
      const anchorTopWithinWrapper = anchorRect.top - wrapperRect.top;

      noteContent.style.top = `${Math.round(anchorTopWithinWrapper)}px`;
      noteContent.style.opacity = 1;
    });
  }

  function scheduleAlign() {
    // Defer to next frame to avoid layout thrash when called in quick succession.
    window.requestAnimationFrame(alignMarginNotes);
  }

  window.addEventListener('load', scheduleAlign);
  window.addEventListener('resize', scheduleAlign);

  // Re-align after webfonts load (important for precise vertical placement).
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleAlign);
  }
})();
