import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryAnalysis } from './category-analysis';

describe('CategoryAnalysis', () => {
  let component: CategoryAnalysis;
  let fixture: ComponentFixture<CategoryAnalysis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryAnalysis]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryAnalysis);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
