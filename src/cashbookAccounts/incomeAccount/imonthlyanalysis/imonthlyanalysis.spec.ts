import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Imonthlyanalysis } from './imonthlyanalysis';

describe('Imonthlyanalysis', () => {
  let component: Imonthlyanalysis;
  let fixture: ComponentFixture<Imonthlyanalysis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Imonthlyanalysis]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Imonthlyanalysis);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
