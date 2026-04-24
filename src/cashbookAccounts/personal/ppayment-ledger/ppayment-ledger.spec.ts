import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpaymentLedger } from './ppayment-ledger';

describe('PpaymentLedger', () => {
  let component: PpaymentLedger;
  let fixture: ComponentFixture<PpaymentLedger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PpaymentLedger]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpaymentLedger);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
