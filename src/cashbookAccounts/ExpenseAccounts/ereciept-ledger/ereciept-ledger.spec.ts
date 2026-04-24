import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErecieptLedger } from './ereciept-ledger';

describe('ErecieptLedger', () => {
  let component: ErecieptLedger;
  let fixture: ComponentFixture<ErecieptLedger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErecieptLedger]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErecieptLedger);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
