import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportModTimeComponent } from './report-mod-time.component';

describe('ReportModTimeComponent', () => {
  let component: ReportModTimeComponent;
  let fixture: ComponentFixture<ReportModTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportModTimeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportModTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
