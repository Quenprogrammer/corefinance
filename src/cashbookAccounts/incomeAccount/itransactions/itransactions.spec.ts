import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Itransactions } from './itransactions';

describe('Itransactions', () => {
  let component: Itransactions;
  let fixture: ComponentFixture<Itransactions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Itransactions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Itransactions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
