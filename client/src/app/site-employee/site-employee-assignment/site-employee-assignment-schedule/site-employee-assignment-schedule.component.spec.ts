import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeeAssignmentScheduleComponent } from './site-employee-assignment-schedule.component';

describe('SiteEmployeeAssignmentScheduleComponent', () => {
  let component: SiteEmployeeAssignmentScheduleComponent;
  let fixture: ComponentFixture<SiteEmployeeAssignmentScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeeAssignmentScheduleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeeAssignmentScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
