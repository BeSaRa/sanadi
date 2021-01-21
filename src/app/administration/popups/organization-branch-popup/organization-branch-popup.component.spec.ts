import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationBranchPopupComponent } from './organization-branch-popup.component';

describe('OrganizationBranchPopupComponent', () => {
  let component: OrganizationBranchPopupComponent;
  let fixture: ComponentFixture<OrganizationBranchPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationBranchPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationBranchPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
