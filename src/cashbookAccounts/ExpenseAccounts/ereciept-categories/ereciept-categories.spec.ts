import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErecieptCategories } from './ereciept-categories';

describe('ErecieptCategories', () => {
  let component: ErecieptCategories;
  let fixture: ComponentFixture<ErecieptCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErecieptCategories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErecieptCategories);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
