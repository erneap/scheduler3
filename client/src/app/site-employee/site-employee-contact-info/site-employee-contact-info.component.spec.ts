import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeeContactInfoComponent } from './site-employee-contact-info.component';

describe('SiteEmployeeContactInfoComponent', () => {
  let component: SiteEmployeeContactInfoComponent;
  let fixture: ComponentFixture<SiteEmployeeContactInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeeContactInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeeContactInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
