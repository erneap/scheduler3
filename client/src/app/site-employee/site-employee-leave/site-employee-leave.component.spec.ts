import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeeLeaveComponent } from './site-employee-leave.component';

describe('SiteEmployeeLeaveComponent', () => {
  let component: SiteEmployeeLeaveComponent;
  let fixture: ComponentFixture<SiteEmployeeLeaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeeLeaveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeeLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
