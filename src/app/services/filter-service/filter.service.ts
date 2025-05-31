import { inject, Injectable } from '@angular/core';
import { ProductProjection } from '@commercetools/platform-sdk';
import { ProductQueryArgs } from '@models/index';
import { AuthService } from '@services/auth-service';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private authService: AuthService = inject(AuthService);

  public async getProductsByQuery(
    query?: string,
    categoryId?: string,
  ): Promise<ProductProjection[] | string> {
    let products: ProductProjection[] = [];
    const queryArgs: ProductQueryArgs = {
      limit: 50,
      staged: true,
    };
    if (categoryId && query) {
      queryArgs.where = `categories(id = "${categoryId}") and masterVariant(attributes(value(key="${query}")))`;
    } else if (query === '' && categoryId) {
      queryArgs.where = `categories(id="${categoryId}")`;
    } else if (query) {
      queryArgs.where = `masterVariant(attributes(value(key="${query}")))`;
    }

    try {
      const data = await this.authService.apiRoot.productProjections().get({ queryArgs }).execute();
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
