import { Component, OnInit } from "@angular/core";
import { MenuItem } from "@app/models/menu-item";
import { MenuItemService } from "@app/services/menu-item.service";

@Component({
  selector: "remittance",
  templateUrl: "./remittance.component.html",
  styleUrls: ["./remittance.component.scss"],
})
export class RemittanceComponent implements OnInit {
  menuItems: MenuItem[] =
    this.menuItemService.getMenuByRouteGroup("remittance");

  constructor(private menuItemService: MenuItemService) {}

  ngOnInit(): void {}
}