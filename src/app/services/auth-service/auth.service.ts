import { Injectable } from '@angular/core';
import { createApiBuilderFromCtpClient, CustomerDraft } from '@commercetools/platform-sdk';
import {
  ClientBuilder,
  // Import middlewares
  type PasswordAuthMiddlewareOptions,
  type AuthMiddlewareOptions,
  type HttpMiddlewareOptions,
  Client,
  RefreshAuthMiddlewareOptions,
} from '@commercetools/ts-client';
import type { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';

import { SignUpResult } from '@models/types/sign-up-result';
import { environment } from '@environments/environment.development';
import { tokenCacheAnonym, tokenCacheAuth } from '@services/auth-service/token';
import { Session } from '@models/enums/session';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public apiRoot: ByProjectKeyRequestBuilder;
  protected PROJECT_KEY = environment.projectKey;
  protected API_URL = environment.apiUrl;
  protected OAUTH_URL = environment.authUrl;
  protected CLIENT_ID = environment.clientId;
  protected CLIENT_SECRET = environment.clientSecret;
  protected SCOPES = environment.scopes;
  constructor() {
    if (!this.isAuthorized()) {
      this.apiRoot = this.createApiRoot(this.getAnonymousClient());
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

  public async signUp(customerDraft: CustomerDraft): Promise<void | SignUpResult> {
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
        console.log(customerResponse.body.customer);
        return {
          result: true,
          message: 'you have successfully created an account',
          customer: customerResponse.body.customer,
        };
      } else {
        return { result: false, message: 'Account creation failed.' };
      }
    } catch (error) {
      return console.log(error);
    }
  }

  public async signIn(email: string, password: string): Promise<void | SignUpResult> {
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
        console.log(customerResponse.body.customer);
        return {
          result: true,
          message: 'You are logged in',
          customer: customerResponse.body.customer,
        };
      } else {
        return { result: false, message: 'Login to account failed.' };
      }
    } catch (error) {
      return console.log(error);
    }
  }

  public async logout(): Promise<void> {
    localStorage.clear();
    await this.sessionStateHandler();
  }

  // eslint-disable-next-line class-methods-use-this
  public isAuthorized(): string | null {
    return localStorage.getItem('authorized');
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
}
