import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '@services/auth-service';

@Component({
  selector: 'app-header',
  imports: [MatButtonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public isAuthorized = signal(false);
  private authService: AuthService = inject(AuthService);

  constructor() {
    this.isAuthorized.set(this.authService.isAuthorized() === 'true');
  }

  public async logout(): Promise<void> {
    await this.authService.logout();
    this.isAuthorized.set(false);
  }
}
