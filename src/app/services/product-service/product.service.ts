import { inject, Injectable } from '@angular/core';
import {
  CategoryPagedQueryResponse,
  ClientResponse,
  ProductProjection,
} from '@commercetools/platform-sdk';
import { AuthService } from '@services/auth-service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  public categories: Record<string, string> = {};
  public subcategories: Record<string, { id: string; parentId: string }> = {};

  private authService: AuthService = inject(AuthService);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  public async getCategories(): Promise<ClientResponse<CategoryPagedQueryResponse> | string> {
    try {
      return this.authService.apiRoot.categories().get().execute();
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return String(error);
    }
  }

  public async getCategoriesData(): Promise<void | string> {
    try {
      const data = await this.getCategories();
      if (data instanceof Object) {
        const { results } = data!.body;
        if (!results) {
          return;
        }

        results.forEach((result) => {
          if (!result.ancestors.length) {
            const categoryKey = result.key;
            const categoryId = result.id;
            this.categories[categoryKey!] = categoryId;
          } else {
            const categoryKey = result.key;
            const categoryId = result.id;
            this.subcategories[categoryKey!] = {
              id: categoryId,
              parentId: result.parent?.id as string,
            };
          }
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return String(error);
    }
  }

  public async getAllProductsByCategory(categoryId: string): Promise<ProductProjection[] | string> {
    let products: ProductProjection[] = [];

    try {
      const data = await this.authService.apiRoot
        .productProjections()
        .get({
          queryArgs: {
            where: `categories(id="${categoryId}")`,
          },
        })
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
