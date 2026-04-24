import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Idashboard } from './idashboard';

describe('Idashboard', () => {
  let component: Idashboard;
  let fixture: ComponentFixture<Idashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Idashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Idashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
