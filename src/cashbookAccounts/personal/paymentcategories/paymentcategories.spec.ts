import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Paymentcategories } from './paymentcategories';

describe('Paymentcategories', () => {
  let component: Paymentcategories;
  let fixture: ComponentFixture<Paymentcategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paymentcategories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Paymentcategories);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
