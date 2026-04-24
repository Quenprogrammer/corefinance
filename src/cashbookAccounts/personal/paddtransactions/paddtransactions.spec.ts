import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Paddtransactions } from './paddtransactions';

describe('Paddtransactions', () => {
  let component: Paddtransactions;
  let fixture: ComponentFixture<Paddtransactions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paddtransactions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Paddtransactions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
