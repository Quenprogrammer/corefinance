import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Smonthlyanalysis } from './smonthlyanalysis';

describe('Smonthlyanalysis', () => {
  let component: Smonthlyanalysis;
  let fixture: ComponentFixture<Smonthlyanalysis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Smonthlyanalysis]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Smonthlyanalysis);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
