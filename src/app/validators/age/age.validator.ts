import { AbstractControl, ValidationErrors } from '@angular/forms';

export function minAgeValidator(minAge: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const birth = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();
    const isBirthdayPassed = month > 0 || (month === 0 && today.getDate() >= birth.getDate());

    return age > minAge || (isBirthdayPassed && age === minAge)
      ? null
      : { tooYoung: { age: minAge } };
  };
}
