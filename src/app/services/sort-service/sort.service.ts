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
    sort = 'name.en-US asc',
    query?: string,
  ): Promise<ProductProjection[] | string> {
    let products: ProductProjection[] = [];
    const queryArgs: ProductQueryArgs = {
      limit: 50,
      staged: true,
    };

    if (categoryId && query) {
      queryArgs.filter = [`categories.id:"${categoryId}"`];
      queryArgs.where = `categories(id = "${categoryId}") and masterVariant(attributes(value(key="${query}")))`;
      queryArgs.sort = `${sort}`;
    } else if (query === '' && categoryId) {
      queryArgs.filter = [`categories.id:"${categoryId}"`];
      queryArgs.where = `categories(id = "${categoryId}")`;
      queryArgs.sort = `${sort}`;
    } else if (query) {
      queryArgs.where = `masterVariant(attributes(value(key="${query}")))`;
      queryArgs.sort = `${sort}`;
    } else if (query === '') {
      queryArgs.sort = `${sort}`;
    }

    try {
      if (sort === 'name.en-US asc' || sort === 'name.en-US desc') {
        const data = await this.authService.apiRoot
          .productProjections()
          .get({ queryArgs })
          .execute();
        products = data.body.results;
      } else {
        const data = await this.authService.apiRoot
          .productProjections()
          .search()
          .get({ queryArgs })
          .execute();
        products = data.body.results;
      }
      return products;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return String(error);
    }
  }
}
