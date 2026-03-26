import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CooperativesChartComponent } from './cooperatives-chart.component';

describe('CooperativesChartComponent', () => {
  let component: CooperativesChartComponent;
  let fixture: ComponentFixture<CooperativesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CooperativesChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CooperativesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
