import { inject, Injectable } from '@angular/core';
import { SignUpResult } from '@models/index';
import { AuthService } from '@services/auth-service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private authService: AuthService = inject(AuthService);
  public async getCustomerInfo(): Promise<SignUpResult> {
    if (this.authService.isAuthorized()) {
      try {
        const customerInfo = await this.authService.apiRoot.me().get().execute();
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
}
