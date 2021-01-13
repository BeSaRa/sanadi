import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomRoleComponent } from './custom-role.component';

describe('CustomRoleComponent', () => {
  let component: CustomRoleComponent;
  let fixture: ComponentFixture<CustomRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomRoleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
