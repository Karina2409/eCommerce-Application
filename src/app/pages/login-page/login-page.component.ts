import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '@services/auth-service';
import { emailValidator } from '@validators/email';
import { passwordValidator } from '@validators/password';
import { LoginFormControlType } from '@models/types';
import { EmailFieldComponent, PasswordFieldComponent } from '@components/input';

@Component({
  selector: 'app-login-page',
  imports: [
    MatButtonModule,
    RouterLink,
    ReactiveFormsModule,
    NgIf,
    EmailFieldComponent,
    PasswordFieldComponent,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  public authService = inject(AuthService);
  public router = inject(Router);
  public readonly errorMessage = signal('');
  public readonly isPasswordShown = signal(false);
  public form: FormGroup = new FormGroup<LoginFormControlType>({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, emailValidator],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8), passwordValidator],
    }),
  });

  public get email(): FormControl {
    return this.form.get('email') as FormControl;
  }

  public get password(): FormControl {
    return this.form.get('password') as FormControl;
  }

  public onSubmitAction(): void {
    if (this.form.valid) {
      this.authService
        .signIn(this.form.value.email, this.form.value.password)
        .then((loginResponse) => {
          if (loginResponse instanceof Object && loginResponse.result === true) {
            this.router.navigate(['main']);
          } else if (typeof loginResponse === 'string') {
            this.errorMessage.set(loginResponse);
          }
        });
    }
  }
}
