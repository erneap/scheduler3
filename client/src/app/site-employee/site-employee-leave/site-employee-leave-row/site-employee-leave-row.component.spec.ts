import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeeLeaveRowComponent } from './site-employee-leave-row.component';

describe('SiteEmployeeLeaveRowComponent', () => {
  let component: SiteEmployeeLeaveRowComponent;
  let fixture: ComponentFixture<SiteEmployeeLeaveRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeeLeaveRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeeLeaveRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
