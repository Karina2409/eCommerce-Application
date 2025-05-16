/* eslint-disable @typescript-eslint/member-ordering */
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '@services/auth-service';

@Component({
  selector: 'app-login-page',
  imports: [MatButtonModule, RouterLink, ReactiveFormsModule, NgIf],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  constructor(private authService: AuthService) {}
  public router = inject(Router);
  public errorMessage = '';
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
  });

  public onSubmitAction(): void {
    if (this.form.valid) {
      this.authService
        .signIn(this.form.value.email, this.form.value.password)
        .then((loginResponse) => {
          if (loginResponse instanceof Object && loginResponse.result === true) {
            this.router.navigate(['main']);
          } else if (typeof loginResponse === 'string') {
            this.errorMessage = loginResponse;
          }
        });
    }
  }

  public togglePassword(): void {
    this.isPasswordShown = !this.isPasswordShown;
  }
}
