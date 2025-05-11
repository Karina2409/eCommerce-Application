import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login-page',
  imports: [MatButtonModule, RouterLink, ReactiveFormsModule, NgIf],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  public showPassword = false;

  public form: FormGroup = new FormGroup({
    username: new FormControl('', [
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
      // console.log(this.form.value);
    }
  }

  public togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
