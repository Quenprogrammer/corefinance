import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ptransactions } from './ptransactions';

describe('Ptransactions', () => {
  let component: Ptransactions;
  let fixture: ComponentFixture<Ptransactions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ptransactions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ptransactions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
