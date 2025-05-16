import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { KeyValuePipe, NgForOf, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { minAgeValidator } from '../../validators/age.validator';
import { Countries } from '@models/enums/countries.enum';

@Component({
  selector: 'app-registration-page',
  imports: [MatButton, NgIf, ReactiveFormsModule, RouterLink, NgForOf, KeyValuePipe],
  templateUrl: './registration-page.component.html',
  styleUrl: './registration-page.component.scss',
})
export class RegistrationPageComponent {
  public isPasswordShown = false;

  public form: FormGroup = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      Validators.pattern(/^\S+$/),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/[A-Z]/),
      Validators.pattern(/[a-z]/),
      Validators.pattern(/\d/),
      Validators.pattern(/^\S+$/),
      Validators.pattern(/[^A-Za-z0-9]/),
    ]),
    firstName: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]),
    lastName: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]),
    dateOfBirth: new FormControl('', [Validators.required, minAgeValidator(13)]),
    address: new FormGroup({
      street: new FormControl('', Validators.required),
      city: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]),
      postalCode: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d{5}(-\d{4})?$|^\d{6}$/),
      ]),
      country: new FormControl('', [Validators.required]),
    }),
  });

  protected readonly Countries = Countries;

  public onSubmitAction(): void {
    if (this.form.valid) {
      // console.log(this.form.value);
    }
  }

  public togglePassword(): void {
    this.isPasswordShown = !this.isPasswordShown;
  }
}
