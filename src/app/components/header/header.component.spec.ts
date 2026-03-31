import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { AuthService } from '@services/auth-service';
import { By } from '@angular/platform-browser';
import { CartService } from '@services/cart-service';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  let authServiceMock: Partial<AuthService>;
  let isAuthorizedSignal: WritableSignal<boolean>;

  beforeEach(async () => {
    isAuthorizedSignal = signal(true);

    authServiceMock = {
      isAuthorized: isAuthorizedSignal,
      logout: jasmine.createSpy('logout').and.resolveTo(),
    };

    const cartServiceMock = {
      count$: of(3),
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: CartService, useValue: cartServiceMock },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show "Log Out" when user is authorized', () => {
    const logoutBtn = fixture.debugElement
      .queryAll(By.css('mat-icon'))
      .find((el) => el.attributes['data-mat-icon-name'] === 'logout');
    const loginIcon = fixture.debugElement
      .queryAll(By.css('mat-icon'))
      .find((el) => el.attributes['data-mat-icon-name'] === 'login');
    const signUpIcon = fixture.debugElement
      .queryAll(By.css('mat-icon'))
      .find((el) => el.attributes['data-mat-icon-name'] === 'person_add');

    expect(logoutBtn).toBeTruthy();
    expect(loginIcon).toBeUndefined();
    expect(signUpIcon).toBeUndefined();
  });

  it('should show "Log In" and "Sign Up" when user is not authorized', async () => {
    isAuthorizedSignal.set(false);
    fixture.detectChanges();

    const loginIcon = fixture.debugElement
      .queryAll(By.css('mat-icon'))
      .find((el) => el.attributes['data-mat-icon-name'] === 'login');
    const signUpIcon = fixture.debugElement
      .queryAll(By.css('mat-icon'))
      .find((el) => el.attributes['data-mat-icon-name'] === 'person_add');
    const logoutBtn = fixture.debugElement
      .queryAll(By.css('mat-icon'))
      .find((el) => el.attributes['data-mat-icon-name'] === 'logout');

    expect(loginIcon).toBeTruthy();
    expect(signUpIcon).toBeTruthy();
    expect(logoutBtn).toBeUndefined();
  });

  it('should call logout() and reset isAuthorized when "Log Out" is clicked', async () => {
    const logoutBtn = fixture.debugElement
      .queryAll(By.css('mat-icon'))
      .find((el) => el.attributes['data-mat-icon-name'] === 'logout');

    logoutBtn?.nativeElement.click();
    await fixture.whenStable();

    expect(authServiceMock.logout).toHaveBeenCalled();
  });
});
