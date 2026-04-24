import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pexportdata } from './pexportdata';

describe('Pexportdata', () => {
  let component: Pexportdata;
  let fixture: ComponentFixture<Pexportdata>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pexportdata]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pexportdata);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
