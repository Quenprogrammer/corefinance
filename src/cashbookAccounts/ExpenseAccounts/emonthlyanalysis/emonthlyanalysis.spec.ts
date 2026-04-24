import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Emonthlyanalysis } from './emonthlyanalysis';

describe('Emonthlyanalysis', () => {
  let component: Emonthlyanalysis;
  let fixture: ComponentFixture<Emonthlyanalysis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Emonthlyanalysis]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Emonthlyanalysis);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
