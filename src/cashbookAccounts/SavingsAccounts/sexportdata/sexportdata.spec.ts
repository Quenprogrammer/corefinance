import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sexportdata } from './sexportdata';

describe('Sexportdata', () => {
  let component: Sexportdata;
  let fixture: ComponentFixture<Sexportdata>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sexportdata]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sexportdata);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
