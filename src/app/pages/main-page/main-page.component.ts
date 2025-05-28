import { Component, inject, OnInit } from '@angular/core';
import { KeyValuePipe, LowerCasePipe, NgForOf, NgStyle, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '@services/product-service';

@Component({
  selector: 'app-main-page',
  imports: [NgForOf, RouterLink, NgStyle, LowerCasePipe, KeyValuePipe, TitleCasePipe],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
})
export class MainPageComponent implements OnInit {
  public productService: ProductService = inject(ProductService);
  public categories: Record<string, string> = {};

  public ngOnInit(): void {
    this.productService.getCategoriesData().then(() => {
      this.categories = this.productService.categories;
      console.log(this.categories);
    });
  }
}
