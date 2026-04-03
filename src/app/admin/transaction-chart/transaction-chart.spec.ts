import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionChart } from './transaction-chart';

describe('TransactionChart', () => {
  let component: TransactionChart;
  let fixture: ComponentFixture<TransactionChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
