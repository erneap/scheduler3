import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeeVariationComponent } from './site-employee-variation.component';

describe('SiteEmployeeVariationComponent', () => {
  let component: SiteEmployeeVariationComponent;
  let fixture: ComponentFixture<SiteEmployeeVariationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeeVariationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeeVariationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
