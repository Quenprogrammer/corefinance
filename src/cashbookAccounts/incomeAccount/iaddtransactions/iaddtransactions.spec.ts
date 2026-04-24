import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Iaddtransactions } from './iaddtransactions';

describe('Iaddtransactions', () => {
  let component: Iaddtransactions;
  let fixture: ComponentFixture<Iaddtransactions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Iaddtransactions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Iaddtransactions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
