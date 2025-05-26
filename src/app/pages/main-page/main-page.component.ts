import { Component, inject, signal, OnInit } from '@angular/core';
import { HeaderComponent } from '@components/header';
import { AuthService } from '@services/auth-service';
import { LowerCasePipe, NgForOf, NgStyle } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryDraft } from '@commercetools/platform-sdk';

@Component({
  selector: 'app-main-page',
  imports: [HeaderComponent, NgForOf, RouterLink, NgStyle, LowerCasePipe],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
})
export class MainPageComponent implements OnInit {
  public isAuthorized = signal(false);

  public categories: CategoryDraft[] = [
    {
      name: {
        en: 'Laptops',
      },
      slug: {
        en: '',
      },
    },
    {
      name: {
        en: 'Smartphones',
      },
      slug: {
        en: '',
      },
    },
    {
      name: {
        en: 'Tablets',
      },
      slug: {
        en: '',
      },
    },
  ];

  private authService = inject(AuthService);

  public ngOnInit() {
    this.isAuthorized.set(this.authService.isAuthorized());
  }
}
