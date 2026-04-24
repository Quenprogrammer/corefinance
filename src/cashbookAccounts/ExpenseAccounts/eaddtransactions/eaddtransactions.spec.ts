import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Eaddtransactions } from './eaddtransactions';

describe('Eaddtransactions', () => {
  let component: Eaddtransactions;
  let fixture: ComponentFixture<Eaddtransactions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Eaddtransactions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Eaddtransactions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
