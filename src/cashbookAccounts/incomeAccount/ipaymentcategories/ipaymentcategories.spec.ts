import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ipaymentcategories } from './ipaymentcategories';

describe('Ipaymentcategories', () => {
  let component: Ipaymentcategories;
  let fixture: ComponentFixture<Ipaymentcategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ipaymentcategories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ipaymentcategories);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
