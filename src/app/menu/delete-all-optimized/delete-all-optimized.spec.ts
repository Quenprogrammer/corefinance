import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAllOptimized } from './delete-all-optimized';

describe('DeleteAllOptimized', () => {
  let component: DeleteAllOptimized;
  let fixture: ComponentFixture<DeleteAllOptimized>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteAllOptimized]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteAllOptimized);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
