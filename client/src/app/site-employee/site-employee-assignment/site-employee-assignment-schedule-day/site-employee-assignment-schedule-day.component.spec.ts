import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeeAssignmentScheduleDayComponent } from './site-employee-assignment-schedule-day.component';

describe('SiteEmployeeAssignmentScheduleDayComponent', () => {
  let component: SiteEmployeeAssignmentScheduleDayComponent;
  let fixture: ComponentFixture<SiteEmployeeAssignmentScheduleDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeeAssignmentScheduleDayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeeAssignmentScheduleDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
