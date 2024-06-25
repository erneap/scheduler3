import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePtoholidaysComponent } from './employee-ptoholidays.component';

describe('EmployeePtoholidaysComponent', () => {
  let component: EmployeePtoholidaysComponent;
  let fixture: ComponentFixture<EmployeePtoholidaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeePtoholidaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePtoholidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
