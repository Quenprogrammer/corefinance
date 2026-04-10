import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryTransactionsDetail } from './category-transactions-detail';

describe('CategoryTransactionsDetail', () => {
  let component: CategoryTransactionsDetail;
  let fixture: ComponentFixture<CategoryTransactionsDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryTransactionsDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryTransactionsDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
