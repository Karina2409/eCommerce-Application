import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { KeyValuePipe, LowerCasePipe, NgStyle, TitleCasePipe } from '@angular/common';
import { ProductService } from '@services/product-service';

@Component({
  selector: 'app-category-page',
  imports: [KeyValuePipe, LowerCasePipe, TitleCasePipe, RouterLink, NgStyle],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.scss',
})
export class CategoryPageComponent implements OnInit {
  public productService: ProductService = inject(ProductService);
  public category: string | null = '';
  public subcategory: string | null = '';
  public categories: Record<string, string> = {};
  public subcategories: Record<
    string,
    {
      id: string;
      parentId: string;
    }
  > = {};
  public parentId = '';

  constructor(private route: ActivatedRoute) {}
  public ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.category = params.get('categoryName');
    });
    this.productService.getCategoriesData().then(() => {
      this.categories = this.productService.categories;
      for (const key in this.categories) {
        if (key === this.category) {
          this.parentId = this.categories[key];
        }
      }
      this.subcategories = this.productService.subcategories;
    });
  }
}
