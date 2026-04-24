import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IrecieptCategories } from './ireciept-categories';

describe('IrecieptCategories', () => {
  let component: IrecieptCategories;
  let fixture: ComponentFixture<IrecieptCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrecieptCategories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IrecieptCategories);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
