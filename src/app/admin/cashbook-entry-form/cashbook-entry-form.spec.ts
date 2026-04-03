import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashbookEntryForm } from './cashbook-entry-form';

describe('CashbookEntryForm', () => {
  let component: CashbookEntryForm;
  let fixture: ComponentFixture<CashbookEntryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashbookEntryForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashbookEntryForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
