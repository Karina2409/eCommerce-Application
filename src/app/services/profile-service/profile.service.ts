import { inject, Injectable } from '@angular/core';
import {
  ByProjectKeyRequestBuilder,
  CustomerUpdateAction,
  CustomerChangePassword,
} from '@commercetools/platform-sdk';
import { SignUpResult } from '@models/index';
import { AuthService } from '@services/auth-service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  public root!: ByProjectKeyRequestBuilder;
  public currentVersion!: number;
  private authService: AuthService = inject(AuthService);
  public async getCustomerInfo(): Promise<SignUpResult> {
    if (this.authService.isAuthorized()) {
      try {
        const customerInfo = await this.authService.apiRoot.me().get().execute();
        this.currentVersion = customerInfo.body.version;
        if (customerInfo) {
          return {
            result: true,
            message: '',
            customer: customerInfo.body,
          };
        }
        return {
          result: false,
          message: '',
        };
      } catch {
        return {
          result: false,
          message: 'Failed to load customer',
        };
      }
    } else {
      return {
        result: false,
        message: 'Not authorized',
      };
    }
  }

  public async updateCustomerInfo(
    id: string,
    data: { version: number; actions: CustomerUpdateAction[] },
  ): Promise<SignUpResult | string> {
    this.root = this.authService.apiRoot;
    try {
      const customerUpdateResult = await this.root
        .customers()
        .withId({ ID: id })
        .post({ body: data })
        .execute();
      return {
        result: true,
        customer: customerUpdateResult.body,
        message: 'User data is updated',
      };
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return String(error);
    }
  }

  public async updateCustomerPassword(data: CustomerChangePassword) {
    try {
      this.root = this.authService.apiRoot;
      const customerUpdateResult = await this.root
        .customers()
        .password()
        .post({ body: data })
        .execute();

      return {
        success: true,
        customer: customerUpdateResult.body,
        message: 'Password updated!',
      };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, customer: {}, message: error.message };
      }
      return String(error);
    }
  }
}
