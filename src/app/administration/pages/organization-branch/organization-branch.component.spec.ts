import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationBranchComponent } from './organization-branch.component';

describe('OrganizationBranchComponent', () => {
  let component: OrganizationBranchComponent;
  let fixture: ComponentFixture<OrganizationBranchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationBranchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationBranchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
