import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Eexportdata } from './eexportdata';

describe('Eexportdata', () => {
  let component: Eexportdata;
  let fixture: ComponentFixture<Eexportdata>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Eexportdata]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Eexportdata);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
