(function() {
    function alignMarginNotes() {
        const wrappers = document.querySelectorAll('.mn-wrapper');

        wrappers.forEach(wrapper => {
            const anchor = wrapper.querySelector('.mn-anchor');
            const noteContent = wrapper.querySelector('.mn-content');

            if (anchor && noteContent) {
                // 1. Get the top position of the anchor *relative to the wrapper*
                // This is the crucial coordinate for perfect alignment.
                const anchorTop = anchor.offsetTop; 
                
                // 2. Apply this position to the margin note content
                // Note: We use 'top' to achieve the vertical alignment.
                noteContent.style.top = `${anchorTop}px`;
                
                // 3. Make it visible once positioned
                noteContent.style.opacity = 1;
            }
        });
    }

    // Run the alignment script when the page loads
    window.addEventListener('load', alignMarginNotes);

    // Run the alignment script every time the window is resized (solves redraws)
    window.addEventListener('resize', alignMarginNotes);
})();