import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredefinedDialogComponent } from './predefined-dialog.component';

describe('PredefinedDialogComponent', () => {
  let component: PredefinedDialogComponent;
  let fixture: ComponentFixture<PredefinedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PredefinedDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PredefinedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
