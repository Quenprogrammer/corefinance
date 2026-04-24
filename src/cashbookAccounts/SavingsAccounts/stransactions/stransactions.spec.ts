import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Stransactions } from './stransactions';

describe('Stransactions', () => {
  let component: Stransactions;
  let fixture: ComponentFixture<Stransactions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stransactions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Stransactions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
