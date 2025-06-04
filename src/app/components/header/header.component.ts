import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '@services/auth-service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [MatButtonModule, RouterLink, NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public authService: AuthService = inject(AuthService);
  public isAuthorized = computed(() => this.authService.isAuthorized());

  public screenWidth = signal(window.innerWidth);
  public isMobileDevice = computed(() => this.screenWidth() < 800);
  public isMenuOpen = signal(false);

  constructor() {
    window.addEventListener('resize', () => {
      this.screenWidth.set(window.innerWidth);
    });

    effect(() => {
      if (!this.isMobileDevice()) {
        this.isMenuOpen.set(false);
      }
    });
  }

  public toggleMenu() {
    this.isMenuOpen.update((open) => {
      const next = !open;
      this.setBodyScroll(!next);
      return next;
    });
  }

  public setBodyScroll(enable: boolean) {
    void this;
    if (enable) {
      document.body.classList.remove('no-scroll');
    } else {
      document.body.classList.add('no-scroll');
    }
  }

  public closeMenu() {
    this.isMenuOpen.set(false);
    this.setBodyScroll(true);
  }

  public async logout(): Promise<void> {
    await this.authService.logout();
  }
}
