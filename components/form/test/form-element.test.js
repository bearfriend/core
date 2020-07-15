import '../../validation/validation-custom.js';
import './form-element.js';
import { defineCE, expect, fixture } from '@open-wc/testing';
import { html, LitElement } from 'lit-element/lit-element.js';

const formTag = defineCE(
	class extends LitElement {

		static get properties() {
			return {
				isValidationCustomValid: { type: Boolean },
				value: { type: String, reflect: true },
			};
		}

		constructor() {
			super();
			this.isValidationCustomValid = true;
		}

		render() {
			return html`
				<d2l-validation-custom for="my-ele" @d2l-validation-custom-validate=${this._validate} failure-text="External custom validation failed">
				</d2l-validation-custom>
				<d2l-test-form-element id="my-ele"></d2l-test-form-element>
			`;
		}

		async _validate(e) {
			e.detail.resolve(this.isValidationCustomValid);
		}

	}
);

const formFixture = `<${formTag}></${formTag}`;

describe('form-element', () => {

	let form, formElement;

	beforeEach(async() => {
		form = await fixture(formFixture);
		formElement = form.shadowRoot.querySelector('#my-ele');
	});

	describe('invalid', () => {

		[
			{ forceInvalid: true, validationError: 'Oh no' },
			{ forceInvalid: false, validationError: 'Oh no' },
			{ forceInvalid: true, validationError: null },
			{ forceInvalid: false, validationError: null },
		].forEach(({ forceInvalid, validationError }) => {

			it('should be invalid if force validate is true or there is a validation error ', async() => {
				formElement.forceInvalid = forceInvalid;
				formElement.validationError = validationError;
				await formElement.updateComplete;
				expect(formElement.hasAttribute('invalid')).to.equal(forceInvalid || validationError !== null);
			});

		});

	});

	describe('message', () => {

		it('should set validation message if validate has errors', async() => {
			await formElement.validate(true);
			expect(formElement.validationError).to.equal('Test form element is required.');
		});

		it('should not set validation message if validate has errors and show errors is false', async() => {
			await formElement.validate(false);
			expect(formElement.validationError).to.be.null;
		});

		[true, false].forEach(showErrors => {
			it('should remove message if validate has no errors', async() => {
				await formElement.validate(true);
				expect(formElement.validationError).to.equal('Test form element is required.');
				formElement.value = 'Non-empty';
				await formElement.validate(showErrors);
				expect(formElement.validationError).to.null;
			});
		});

		it('should update the validation message if validate has errors and show errors is false', async() => {
			await formElement.validate(true);
			expect(formElement.validationError).to.equal('Test form element is required.');
			formElement.value = 'Non-empty';
			formElement.isValidationCustomValid = false;
			await formElement.validate(false);
			expect(formElement.validationError).to.equal('Internal custom validation failed');
		});

	});

	describe('validate', () => {

		it('should validate internal validation-customs', async() => {
			formElement.isValidationCustomValid = false;
			const errors = await formElement.validate(true);
			expect(errors).to.include.members(['Internal custom validation failed']);
		});

		it('should validate external validation-customs', async() => {
			form.isValidationCustomValid = false;
			const errors = await formElement.validate(true);
			expect(errors).to.include.members(['External custom validation failed']);
		});

		it('should validate native element validity state', async() => {
			const errors = await formElement.validate(true);
			expect(errors).to.include.members(['Test form element is required.']);
		});

		it('should validate with default validity state message', async() => {
			formElement.value = 'Non-empty';
			formElement.setValidity({ badInput: true });
			const errors = await formElement.validate(true);
			expect(errors).to.include.members(['Test form element is invalid.']);
		});

		it('should validate with overridden validity state message', async() => {
			formElement.value = 'Non-empty';
			formElement.setValidity({ rangeOverflow: true });
			const errors = await formElement.validate(true);
			expect(errors).to.include.members(['Test form element failed with an overridden validation message']);
		});

		it('should validate with custom validity state message', async() => {
			formElement.value = 'Non-empty';
			formElement.setCustomValidity('Validation failed for custom validity');
			const errors = await formElement.validate(true);
			expect(errors).to.include.members(['Validation failed for custom validity']);
		});

		it('should pass validation when no errors', async() => {
			formElement.value = 'Non-empty';
			const errors = await formElement.validate(true);
			expect(errors).to.be.empty;
		});

		it('should not be marked as invalid when show errors is false', async() => {
			const errors = await formElement.validate(false);
			expect(errors).to.not.be.empty;
			expect(formElement.invalid).to.be.false;
			expect(formElement.validationError).to.be.null;
		});

	});

	describe('requestValidate', () => {

		it('should not validate if canceled', async() => {
			formElement.addEventListener('d2l-form-element-should-validate', e => e.preventDefault());
			await formElement.requestValidate(true);
			expect(formElement.validationError).to.be.null;
		});

		it('should show validation errors by default', async() => {
			await formElement.requestValidate();
			expect(formElement.validationError).to.equal('Test form element is required.');
		});

	});

});
