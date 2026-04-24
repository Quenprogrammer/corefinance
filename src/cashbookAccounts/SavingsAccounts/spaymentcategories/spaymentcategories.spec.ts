import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Spaymentcategories } from './spaymentcategories';

describe('Spaymentcategories', () => {
  let component: Spaymentcategories;
  let fixture: ComponentFixture<Spaymentcategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Spaymentcategories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Spaymentcategories);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
