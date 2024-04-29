import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesLeaveComponent } from './site-employees-leave.component';

describe('SiteEmployeesLeaveComponent', () => {
  let component: SiteEmployeesLeaveComponent;
  let fixture: ComponentFixture<SiteEmployeesLeaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeesLeaveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
