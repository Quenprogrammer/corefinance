import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpaymentLedger } from './epayment-ledger';

describe('EpaymentLedger', () => {
  let component: EpaymentLedger;
  let fixture: ComponentFixture<EpaymentLedger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpaymentLedger]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpaymentLedger);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
