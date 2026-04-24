import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Etransactions } from './etransactions';

describe('Etransactions', () => {
  let component: Etransactions;
  let fixture: ComponentFixture<Etransactions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Etransactions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Etransactions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
