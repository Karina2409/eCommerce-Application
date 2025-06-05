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
    query?: string,
    categoryId?: string,
    sort = 'name.en-US asc',
    attribute?: string,
  ): Promise<ProductProjectionExtend[] | string> {
    let products: ProductProjection[] = [];
    let productsRender: ProductProjectionExtend[] = [];
    const queryArgs: ProductQueryArgs = {
      limit: 50,
      staged: true,
    };
    const queryChanged = String(query).charAt(0).toUpperCase() + String(query).slice(1);
    if (categoryId && query) {
      queryArgs.filter = [
        `categories.id:"${categoryId}"`,
        `variants.attributes.${attribute}.label.en-US:"${queryChanged}"`,
      ];

      queryArgs.sort = `${sort}`;
    } else if (categoryId && query === '') {
      queryArgs.filter = [`categories.id:"${categoryId}"`];

      queryArgs.sort = `${sort}`;
    } else if (query) {
      queryArgs.filter = [`variants.attributes.${attribute}.label.en-US:"${queryChanged}"`];

      queryArgs.sort = `${sort}`;
    } else if (query === '') {
      queryArgs.sort = `${sort}`;
    }

    try {
      const data = await this.authService.apiRoot
        .productProjections()
        .search()
        .get({ queryArgs })
        .execute();

      products = data.body.results.filter((product) =>
        product.masterVariant.attributes?.map(
          (attr) => attr?.value[0]?.label?.['en-US'] === queryChanged,
        ),
      );

      productsRender = structuredClone(products);
      if (query) {
        productsRender.map((product) => (product.variantsRender = []));
      }

      productsRender = productsRender.map((product) => {
        if (
          product.masterVariant.attributes?.find(
            (attr) => attr?.value[0]?.label?.['en-US'] === queryChanged,
          )
        ) {
          product.variantsRender?.push(product.masterVariant);
        }

        product.variants.map((variant) => {
          if (variant.attributes?.find((attr) => attr?.value[0]?.label?.['en-US'] === queryChanged))
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
