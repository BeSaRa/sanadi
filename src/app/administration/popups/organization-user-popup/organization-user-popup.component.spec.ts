import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationUserPopupComponent } from './organization-user-popup.component';

describe('OrganizationUserPopupComponent', () => {
  let component: OrganizationUserPopupComponent;
  let fixture: ComponentFixture<OrganizationUserPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationUserPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationUserPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
