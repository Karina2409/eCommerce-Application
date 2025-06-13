import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeammateCardComponent } from './teammate-card.component';

describe('TeammateCardComponent', () => {
  let component: TeammateCardComponent;
  let fixture: ComponentFixture<TeammateCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeammateCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TeammateCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
