import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const latinPattern = /^[A-Za-z]+$/;

export const latinValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  const errors: ValidationErrors = {};

  if (!latinPattern.test(value)) {
    errors['notOnlyLatin'] = true;
  }

  return Object.keys(errors).length ? errors : null;
};
