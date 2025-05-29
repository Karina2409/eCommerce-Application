import { Routes } from '@angular/router';
import { CartPageComponent } from '@pages/cart-page';
import { CatalogPageComponent } from '@pages/catalog-page';
import { LoginPageComponent } from '@pages/login-page';
import { MainPageComponent } from '@pages/main-page';
import { NotFoundPageComponent } from '@pages/not-found-page';
import { RegistrationPageComponent } from '@pages/registration-page';
import { canActivateAuth } from '@services/auth-service';
import { CategoryPageComponent } from '@pages/category-page';

export const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'login', component: LoginPageComponent, canActivate: [canActivateAuth] },
  { path: 'registration', component: RegistrationPageComponent, canActivate: [canActivateAuth] },
  { path: 'main', component: MainPageComponent },
  { path: 'catalog', component: CatalogPageComponent },
  { path: 'category', component: CategoryPageComponent },
  { path: 'cart', component: CartPageComponent },
  { path: 'category/:categoryName', component: CategoryPageComponent },
  { path: 'category/:categoryName/:subcategoryName', component: CatalogPageComponent },
  { path: '**', component: NotFoundPageComponent },
];
