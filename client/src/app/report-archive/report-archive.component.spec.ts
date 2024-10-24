import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportArchiveComponent } from './report-archive.component';

describe('ReportArchiveComponent', () => {
  let component: ReportArchiveComponent;
  let fixture: ComponentFixture<ReportArchiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportArchiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
