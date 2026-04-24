import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pdashboard } from './pdashboard';

describe('Pdashboard', () => {
  let component: Pdashboard;
  let fixture: ComponentFixture<Pdashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pdashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pdashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
