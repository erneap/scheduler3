import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteBasicInformationComponent } from './site-basic-information.component';

describe('SiteBasicInformationComponent', () => {
  let component: SiteBasicInformationComponent;
  let fixture: ComponentFixture<SiteBasicInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteBasicInformationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteBasicInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
