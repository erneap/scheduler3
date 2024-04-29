import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesComponent } from './site-employees.component';

describe('SiteEmployeesComponent', () => {
  let component: SiteEmployeesComponent;
  let fixture: ComponentFixture<SiteEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
