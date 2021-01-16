import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomRolePopupComponent } from './custom-role-popup.component';

describe('CustomRolePopupComponent', () => {
  let component: CustomRolePopupComponent;
  let fixture: ComponentFixture<CustomRolePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomRolePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomRolePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
