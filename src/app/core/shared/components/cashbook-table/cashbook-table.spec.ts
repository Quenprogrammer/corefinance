import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashbookTable } from './cashbook-table';

describe('CashbookTable', () => {
  let component: CashbookTable;
  let fixture: ComponentFixture<CashbookTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashbookTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashbookTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
