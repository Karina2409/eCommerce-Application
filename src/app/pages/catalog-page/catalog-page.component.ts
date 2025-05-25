import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForOf, NgOptimizedImage, TitleCasePipe } from '@angular/common';

type Product = {
  name: string;
  price: number;
  category: string;
  image: string;
};

@Component({
  selector: 'app-catalog-page',
  imports: [NgForOf, TitleCasePipe, NgOptimizedImage],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.scss',
})
export class CatalogPageComponent implements OnInit {
  public category: string | null = null;

  public products: Product[] = [
    {
      name: 'Nothing',
      price: 25,
      category: 'smartphones',
      image: '',
    },
    {
      name: 'Lenovo Thinkpad',
      price: 300,
      category: 'notebooks',
      image: '',
    },
    {
      name: 'IPad',
      price: 20,
      category: 'tablets',
      image: '',
    },
  ];

  constructor(private route: ActivatedRoute) {}
  public get filteredProducts() {
    return this.products.filter((product) => product.category === this.category);
  }

  public ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.category = params.get('categoryName');
    });
  }
}
