import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeeCompanyInfoComponent } from './site-employee-company-info.component';

describe('SiteEmployeeCompanyInfoComponent', () => {
  let component: SiteEmployeeCompanyInfoComponent;
  let fixture: ComponentFixture<SiteEmployeeCompanyInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeeCompanyInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeeCompanyInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
