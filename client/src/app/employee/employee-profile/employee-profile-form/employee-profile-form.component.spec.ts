import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeProfileFormComponent } from './employee-profile-form.component';

describe('EmployeeProfileFormComponent', () => {
  let component: EmployeeProfileFormComponent;
  let fixture: ComponentFixture<EmployeeProfileFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeProfileFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeProfileFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
