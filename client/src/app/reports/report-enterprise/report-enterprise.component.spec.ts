import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportEnterpriseComponent } from './report-enterprise.component';

describe('ReportEnterpriseComponent', () => {
  let component: ReportEnterpriseComponent;
  let fixture: ComponentFixture<ReportEnterpriseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportEnterpriseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportEnterpriseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
