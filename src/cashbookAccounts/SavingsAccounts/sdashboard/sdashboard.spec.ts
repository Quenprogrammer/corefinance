import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sdashboard } from './sdashboard';

describe('Sdashboard', () => {
  let component: Sdashboard;
  let fixture: ComponentFixture<Sdashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sdashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sdashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
