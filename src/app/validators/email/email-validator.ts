import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const emailValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  const errors: ValidationErrors = {};

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const noWhitespacePattern = /^\S+$/;

  if (!emailPattern.test(value)) {
    errors['invalidEmailPattern'] = true;
  }

  if (!noWhitespacePattern.test(value)) {
    errors['containsWhitespace'] = true;
  }

  return Object.keys(errors).length ? errors : null;
};
