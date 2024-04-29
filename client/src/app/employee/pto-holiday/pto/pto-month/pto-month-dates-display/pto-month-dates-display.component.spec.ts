import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PtoMonthDatesDisplayComponent } from './pto-month-dates-display.component';

describe('PtoMonthDatesDisplayComponent', () => {
  let component: PtoMonthDatesDisplayComponent;
  let fixture: ComponentFixture<PtoMonthDatesDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PtoMonthDatesDisplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PtoMonthDatesDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
