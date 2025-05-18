/* eslint-disable @typescript-eslint/member-ordering */
import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { KeyValuePipe, NgForOf, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Countries } from '@models/enums';
import { signal } from '@angular/core';
import { minAgeValidator } from '@validators/age';
import { AuthService } from '@services/auth-service';
import { CustomerDraft } from '@commercetools/platform-sdk';

@Component({
  selector: 'app-registration-page',
  imports: [MatButton, NgIf, ReactiveFormsModule, RouterLink, NgForOf, KeyValuePipe],
  templateUrl: './registration-page.component.html',
  styleUrl: './registration-page.component.scss',
})
export class RegistrationPageComponent {
  constructor(private authService: AuthService) {}
  public customer: CustomerDraft = { email: '' };
  public router = inject(Router);
  public errorMessage = signal('');
  public isPasswordShown = signal(false);
  public isDefaultBillingAddress = signal(false);
  public isDefaultShippingAddress = signal(false);
  public isDefaultBothAddress = signal(false);

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
    shippingAddress: new FormGroup({
      country: new FormControl('', [Validators.required]),
      streetName: new FormControl('', Validators.required),
      city: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]),
      postalCode: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d{5}(-\d{4})?$|^\d{6}$/),
      ]),
    }),
    billingAddress: new FormGroup({
      country: new FormControl('', [Validators.required]),
      streetName: new FormControl('', Validators.required),
      city: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]),
      postalCode: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d{5}(-\d{4})?$|^\d{6}$/),
      ]),
    }),
  });

  protected readonly countries = Countries;

  public onSubmitAction(): void {
    if (this.form.valid) {
      this.customer = this.form.value;
      this.authService.signUp(this.customer).then((loginResponse) => {
        if (loginResponse instanceof Object && loginResponse.result === true) {
          this.authService
            .signIn(this.form.value.email, this.form.value.password)
            .then((loginResponse) => {
              if (loginResponse instanceof Object && loginResponse.result === true) {
                this.router.navigate(['main']);
              } else if (typeof loginResponse === 'string') {
                this.errorMessage.set(loginResponse);
              }
            });
        } else if (typeof loginResponse === 'string') {
          this.errorMessage.set(loginResponse);
        }
      });
    }
  }

  public togglePassword(): void {
    this.isPasswordShown.update((value) => !value);
  }

  public toggleBillingAddress(): void {
    this.isDefaultBillingAddress.update((value) => !value);
  }
  public toggleBothAddress(): void {
    this.isDefaultBothAddress.update((value) => !value);
    if (this.isDefaultBothAddress()) {
      this.form.get('billingAddress')?.disable();
    } else {
      this.form.get('billingAddress')?.enable();
    }
  }

  public toggleShippingAddress(): void {
    this.isDefaultShippingAddress.update((value) => !value);
  }
}
