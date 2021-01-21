import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationUserComponent } from './organization-user.component';

describe('OrganizationUserComponent', () => {
  let component: OrganizationUserComponent;
  let fixture: ComponentFixture<OrganizationUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
