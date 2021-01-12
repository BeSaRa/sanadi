import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalizationPopupComponent } from './localization-popup.component';

describe('LocalizationPopupComponent', () => {
  let component: LocalizationPopupComponent;
  let fixture: ComponentFixture<LocalizationPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocalizationPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalizationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
