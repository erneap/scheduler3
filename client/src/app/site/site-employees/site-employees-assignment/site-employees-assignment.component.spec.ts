import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesAssignmentComponent } from './site-employees-assignment.component';

describe('SiteEmployeesAssignmentComponent', () => {
  let component: SiteEmployeesAssignmentComponent;
  let fixture: ComponentFixture<SiteEmployeesAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeesAssignmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
