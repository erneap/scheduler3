import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeeAssignmentComponent } from './site-employee-assignment.component';

describe('SiteEmployeeAssignmentComponent', () => {
  let component: SiteEmployeeAssignmentComponent;
  let fixture: ComponentFixture<SiteEmployeeAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeeAssignmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeeAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
