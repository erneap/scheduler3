import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PtoHolidayComponent } from './pto-holiday.component';

describe('PtoHolidayComponent', () => {
  let component: PtoHolidayComponent;
  let fixture: ComponentFixture<PtoHolidayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PtoHolidayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PtoHolidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
