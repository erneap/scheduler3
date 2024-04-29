import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteScheduleCoverageWorkcenterComponent } from './site-schedule-coverage-workcenter.component';

describe('SiteScheduleCoverageWorkcenterComponent', () => {
  let component: SiteScheduleCoverageWorkcenterComponent;
  let fixture: ComponentFixture<SiteScheduleCoverageWorkcenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteScheduleCoverageWorkcenterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteScheduleCoverageWorkcenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
