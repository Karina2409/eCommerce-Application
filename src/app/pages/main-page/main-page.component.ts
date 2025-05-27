import { Component } from '@angular/core';
import { LowerCasePipe, NgForOf, NgStyle } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryDraft } from '@commercetools/platform-sdk';

@Component({
  selector: 'app-main-page',
  imports: [NgForOf, RouterLink, NgStyle, LowerCasePipe],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
})
export class MainPageComponent {
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
}
