import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesLeaveRowComponent } from './site-employees-leave-row.component';

describe('SiteEmployeesLeaveRowComponent', () => {
  let component: SiteEmployeesLeaveRowComponent;
  let fixture: ComponentFixture<SiteEmployeesLeaveRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeesLeaveRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesLeaveRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
