import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteWorkcenterShiftComponent } from './site-workcenter-shift.component';

describe('SiteWorkcenterShiftComponent', () => {
  let component: SiteWorkcenterShiftComponent;
  let fixture: ComponentFixture<SiteWorkcenterShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteWorkcenterShiftComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteWorkcenterShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
