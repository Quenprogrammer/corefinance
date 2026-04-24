import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Saddtransactions } from './saddtransactions';

describe('Saddtransactions', () => {
  let component: Saddtransactions;
  let fixture: ComponentFixture<Saddtransactions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Saddtransactions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Saddtransactions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
