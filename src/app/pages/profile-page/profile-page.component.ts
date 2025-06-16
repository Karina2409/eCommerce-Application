import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NgForOf } from '@angular/common';
import { ProfileService } from '@services/profile-service';
import { Address, AddressResponse, AddressType } from '@models/types';
import { Customer } from '@commercetools/platform-sdk';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { passwordValidator } from '@validators/password';
import { minAgeValidator } from '@validators/age';
import {
  DateFieldComponent,
  EmailFieldComponent,
  NameFieldComponent,
  PasswordFieldComponent,
} from '@components/input';
import { emailValidator } from '@validators/email';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { latinValidator } from '@validators/latin';
import { ModalComponent } from '@components/modal';
import { MatSelectModule } from '@angular/material/select';
import { AddressComponent } from '@components/address-form';
import { AddressCardComponent } from '@components/address-card';
import { AuthService } from '@services/auth-service';
import { MatTab, MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'app-profile-page',
  imports: [
    AddressCardComponent,
    NgForOf,
    NameFieldComponent,
    DateFieldComponent,
    ReactiveFormsModule,
    MatButtonModule,
    EmailFieldComponent,
    MatIcon,
    MatTooltip,
    RouterLink,
    PasswordFieldComponent,
    ModalComponent,
    MatSelectModule,
    AddressComponent,
    FormsModule,
    MatTabGroup,
    MatTab,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent implements OnInit {
  public AddressFormGroup!: FormGroup;

  public user!: Customer;
  public addresses = signal<AddressResponse[]>([]);
  public profileService = inject(ProfileService);
  public authService: AuthService = inject(AuthService);
  public isInfoEditing = signal(false);
  public isPasswordChanging = signal(false);
  public isModalShown = signal(false);
  public selectedAddressType: AddressType = 'billing';
  public selectedAddressTypeDefault: AddressType = 'billing';
  public message = '';
  public billingAddressData = {};
  public shippingAddressData = {};
  public addressToEdit: AddressResponse | null = null;

  public form: FormGroup = new FormGroup({
    userInfo: new FormGroup({
      firstName: new FormControl('', [Validators.required, latinValidator]),
      lastName: new FormControl('', [Validators.required, latinValidator]),
      dateOfBirth: new FormControl('', [Validators.required, minAgeValidator(13)]),
      email: new FormControl('', [Validators.required, emailValidator]),
    }),

    password: new FormGroup({
      oldPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        passwordValidator,
      ]),

      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        passwordValidator,
      ]),
    }),

    addressForm: new FormGroup({}),
  });

  public get userInfoGroup(): FormGroup {
    return this.form.get('userInfo') as FormGroup;
  }

  public get passwordGroup(): FormGroup {
    return this.form.get('password') as FormGroup;
  }

  public get oldPassword(): FormControl {
    return this.passwordGroup.get('oldPassword') as FormControl;
  }

  public get newPassword(): FormControl {
    return this.passwordGroup.get('newPassword') as FormControl;
  }

  public get firstName(): FormControl {
    return this.userInfoGroup.get('firstName') as FormControl;
  }

  public get lastName(): FormControl {
    return this.userInfoGroup.get('lastName') as FormControl;
  }

  public get dateOfBirth(): FormControl {
    return this.userInfoGroup.get('dateOfBirth') as FormControl;
  }

  public get email(): FormControl {
    return this.userInfoGroup.get('email') as FormControl;
  }

  public get addressFormGroup(): FormGroup {
    return this.form.get('addressForm') as FormGroup;
  }

  public onAddressFormInit(addressForm: FormGroup) {
    this.AddressFormGroup = addressForm;
    this.form.setControl('addressForm', this.AddressFormGroup);
  }

  public async ngOnInit() {
    await this.getCustomerInfo();
  }

  public async onAddressTypeChange(newType: AddressType) {
    if (!this.addressFormGroup) return;
    if (this.selectedAddressType === 'billing') {
      this.billingAddressData = this.addressFormGroup.value;
      if (this.addressToEdit?.id) {
        await this.addBillingAddressID(this.addressToEdit?.id);
        await this.removeShippingAddressID(this.addressToEdit?.id);
      }
    }
    if (this.selectedAddressType === 'shipping') {
      this.shippingAddressData = this.addressFormGroup.value;
      if (this.addressToEdit?.id) {
        await this.addShippingAddressID(this.addressToEdit?.id);
        await this.removeBillingAddressID(this.addressToEdit?.id);
      }
    }
    if (this.selectedAddressType === 'shipping & billing') {
      if (this.addressToEdit?.id) {
        await this.addShippingAddressID(this.addressToEdit?.id);
        await this.addBillingAddressID(this.addressToEdit?.id);
      }
    }

    this.selectedAddressType = newType;

    if (newType === 'billing') {
      this.addressFormGroup.patchValue(this.billingAddressData || {});
    } else if (newType === 'shipping') {
      this.addressFormGroup.patchValue(this.shippingAddressData || {});
    }
  }

  public async onAddressTypeAddressDefault() {
    if (!this.addressFormGroup) return;
    if (this.selectedAddressTypeDefault === 'billing') {
      if (this.addressToEdit?.id) {
        await this.setDefaultBillingAddress(this.addressToEdit?.id);
      }
    }
    if (this.selectedAddressTypeDefault === 'shipping') {
      if (this.addressToEdit?.id) {
        await this.setDefaultShippingAddress(this.addressToEdit?.id);
      }
    }
    if (this.selectedAddressTypeDefault === 'shipping & billing') {
      if (this.addressToEdit?.id) {
        await this.setDefaultShippingAddress(this.addressToEdit?.id);
        await this.setDefaultBillingAddress(this.addressToEdit?.id);
      }
    }
  }

  public setAddresses(customer: Customer): AddressResponse[] {
    void this;
    const {
      addresses,
      billingAddressIds,
      shippingAddressIds,
      defaultBillingAddressId,
      defaultShippingAddressId,
    } = customer;
    return addresses.map((address) => ({
      ...address,
      billingAddressIds,
      shippingAddressIds,
      defaultBillingAddressId,
      defaultShippingAddressId,
    }));
  }

  public toggleInfoEdition(): void {
    this.isInfoEditing.update((value) => !value);
  }

  public async onSubmitAction(): Promise<void> {
    if (this.userInfoGroup.valid) {
      if (this.user.lastName === this.lastName.value) {
        await this.changeLastName(this.lastName.value);
      }
      if (this.user.firstName === this.firstName.value) {
        await this.changeFirstName(this.firstName.value);
      }
      if (this.user.email === this.email.value) {
        await this.changeEmail(this.email.value);
      }
      if (this.user.dateOfBirth === this.dateOfBirth.value) {
        await this.setDateOfBirth(this.dateOfBirth.value);
      }
    }
    this.isInfoEditing.set(false);
  }

  public async onEditPasswordSubmit(): Promise<void> {
    if (!this.passwordGroup.valid) return;

    let id = '';
    const data = await this.profileService.getCustomerInfo();
    if (data.customer?.id) {
      id = data.customer.id;
    }
    await this.profileService
      .updateCustomerPassword({
        id: id,
        version: this.profileService.currentVersion,
        currentPassword: this.oldPassword.value,
        newPassword: this.newPassword.value,
      })
      .then((result) => {
        if (result instanceof Object && result?.success) {
          if (data.customer?.email)
            this.authService.signIn(data.customer?.email, this.newPassword.value);
          this.togglePasswordEditing();
        } else if (result instanceof Object && !result?.success) {
          this.message = result.message;
        }
      });
  }

  public togglePasswordEditing(): void {
    this.isPasswordChanging.update((value) => !value);
    this.passwordGroup.reset();
    this.message = '';
  }

  public onOpenModal(): void {
    this.isModalShown.update((value) => !value);
  }

  public onModalClose(): void {
    this.isModalShown.update((value) => !value);
    this.addressFormGroup.reset();
  }

  public async getCustomerInfo() {
    await this.profileService.getCustomerInfo().then((info) => {
      if (info.customer) {
        this.user = info.customer;
        this.addresses.set(this.setAddresses(info.customer));
        if (this.userInfoGroup) {
          this.userInfoGroup.patchValue({
            firstName: this.user.firstName ?? '',
            lastName: this.user.lastName ?? '',
            dateOfBirth: this.user.dateOfBirth ?? '',
            email: this.user.email ?? '',
          });
        }
      }
    });
  }

  public async onModalConfirm(event: Event): Promise<void> {
    event.preventDefault();
    const address: Address = {
      city: this.addressFormGroup.get('city')?.value ?? '',
      country: this.addressFormGroup.get('country')?.value ?? '',
      postalCode: this.addressFormGroup.get('postalCode')?.value ?? '',
      streetName: this.addressFormGroup.get('streetName')?.value ?? '',
    } as Address;

    if (this.addressToEdit === null) {
      await this.addAddress(address);
    } else {
      await this.changeAddress({
        ...address,
        addressId: this.addressToEdit.id,
      } as Address);
    }
    this.addressToEdit = null;
    await this.getCustomerInfo();

    this.onModalClose();
  }

  public async onRemoveAddress(id: string): Promise<void> {
    await this.removeAddress(id);
    await this.getCustomerInfo();
  }

  public async onEditAddress(address: AddressResponse): Promise<void> {
    this.addressToEdit = address;
    this.selectedAddressType = address.shippingAddressIds?.some((id) => address.id === id)
      ? 'shipping'
      : 'billing';
    this.onOpenModal();
  }

  public async addAddress({ city, country, postalCode, streetName }: Address) {
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'addAddress',
          address: {
            streetName,
            postalCode,
            city,
            country,
          },
        },
      ],
    });
  }

  public async changeAddress({ addressId, streetName, postalCode, city, country }: Address) {
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'changeAddress',
          addressId,
          address: {
            streetName,
            postalCode,
            city,
            country,
          },
        },
      ],
    });
  }

  public async removeAddress(addressId: string) {
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'removeAddress',
          addressId,
        },
      ],
    });
  }

  public async setDefaultShippingAddress(addressId: string) {
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'setDefaultShippingAddress',
          addressId,
        },
      ],
    });
  }

  public async addShippingAddressID(addressId: string) {
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'addShippingAddressId',
          addressId,
        },
      ],
    });
  }

  public async removeShippingAddressID(addressId: string) {
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'removeShippingAddressId',
          addressId,
        },
      ],
    });
  }

  public async setDefaultBillingAddress(addressId: string) {
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'setDefaultBillingAddress',
          addressId,
        },
      ],
    });
  }

  public async addBillingAddressID(addressId: string) {
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'addBillingAddressId',
          addressId,
        },
      ],
    });
  }

  public async removeBillingAddressID(addressId: string) {
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'removeBillingAddressId',
          addressId,
        },
      ],
    });
  }

  public async changeEmail(email: string) {
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'changeEmail',
          email,
        },
      ],
    });
  }

  public async changeFirstName(firstName: string) {
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'setFirstName',
          firstName,
        },
      ],
    });
  }

  public async changeLastName(lastName: string) {
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'setLastName',
          lastName,
        },
      ],
    });
  }

  //format dateOfBirth: '2015-10-21'
  public async setDateOfBirth(dateOfBirth: string) {
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'setDateOfBirth',
          dateOfBirth,
        },
      ],
    });
  }
}
