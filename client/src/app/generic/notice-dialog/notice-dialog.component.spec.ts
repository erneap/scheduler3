import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticeDialogComponent } from './notice-dialog.component';

describe('NoticeDialogComponent', () => {
  let component: NoticeDialogComponent;
  let fixture: ComponentFixture<NoticeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoticeDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoticeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
