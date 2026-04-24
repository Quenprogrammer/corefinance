import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrecieptLedger } from './preciept-ledger';

describe('PrecieptLedger', () => {
  let component: PrecieptLedger;
  let fixture: ComponentFixture<PrecieptLedger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrecieptLedger]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrecieptLedger);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
