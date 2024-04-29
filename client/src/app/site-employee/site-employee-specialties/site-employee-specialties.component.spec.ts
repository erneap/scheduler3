import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeeSpecialtiesComponent } from './site-employee-specialties.component';

describe('SiteEmployeeSpecialtiesComponent', () => {
  let component: SiteEmployeeSpecialtiesComponent;
  let fixture: ComponentFixture<SiteEmployeeSpecialtiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeeSpecialtiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeeSpecialtiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
