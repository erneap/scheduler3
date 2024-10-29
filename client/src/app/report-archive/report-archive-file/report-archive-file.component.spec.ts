import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportArchiveFileComponent } from './report-archive-file.component';

describe('ReportArchiveFileComponent', () => {
  let component: ReportArchiveFileComponent;
  let fixture: ComponentFixture<ReportArchiveFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportArchiveFileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportArchiveFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
