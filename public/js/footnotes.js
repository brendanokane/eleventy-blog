// Collect all .fn-content elements and build footnotes section
(function() {
	const footnotes = document.querySelectorAll('.fn-content');
	if (footnotes.length === 0) return;

	const section = document.createElement('section');
	section.className = 'footnotes';
	section.innerHTML = '<hr class="footnotes-separator"><h2 class="footnotes-title">Notes</h2><ol class="footnotes-list"></ol>';

	const list = section.querySelector('.footnotes-list');

	footnotes.forEach((fn) => {
		const li = document.createElement('li');
		li.id = fn.id;

		// Extract content (skip the fn-number span)
		const number = fn.querySelector('.fn-number');
		const content = fn.innerHTML.replace(number.outerHTML, '').trim();

		li.innerHTML = content + ` <a href="#${fn.dataset.refid}" class="footnote-backref" aria-label="Back to content">↩</a>`;
		list.appendChild(li);

		// Remove the hidden span from the main content
		fn.remove();
	});

	const postBody = document.querySelector('.post-body');
	if (postBody) {
		postBody.appendChild(section);
	}
})();
