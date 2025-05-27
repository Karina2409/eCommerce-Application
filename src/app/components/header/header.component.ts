import { Component, computed, inject } from '@angular/core';
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
  public authService: AuthService = inject(AuthService);
  public isAuthorized = computed(() => this.authService.isAuthorized());

  public async logout(): Promise<void> {
    await this.authService.logout();
  }
}
