import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SrecieptLedger } from './sreciept-ledger';

describe('SrecieptLedger', () => {
  let component: SrecieptLedger;
  let fixture: ComponentFixture<SrecieptLedger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SrecieptLedger]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SrecieptLedger);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
