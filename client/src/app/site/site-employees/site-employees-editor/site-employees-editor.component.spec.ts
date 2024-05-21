import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesEditorComponent } from './site-employees-editor.component';

describe('SiteEmployeesEditorComponent', () => {
  let component: SiteEmployeesEditorComponent;
  let fixture: ComponentFixture<SiteEmployeesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeesEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
