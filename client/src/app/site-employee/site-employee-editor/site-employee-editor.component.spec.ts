import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeeEditorComponent } from './site-employee-editor.component';

describe('SiteEmployeeEditorComponent', () => {
  let component: SiteEmployeeEditorComponent;
  let fixture: ComponentFixture<SiteEmployeeEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeeEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
