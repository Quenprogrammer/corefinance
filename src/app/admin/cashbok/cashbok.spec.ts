import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cashbok } from './cashbok';

describe('Cashbok', () => {
  let component: Cashbok;
  let fixture: ComponentFixture<Cashbok>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cashbok]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cashbok);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
