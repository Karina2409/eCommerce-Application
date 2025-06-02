import { inject, Injectable } from '@angular/core';
import { ProductProjection } from '@commercetools/platform-sdk';
import { ProductQueryArgs } from '@models/index';
import { AuthService } from '@services/auth-service';

@Injectable({
  providedIn: 'root',
})
export class SortService {
  private authService: AuthService = inject(AuthService);

  public async getProductsByQuery(
    categoryId?: string,
    sort = '',
    query?: string,
  ): Promise<ProductProjection[] | string> {
    let products: ProductProjection[] = [];
    const queryArgs: ProductQueryArgs = {
      limit: 50,
      staged: true,
    };

    const brand = String(query).charAt(0).toUpperCase() + String(query).slice(1);
    if (categoryId && query) {
      queryArgs.filter = [
        `categories.id:"${categoryId}"`,
        `variants.attributes.brand.label.en-US:"${brand}"`,
      ];
      queryArgs.sort = `${sort}`;
    } else if (query === '' && categoryId) {
      queryArgs.filter = [`categories.id:"${categoryId}"`];
      queryArgs.sort = `${sort}`;
    } else if (query) {
      queryArgs.filter = [`variants.attributes.brand.label.en-US:"${brand}"`];
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
      products = data.body.results;

      return products;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return String(error);
    }
  }
}
