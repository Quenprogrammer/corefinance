import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrecieptCategories } from './preciept-categories';

describe('PrecieptCategories', () => {
  let component: PrecieptCategories;
  let fixture: ComponentFixture<PrecieptCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrecieptCategories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrecieptCategories);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
