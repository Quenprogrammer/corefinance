import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SrecieptCategories } from './sreciept-categories';

describe('SrecieptCategories', () => {
  let component: SrecieptCategories;
  let fixture: ComponentFixture<SrecieptCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SrecieptCategories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SrecieptCategories);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
