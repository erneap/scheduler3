import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesAssignmentScheduleComponent } from './site-employees-assignment-schedule.component';

describe('SiteEmployeesAssignmentScheduleComponent', () => {
  let component: SiteEmployeesAssignmentScheduleComponent;
  let fixture: ComponentFixture<SiteEmployeesAssignmentScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeesAssignmentScheduleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesAssignmentScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
