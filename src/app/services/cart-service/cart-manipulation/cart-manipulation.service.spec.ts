import { TestBed } from '@angular/core/testing';

import { CartManipulationService } from './cart-manipulation.service';

describe('CartManipulationService', () => {
  let service: CartManipulationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartManipulationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
