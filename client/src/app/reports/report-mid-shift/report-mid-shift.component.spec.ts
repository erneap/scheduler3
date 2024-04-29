import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMidShiftComponent } from './report-mid-shift.component';

describe('ReportMidShiftComponent', () => {
  let component: ReportMidShiftComponent;
  let fixture: ComponentFixture<ReportMidShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportMidShiftComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportMidShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
