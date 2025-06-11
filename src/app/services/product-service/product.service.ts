import { inject, Injectable } from '@angular/core';
import {
  Category,
  CategoryPagedQueryResponse,
  ClientResponse,
  ProductProjection,
  ProductProjectionPagedQueryResponse,
} from '@commercetools/platform-sdk';
import { AuthService } from '@services/auth-service';
import { ProductProjectionQueryArgs } from '@models/types';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  public categories: Record<string, string> = {};
  public subcategories: Record<string, { id: string; parentId: string }> = {};

  private authService: AuthService = inject(AuthService);

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
            this.categories[result.key!] = result.id;
          } else {
            this.subcategories[result.key!] = {
              id: result.id,
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

  public async getAllProductsByCategory(
    categoryId?: string,
  ): Promise<ProductProjection[] | string> {
    let products: ProductProjection[] = [];
    const queryArgs: ProductProjectionQueryArgs = {
      limit: 8,
      staged: true,
      priceCurrency: 'USD',
    };
    if (categoryId) {
      queryArgs.where = `categories(id="${categoryId}")`;
    }

    try {
      const data: ClientResponse<ProductProjectionPagedQueryResponse> =
        await this.authService.apiRoot.productProjections().get({ queryArgs }).execute();
      products = data.body.results;
      return products;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return String(error);
    }
  }

  public async getProductByName(name: string) {
    return this.authService.apiRoot.productProjections().withKey({ key: name }).get().execute();
  }

  public async getProductBySlug(slug: string, locale = 'en-US') {
    return this.authService.apiRoot
      .productProjections()
      .get({
        queryArgs: {
          where: `slug(${locale}="${slug}")`,
          limit: 1,
        },
      })
      .execute();
  }

  public getCategoryBySlug(
    slug: string,
    locale = 'en-US',
  ): Promise<{
    categoryName: string;
    subcategoryName: string;
  }> {
    return this.authService.apiRoot
      .productProjections()
      .get({
        queryArgs: {
          where: `slug(${locale}="${slug}")`,
          expand: ['categories[*]'],
          limit: 1,
        },
      })
      .execute()
      .then((response) => {
        const product = response.body.results[0];

        const categories = product.categories
          .map((reference) => reference.obj)
          .filter((category): category is Category => !!category);

        const category = categories.find((category) => !category.parent);
        const subcategory = categories.find((category) => !!category.parent);

        const categoryName = category?.name?.[locale] ?? '';
        const subcategoryName = subcategory?.name?.[locale] ?? '';

        return {
          categoryName,
          subcategoryName,
        };
      });
  }
}
