import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { KeyValuePipe, LowerCasePipe, NgStyle, TitleCasePipe } from '@angular/common';
import { ProductService } from '@services/product-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  constructor(
    private route: ActivatedRoute,
    private destroyRef: DestroyRef,
  ) {}
  public ngOnInit(): void | Promise<string> {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.category = params.get('categoryName');
    });
    this.productService
      .getCategoriesData()
      .then(() => {
        this.categories = this.productService.categories;

        for (const category of Object.entries(this.categories)) {
          const [key, value] = category;
          if (key === this.category) {
            this.parentId = value;
          }
        }
        this.subcategories = this.productService.subcategories;
      })
      .catch((error) => {
        if (error instanceof Error) {
          return error.message;
        }
        return String(error);
      });
  }
}
