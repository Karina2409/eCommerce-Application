import { Routes } from '@angular/router';
import { LoginPageComponent } from '@pages/login-page';
import { MainPageComponent } from '@pages/main-page';
import { NotFoundPageComponent } from '@pages/not-found-page';
import { RegistrationPageComponent } from '@pages/registration-page';
import { canActivateAuth } from '@services/auth-service';

export const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'login', component: LoginPageComponent, canActivate: [canActivateAuth] },
  { path: 'registration', component: RegistrationPageComponent },
  { path: 'main', component: MainPageComponent },
  { path: '**', component: NotFoundPageComponent },
];
