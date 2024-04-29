import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesAssignmentScheduleDayComponent } from './site-employees-assignment-schedule-day.component';

describe('SiteEmployeesAssignmentScheduleDayComponent', () => {
  let component: SiteEmployeesAssignmentScheduleDayComponent;
  let fixture: ComponentFixture<SiteEmployeesAssignmentScheduleDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeesAssignmentScheduleDayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesAssignmentScheduleDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
