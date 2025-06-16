import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const postalCodeValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  if (!control || !control.parent) return null;

  const country = control.parent.get('country')?.value;
  const postalCode = control.value;

  if (!country || !postalCode) return null;

  const usRegex = /^\d{5}(-\d{4})?$/;
  const byRegex = /^\d{6}$/;

  switch (country) {
    case 'US':
      return usRegex.test(postalCode) ? null : { invalidPostalCodeUS: true };
    case 'BY':
      return byRegex.test(postalCode) ? null : { invalidPostalCodeBY: true };
    default:
      return null;
  }
};
