import { getSvgPath } from 'figma-squircle';

// Applies an iOS-style "continuous corner" (Figma's exact smoothing algorithm)
// to any [data-squircle-radius] element, via clip-path: path(...). Runs on
// load and on resize/content changes so it works with fluid/responsive boxes.
// If this script fails for any reason, elements keep their plain CSS
// border-radius fallback instead of disappearing.

function apply(el) {
	// A CSS custom property (--squircle-r) lets components override the
	// radius responsively via media queries; the data attribute is the
	// static default when no override is set.
	const cssVar = getComputedStyle(el).getPropertyValue('--squircle-r').trim();
	const r = parseFloat(cssVar) || parseFloat(el.dataset.squircleRadius);
	if (!r || !el.clientWidth || !el.clientHeight) return;
	const d = getSvgPath({
		width: el.clientWidth,
		height: el.clientHeight,
		cornerRadius: r,
		cornerSmoothing: 1,
	});
	el.style.clipPath = `path('${d}')`;
}

function applyAll() {
	document.querySelectorAll('[data-squircle-radius]').forEach(apply);
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', applyAll);
} else {
	applyAll();
}

if ('ResizeObserver' in window) {
	const ro = new ResizeObserver((entries) => {
		entries.forEach((entry) => apply(entry.target));
	});
	const observe = () => {
		document.querySelectorAll('[data-squircle-radius]').forEach((el) => ro.observe(el));
	};
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', observe);
	} else {
		observe();
	}
}
