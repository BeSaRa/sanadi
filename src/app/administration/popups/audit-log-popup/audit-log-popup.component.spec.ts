import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditLogPopupComponent } from './audit-log-popup.component';

describe('AuditLogPopupComponent', () => {
  let component: AuditLogPopupComponent;
  let fixture: ComponentFixture<AuditLogPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuditLogPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditLogPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
