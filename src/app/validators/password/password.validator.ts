import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  const errors: ValidationErrors = {};

  const bigLetterPattern = /[A-Z]/;
  const lowerLetterPattern = /[a-z]/;
  const digitPattern = /\d/;
  const specialSymbolPattern = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;
  const allowedPasswordPattern = /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/;

  if (!bigLetterPattern.test(value)) {
    errors['noBigLetter'] = true;
  }

  if (!lowerLetterPattern.test(value)) {
    errors['noLowerLetter'] = true;
  }

  if (!digitPattern.test(value)) {
    errors['noDigit'] = true;
  }

  if (!specialSymbolPattern.test(value)) {
    errors['noSpecialSymbol'] = true;
  }

  if (!allowedPasswordPattern.test(value)) {
    errors['invalidPasswordPattern'] = true;
  }

  return Object.keys(errors).length ? errors : null;
};
