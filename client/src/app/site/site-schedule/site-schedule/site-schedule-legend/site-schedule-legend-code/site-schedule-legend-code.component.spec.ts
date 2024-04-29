import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteScheduleLegendCodeComponent } from './site-schedule-legend-code.component';

describe('SiteScheduleLegendCodeComponent', () => {
  let component: SiteScheduleLegendCodeComponent;
  let fixture: ComponentFixture<SiteScheduleLegendCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteScheduleLegendCodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteScheduleLegendCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
