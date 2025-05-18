import { Component, inject, signal } from '@angular/core';
import { HeaderComponent } from '@components/header';
import { MatButton } from '@angular/material/button';
import { AuthService } from '@services/auth-service';

@Component({
  selector: 'app-main-page',
  imports: [HeaderComponent, MatButton],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
})
export class MainPageComponent {
  public isAuthorized = signal(false);
  private authService: AuthService = inject(AuthService);

  constructor() {
    this.isAuthorized.set(this.authService.isAuthorized() === 'true');
  }
}
