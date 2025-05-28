import { Component, Optional, SkipSelf } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { NgForOf } from '@angular/common';
import { CatalogPageComponent } from '@pages/catalog-page';

@Component({
  selector: 'app-product-card',
  imports: [MatButton, NgForOf],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  constructor(@Optional() @SkipSelf() public parent?: CatalogPageComponent) {}
}
