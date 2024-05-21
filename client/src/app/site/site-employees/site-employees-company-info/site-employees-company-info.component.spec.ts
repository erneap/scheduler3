import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesCompanyInfoComponent } from './site-employees-company-info.component';

describe('SiteEmployeesCompanyInfoComponent', () => {
  let component: SiteEmployeesCompanyInfoComponent;
  let fixture: ComponentFixture<SiteEmployeesCompanyInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeesCompanyInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesCompanyInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
