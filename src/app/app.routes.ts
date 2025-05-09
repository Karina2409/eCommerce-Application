import { Routes } from '@angular/router';
import { LoginPageComponent } from '@pages/login-page/login-page.component';
import { MainPageComponent } from '@pages/main-page/main-page.component';
import { RegistrationPageComponent } from '@pages/registration-page/registration-page.component';
import { NotFoundPageComponent } from '@pages/not-found-page/not-found-page.component';

export const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'registration', component: RegistrationPageComponent },
  { path: 'main', component: MainPageComponent },
  { path: '**', component: NotFoundPageComponent },
];
