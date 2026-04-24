import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpaymentLedger } from './ipayment-ledger';

describe('IpaymentLedger', () => {
  let component: IpaymentLedger;
  let fixture: ComponentFixture<IpaymentLedger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpaymentLedger]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpaymentLedger);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
