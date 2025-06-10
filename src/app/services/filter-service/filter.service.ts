import { inject, Injectable } from '@angular/core';
import { ProductProjection } from '@commercetools/platform-sdk';
import { ProductProjectionExtend, ProductQueryArgs } from '@models/index';
import { AuthService } from '@services/auth-service';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private authService: AuthService = inject(AuthService);

  public async getProductsByQuery(
    queryBrand: string,
    queryColor: string,
    categoryId: string,
    priceFrom: number | null,
    priceTo: number | null,
    sort = 'name.en-US asc',
    querySearch?: string,
  ): Promise<ProductProjectionExtend[] | string> {
    let products: ProductProjection[] = [];
    let productsRender: ProductProjectionExtend[] = [];
    const queryArgs: ProductQueryArgs = {
      limit: 50,
      staged: true,
      markMatchingVariants: true,
      fuzzy: true,
      sort: `${sort}`,
    };
    if (priceFrom) {
      priceFrom *= 100;
    }
    if (priceTo) {
      priceTo *= 100;
    }
    const brand = String(queryBrand).charAt(0).toUpperCase() + String(queryBrand).slice(1);
    const color = String(queryColor).charAt(0).toUpperCase() + String(queryColor).slice(1);
    const brandFilter = `variants.attributes.brand.label.en-US:"${brand}"`;
    const colorFilter = `variants.attributes.color.label.en-US:"${color}"`;
    const rangePriceFilter = `variants.price.centAmount:range (${priceFrom} to ${priceTo})`;
    const categoryIdFilter = `categories.id:"${categoryId}"`;
    if (categoryId && queryBrand && queryColor) {
      queryArgs.filter = [categoryIdFilter, brandFilter, colorFilter, rangePriceFilter];
    } else if (categoryId && queryBrand && queryColor === '') {
      queryArgs.filter = [categoryIdFilter, brandFilter, rangePriceFilter];
    } else if (categoryId && queryBrand === '' && queryColor) {
      queryArgs.filter = [categoryIdFilter, colorFilter, rangePriceFilter];
    } else if (categoryId && queryBrand === '' && queryColor === '') {
      queryArgs.filter = [categoryIdFilter, rangePriceFilter];
    } else if (queryBrand && queryColor) {
      queryArgs.filter = [brandFilter, colorFilter, rangePriceFilter];
    } else if (queryBrand && queryColor === '') {
      queryArgs.filter = [brandFilter, rangePriceFilter];
    } else if (queryBrand === '' && queryColor) {
      queryArgs.filter = [colorFilter, rangePriceFilter];
    } else {
      queryArgs.filter = [rangePriceFilter];
    }
    if (querySearch) {
      queryArgs['text.en-US'] = querySearch;
    }

    try {
      const data = await this.authService.apiRoot
        .productProjections()
        .search()
        .get({ queryArgs })
        .execute();

      products = data.body.results;

      productsRender = structuredClone(products);
      if (queryColor) {
        productsRender.map((product) => (product.variantsRender = []));
      }

      productsRender = productsRender.map((product) => {
        if (
          product.masterVariant.attributes?.find(
            (attr) => attr?.value[0]?.label?.['en-US'] === color,
          )
        ) {
          product.variantsRender?.push(product.masterVariant);
        }

        product.variants.map((variant) => {
          if (variant.attributes?.find((attr) => attr?.value[0]?.label?.['en-US'] === color))
            product.variantsRender?.push(variant);
        });

        return product;
      });

      return productsRender;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return String(error);
    }
  }
}
