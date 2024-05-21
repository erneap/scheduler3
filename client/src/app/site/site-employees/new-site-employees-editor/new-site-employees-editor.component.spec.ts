import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSiteEmployeesEditorComponent } from './new-site-employees-editor.component';

describe('NewSiteEmployeesEditorComponent', () => {
  let component: NewSiteEmployeesEditorComponent;
  let fixture: ComponentFixture<NewSiteEmployeesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewSiteEmployeesEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewSiteEmployeesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
