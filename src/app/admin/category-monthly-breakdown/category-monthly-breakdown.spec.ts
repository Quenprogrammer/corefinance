import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryMonthlyBreakdown } from './category-monthly-breakdown';

describe('CategoryMonthlyBreakdown', () => {
  let component: CategoryMonthlyBreakdown;
  let fixture: ComponentFixture<CategoryMonthlyBreakdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryMonthlyBreakdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryMonthlyBreakdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
