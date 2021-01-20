import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationUnitComponent } from './organization-unit.component';

describe('OrganizationUnitComponent', () => {
  let component: OrganizationUnitComponent;
  let fixture: ComponentFixture<OrganizationUnitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationUnitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
