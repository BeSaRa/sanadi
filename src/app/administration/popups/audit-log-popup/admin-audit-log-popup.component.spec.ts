import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAuditLogPopupComponent } from './admin-audit-log-popup.component';

describe('AuditLogPopupComponent', () => {
  let component: AdminAuditLogPopupComponent;
  let fixture: ComponentFixture<AdminAuditLogPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAuditLogPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAuditLogPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
