import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteWorkcenterPositionComponent } from './site-workcenter-position.component';

describe('SiteWorkcenterPositionComponent', () => {
  let component: SiteWorkcenterPositionComponent;
  let fixture: ComponentFixture<SiteWorkcenterPositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteWorkcenterPositionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteWorkcenterPositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
