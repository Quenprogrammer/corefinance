import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pmonthlyanalysis } from './pmonthlyanalysis';

describe('Pmonthlyanalysis', () => {
  let component: Pmonthlyanalysis;
  let fixture: ComponentFixture<Pmonthlyanalysis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pmonthlyanalysis]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pmonthlyanalysis);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
