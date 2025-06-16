import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressCardComponent } from './address-card.component';
import { AddressResponse } from '@models/types';
import { By } from '@angular/platform-browser';

describe('AddressCardComponent', () => {
  let component: AddressCardComponent;
  let fixture: ComponentFixture<AddressCardComponent>;

  const mockAddress: AddressResponse = {
    id: 'test-id',
    streetName: 'Test Street',
    city: 'Minsk',
    postalCode: '212121',
    state: '',
    country: 'BY',
    billingAddressIds: ['test-id'],
    shippingAddressIds: ['other-id'],
    defaultBillingAddressId: 'test-id',
    defaultShippingAddressId: 'other-id',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display address details', () => {
    component.address = mockAddress;
    component.ngOnInit();
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Test Street');
    expect(content).toContain('Minsk');
    expect(content).toContain('212121');
    expect(content).toContain('');
    expect(content).toContain('BY');
  });

  it('should show "Billing" and "Default billing" labels if applicable', () => {
    component.address = mockAddress;
    component.ngOnInit();
    fixture.detectChanges();

    const typeContainer = fixture.debugElement.query(By.css('.address-card__type-container'))
      .nativeElement.textContent;

    expect(typeContainer).toContain('Billing');
    expect(typeContainer).toContain('Default billing');
    expect(typeContainer).not.toContain('Shipping');
    expect(typeContainer).not.toContain('Default shipping');
  });

  it('should emit removeAddress with addressId when delete button is clicked', () => {
    component.address = mockAddress;
    component.ngOnInit();
    fixture.detectChanges();

    const spy = spyOn(component.removeAddress, 'emit');
    const deleteButton = fixture.debugElement.query(By.css('button.btn-delete'));

    deleteButton?.nativeElement.click();
    expect(spy).toHaveBeenCalledOnceWith('test-id');
  });

  it('should emit editAddress with address when edit button is clicked', () => {
    component.address = mockAddress;
    component.ngOnInit();
    fixture.detectChanges();

    const spy = spyOn(component.editAddress, 'emit');
    const editButton = fixture.debugElement.query(By.css('button.btn-edit'));

    editButton?.nativeElement.click();
    expect(spy).toHaveBeenCalledOnceWith(mockAddress);
  });

  it('should show "Shipping" and "Default shipping" labels if address matches', () => {
    component.address = {
      ...mockAddress,
      id: 'other-id',
      billingAddressIds: [],
      shippingAddressIds: ['other-id'],
      defaultBillingAddressId: '',
      defaultShippingAddressId: 'other-id',
    };
    component.ngOnInit();
    fixture.detectChanges();

    const typeContainer = fixture.debugElement.query(By.css('.address-card__type-container'))
      .nativeElement.textContent;

    expect(typeContainer).toContain('Shipping');
    expect(typeContainer).toContain('Default shipping');
    expect(typeContainer).not.toContain('Billing');
    expect(typeContainer).not.toContain('Default billing');
  });
});
