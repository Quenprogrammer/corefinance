import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IrecieptLedger } from './ireciept-ledger';

describe('IrecieptLedger', () => {
  let component: IrecieptLedger;
  let fixture: ComponentFixture<IrecieptLedger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrecieptLedger]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IrecieptLedger);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
