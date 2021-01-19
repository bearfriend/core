const puppeteer = require('puppeteer');
const VisualDiff = require('@brightspace-ui/visual-diff');

describe('d2l-input-textarea', () => {

	const visualDiff = new VisualDiff('input-textarea', __dirname);

	let browser, page;

	before(async() => {
		browser = await puppeteer.launch();
		page = await visualDiff.createPage(browser, { viewport: { width: 800, height: 2000 } });
		await page.goto(`${visualDiff.getBaseUrl()}/components/inputs/test/input-textarea.visual-diff.html`, { waitUntil: ['networkidle0', 'load'] });
		await page.bringToFront();
	});

	after(async() => await browser.close());

	[
		{ name: 'basic', selector: '#basic' },
		{ name: 'basic-focus', selector: '#basic', action: selector => page.$eval(selector, elem => elem.focus()) },
		{ name: 'disabled', selector: '#disabled' },
		{ name: 'label-hidden', selector: '#label-hidden' },
		{ name: 'wrapping', selector: '#wrapping' },
		{ name: 'placeholder', selector: '#placeholder' },
		{ name: 'placeholder-focus', selector: '#placeholder', action: selector => page.$eval(selector, elem => elem.focus()) },
		{ name: 'placeholder-disabled', selector: '#placeholder-disabled' },
		{ name: 'min-height', selector: '#min-height' },
		{ name: 'max-height', selector: '#max-height', action: selector => page.$eval(selector, elem => elem.value = 'line 1\nline 2\nline 3\nline 4\nline 5') },
		{ name: 'required', selector: '#required' },
		{ name: 'invalid', selector: '#invalid' },
		{ name: 'invalid-focus', selector: '#invalid', action: selector => page.$eval(selector, elem => elem.focus()) },
		{ name: 'invalid-disabled', selector: '#invalid-disabled' },
		{ name: 'invalid-rtl', selector: '#invalid-rtl' },
		{ name: 'invalid-multiline', selector: '#invalid-multiline' },
		{ name: 'skeleton', selector: '#skeleton' }
	].forEach(info => {

		it(info.name, async function() {
			if (info.action) await info.action(info.selector);
			const rect = await visualDiff.getRect(page, info.selector);
			await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
		});

	});

	describe('sass', () => {

		[
			{ name: 'basic', selector: '#sass-basic' },
			{ name: 'basic-focus', selector: '#sass-basic', action: selector => page.$eval(selector, elem => elem.focus()) },
			{ name: 'disabled', selector: '#sass-disabled' },
			{ name: 'placeholder', selector: '#sass-placeholder' },
			{ name: 'placeholder-focus', selector: '#sass-placeholder', action: selector => page.$eval(selector, elem => elem.focus()) },
			{ name: 'placeholder-disabled', selector: '#sass-placeholder-disabled' },
			{ name: 'invalid', selector: '#sass-invalid' },
			{ name: 'invalid-focus', selector: '#sass-invalid', action: selector => page.$eval(selector, elem => elem.focus()) },
			{ name: 'invalid-disabled', selector: '#sass-invalid-disabled' },
			{ name: 'invalid-rtl', selector: '#sass-invalid-rtl' }
		].forEach(info => {

			it(info.name, async function() {
				if (info.action) await info.action(info.selector);
				const rect = await visualDiff.getRect(page, info.selector);
				await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
			});

		});

	});

});
