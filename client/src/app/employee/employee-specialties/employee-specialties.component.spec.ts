import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSpecialtiesComponent } from './employee-specialties.component';

describe('EmployeeSpecialtiesComponent', () => {
  let component: EmployeeSpecialtiesComponent;
  let fixture: ComponentFixture<EmployeeSpecialtiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeSpecialtiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeSpecialtiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
