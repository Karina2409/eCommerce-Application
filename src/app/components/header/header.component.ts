import { Component, computed, effect, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@services/auth-service';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { MatListItem, MatNavList } from '@angular/material/list';
import { Observable } from 'rxjs';
import { CartService } from '@services/cart-service';
import { MatBadge } from '@angular/material/badge';

@Component({
  selector: 'app-header',
  imports: [
    MatButtonModule,
    RouterLink,
    NgIf,
    MatIconModule,
    MatTooltip,
    MatNavList,
    MatListItem,
    MatBadge,
    AsyncPipe,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnDestroy, OnInit {
  public authService: AuthService = inject(AuthService);
  public count$!: Observable<number>;
  public isAuthorized = computed(() => this.authService.isAuthorized());

  public screenWidth = signal(window.innerWidth);
  public isMobileDevice = computed(() => this.screenWidth() < 800);
  public isMenuOpen = signal(false);

  constructor(private cartService: CartService) {
    window.addEventListener('resize', () => {
      this.screenWidth.set(window.innerWidth);
    });

    effect(() => {
      if (!this.isMobileDevice()) {
        this.isMenuOpen.set(false);
      }
    });
  }

  public ngOnDestroy() {
    window.removeEventListener('resize', this.screenWidth);
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

  public ngOnInit() {
    this.count$ = this.cartService.count$;
  }
}
