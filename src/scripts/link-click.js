// Keeps a clicked link green (see the a.clicked rule in Layout.astro) for the
// rest of this page view, instead of reverting once the mouse button is
// released. Resets for free on the next page load — nothing to clean up.
document.addEventListener('click', (event) => {
	const link = event.target.closest('a');
	if (!link) return;

	// Links that keep this page open (new tab, or mailto: which hands off to
	// another app) would otherwise stay green indefinitely instead of just
	// flashing for the moment before navigation actually happens.
	const href = link.getAttribute('href') || '';
	const staysOnPage = link.target === '_blank' || href.startsWith('mailto:') || href === '#';
	if (staysOnPage) return;

	link.classList.add('clicked');
});

// Back/forward navigation can restore the page from the browser's bfcache —
// the exact DOM snapshot from right before you left, .clicked class and all —
// without re-running page load. Treat that restore as a fresh visit too.
window.addEventListener('pageshow', (event) => {
	if (event.persisted) {
		document.querySelectorAll('a.clicked').forEach((link) => link.classList.remove('clicked'));
	}
});
