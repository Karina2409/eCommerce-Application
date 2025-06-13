import { inject, Injectable, signal } from '@angular/core';
import {
  createApiBuilderFromCtpClient,
  Customer,
  CustomerSignInResult,
} from '@commercetools/platform-sdk';
import {
  ClientBuilder,
  // Import middlewares
  type PasswordAuthMiddlewareOptions,
  type AuthMiddlewareOptions,
  type HttpMiddlewareOptions,
  Client,
  RefreshAuthMiddlewareOptions,
  ClientResponse,
} from '@commercetools/ts-client';
import type { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';

import { SignUpResult } from '@models/types/sign-up-result';
import { environment } from '@environments/environment.development';
import { tokenCacheAnonym, tokenCacheAuth } from '@services/auth-service/token';
import { Session } from '@models/enums/session';
import { CustomerDraft } from '@models/types';
import { CustomerInfo } from './customerInfo';
import { CartService } from '@services/cart-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isAuthorized = signal<boolean>(!!localStorage.getItem('authorized'));
  public apiRoot: ByProjectKeyRequestBuilder;
  protected PROJECT_KEY = environment.projectKey;
  protected API_URL = environment.apiUrl;
  protected OAUTH_URL = environment.authUrl;
  protected CLIENT_ID = environment.clientId;
  protected CLIENT_SECRET = environment.clientSecret;
  protected SCOPES = environment.scopes;
  private cartService: CartService = inject(CartService);

  constructor() {
    if (!this.isAuthorized()) {
      this.apiRoot = this.createApiRoot(this.getAnonymousClient());
      this.cartService.createAnonymousCart(this.apiRoot);
    } else {
      this.apiRoot = this.createApiRoot(this.getRefreshClient(Session.AUTH));
    }
  }

  public async sessionStateHandler(): Promise<void> {
    if (this.getRefreshTokenFromStorage(Session.AUTH)) {
      this.apiRoot = this.createApiRoot(this.getRefreshClient(Session.AUTH));
    } else if (this.getRefreshTokenFromStorage(Session.ANONYM)) {
      this.apiRoot = this.createApiRoot(this.getRefreshClient(Session.ANONYM));
    } else {
      this.apiRoot = this.createApiRoot(this.getAnonymousClient());
      await this.apiRoot.get().execute();
    }
  }

  public async signUp(customerDraft: CustomerDraft): Promise<SignUpResult | string> {
    if (this.isAuthorized()) {
      await this.logout();
    }
    try {
      const customerResponse = await this.apiRoot
        .customers()
        .post({
          body: customerDraft,
        })
        .execute();

      if (customerResponse.statusCode === 201) {
        CustomerInfo.setCustomer(customerResponse.body.customer);
        if (CustomerInfo.id) this.cartService.createRegisteredCart(this.apiRoot, CustomerInfo.id);

        const addresses = customerDraft.addresses ?? [];
        const bothDefaultIndex = addresses.findIndex((addr) => addr.bothAddressesDefault);
        const shippingDefaultIndex = addresses.findIndex(
          (addr, i) => addr.addressDefault && i === 0,
        );
        const billingDefaultIndex = addresses.findIndex(
          (addr, i) => addr.addressDefault && i === 1,
        );
        if (bothDefaultIndex !== -1) {
          const shippingResponse = await this.setDefaultShippingAddress(
            customerResponse,
            bothDefaultIndex,
          );
          await this.setDefaultBillingAddress(shippingResponse, 0);
        } else if (shippingDefaultIndex !== -1) {
          const shippingResponse = await this.setDefaultShippingAddress(
            customerResponse,
            shippingDefaultIndex,
          );
          if (customerDraft.addresses[1].addressDefault) {
            await this.setDefaultBillingAddress(shippingResponse, billingDefaultIndex);
          } else {
            await this.setBillingAddressId(shippingResponse, 1);
          }
        } else if (billingDefaultIndex !== -1) {
          const shippingResponse = await this.setShippingAddressId(customerResponse, 0);
          if (customerDraft.addresses[1].addressDefault) {
            await this.setDefaultBillingAddress(shippingResponse, billingDefaultIndex);
          } else {
            await this.setBillingAddressId(shippingResponse, 1);
          }
        } else {
          const shippingResponse = await this.setShippingAddressId(customerResponse, 0);
          await this.setBillingAddressId(shippingResponse, 1);
        }
        this.isAuthorized.set(true);
        return {
          result: true,
          message: 'you have successfully created an account',
          customer: customerResponse.body.customer,
        };
      } else {
        throw Error('Account creation failed.');
      }
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return String(error);
    }
  }

  public async signIn(email: string, password: string): Promise<SignUpResult | string> {
    const customerCredentials = {
      email,
      password,
    };

    try {
      const apiRoot = this.createApiRoot(this.getPasswordClient(email, password));
      const customerResponse = await apiRoot
        .login()
        .post({
          body: customerCredentials,
        })
        .execute();

      this.apiRoot = apiRoot;
      if (customerResponse.statusCode === 200) {
        localStorage.removeItem(`${Session.ANONYM}_${this.PROJECT_KEY}`);
        localStorage.setItem('authorized', 'true');
        this.isAuthorized.set(true);
        return {
          result: true,
          message: 'You are logged in',
          customer: customerResponse.body.customer,
        };
      } else {
        throw Error('Login to account failed.');
      }
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return String(error);
    }
  }

  public async logout(): Promise<void> {
    localStorage.clear();
    this.apiRoot = this.createApiRoot(this.getAnonymousClient());
    await this.cartService.createAnonymousCart(this.apiRoot);
    this.isAuthorized.set(false);
    await this.apiRoot.get().execute();
  }

  public getRefreshMiddlewareOptions(refreshToken: string): RefreshAuthMiddlewareOptions {
    return {
      host: this.OAUTH_URL,
      projectKey: this.PROJECT_KEY,
      credentials: {
        clientId: this.CLIENT_ID,
        clientSecret: this.CLIENT_SECRET,
      },
      refreshToken,
    };
  }

  protected createApiRoot(ctpClient: Client): ByProjectKeyRequestBuilder {
    return createApiBuilderFromCtpClient(ctpClient).withProjectKey({
      projectKey: this.PROJECT_KEY,
    });
  }

  protected getAuthMiddlewareOptions(): AuthMiddlewareOptions {
    return {
      host: this.OAUTH_URL,
      projectKey: this.PROJECT_KEY,
      credentials: {
        clientId: this.CLIENT_ID,
        clientSecret: this.CLIENT_SECRET,
      },
      tokenCache: tokenCacheAnonym,
      scopes: [this.SCOPES],
      httpClient: fetch,
    };
  }

  protected getPasswordAuthMiddlewareOptions(
    email: string,
    password: string,
  ): PasswordAuthMiddlewareOptions {
    return {
      host: this.OAUTH_URL,
      projectKey: this.PROJECT_KEY,
      credentials: {
        clientId: this.CLIENT_ID,
        clientSecret: this.CLIENT_SECRET,
        user: {
          username: email,
          password,
        },
      },
      tokenCache: tokenCacheAuth,
      scopes: [this.SCOPES],
      httpClient: fetch,
    };
  }

  protected getHttpMiddlewareOptions(): HttpMiddlewareOptions {
    return {
      host: this.API_URL,
      httpClient: fetch,
    };
  }

  protected getPasswordClient(email: string, password: string): Client {
    return new ClientBuilder()
      .withPasswordFlow(this.getPasswordAuthMiddlewareOptions(email, password))
      .withHttpMiddleware(this.getHttpMiddlewareOptions())
      .build();
  }

  protected getAnonymousClient(): Client {
    return new ClientBuilder()
      .withAnonymousSessionFlow(this.getAuthMiddlewareOptions())
      .withHttpMiddleware(this.getHttpMiddlewareOptions())
      .build();
  }

  protected getRefreshClient(session: Session): Client {
    return new ClientBuilder()
      .withRefreshTokenFlow(
        this.getRefreshMiddlewareOptions(this.getRefreshTokenFromStorage(session)),
      )
      .withHttpMiddleware(this.getHttpMiddlewareOptions())
      .build();
  }

  protected getRefreshTokenFromStorage(sessionType: Session): string {
    const token = localStorage.getItem(`${sessionType}_${this.PROJECT_KEY}`);
    if (!token) {
      return '';
    }
    return JSON.parse(token).refreshToken;
  }

  private async setDefaultBillingAddress(
    shippingResponse: ClientResponse<Customer>,
    index: number,
  ) {
    await this.apiRoot
      .customers()
      .withId({ ID: shippingResponse.body!.id })
      .post({
        body: {
          version: shippingResponse.body!.version,
          actions: [
            {
              action: 'setDefaultBillingAddress',
              addressId: shippingResponse.body!.addresses[index].id,
            },
          ],
        },
      })
      .execute();
  }

  private async setBillingAddressId(shippingResponse: ClientResponse<Customer>, index: number) {
    await this.apiRoot
      .customers()
      .withId({ ID: shippingResponse.body!.id })
      .post({
        body: {
          version: shippingResponse.body!.version,
          actions: [
            {
              action: 'addBillingAddressId',
              addressId: shippingResponse.body!.addresses[index].id,
            },
          ],
        },
      })
      .execute();
  }

  private async setDefaultShippingAddress(
    customerResponse: ClientResponse<CustomerSignInResult>,
    index: number,
  ): Promise<ClientResponse<Customer>> {
    return await this.apiRoot
      .customers()
      .withId({ ID: customerResponse.body!.customer.id })
      .post({
        body: {
          version: customerResponse.body!.customer.version,
          actions: [
            {
              action: 'setDefaultShippingAddress',
              addressId: customerResponse.body!.customer.addresses[index].id,
            },
          ],
        },
      })
      .execute();
  }
  private async setShippingAddressId(
    customerResponse: ClientResponse<CustomerSignInResult>,
    index: number,
  ): Promise<ClientResponse<Customer>> {
    return await this.apiRoot
      .customers()
      .withId({ ID: customerResponse.body!.customer.id })
      .post({
        body: {
          version: customerResponse.body!.customer.version,
          actions: [
            {
              action: 'addShippingAddressId',
              addressId: customerResponse.body!.customer.addresses[index].id,
            },
          ],
        },
      })
      .execute();
  }
}
