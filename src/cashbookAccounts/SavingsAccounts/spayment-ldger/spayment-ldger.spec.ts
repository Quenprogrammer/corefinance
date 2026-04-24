import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaymentLdger } from './spayment-ldger';

describe('SpaymentLdger', () => {
  let component: SpaymentLdger;
  let fixture: ComponentFixture<SpaymentLdger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaymentLdger]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpaymentLdger);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
