import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Edashboard } from './edashboard';

describe('Edashboard', () => {
  let component: Edashboard;
  let fixture: ComponentFixture<Edashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Edashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Edashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
