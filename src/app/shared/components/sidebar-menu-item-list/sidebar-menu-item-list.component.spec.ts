import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarMenuItemListComponent } from './sidebar-menu-item-list.component';

describe('SidebarMenuItemListComponent', () => {
  let component: SidebarMenuItemListComponent;
  let fixture: ComponentFixture<SidebarMenuItemListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SidebarMenuItemListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarMenuItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
