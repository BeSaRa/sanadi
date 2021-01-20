import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationUnitPopupComponent } from './organization-unit-popup.component';

describe('OrganizationUnitPopupComponent', () => {
  let component: OrganizationUnitPopupComponent;
  let fixture: ComponentFixture<OrganizationUnitPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationUnitPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationUnitPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
