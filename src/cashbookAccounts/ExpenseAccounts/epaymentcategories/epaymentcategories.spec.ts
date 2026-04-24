import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Epaymentcategories } from './epaymentcategories';

describe('Epaymentcategories', () => {
  let component: Epaymentcategories;
  let fixture: ComponentFixture<Epaymentcategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Epaymentcategories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Epaymentcategories);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
