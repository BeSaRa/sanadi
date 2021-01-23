import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationBranchUserComponent } from './organization-branch-user.component';

describe('OrganizationBranchUserComponent', () => {
  let component: OrganizationBranchUserComponent;
  let fixture: ComponentFixture<OrganizationBranchUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationBranchUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationBranchUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
