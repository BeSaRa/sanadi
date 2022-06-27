import { Injectable } from '@angular/core';
import { ReportContract } from "@contracts/report-contract";
import { MenuItemService } from "@services/menu-item.service";
import { MenuItem } from "@app/models/menu-item";
import { MenuItemInterceptor } from "@app/model-interceptors/menu-item-interceptor";

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private menuService: MenuItemService) { }

  prepareReportsMenu(reports: ReportContract[]): void {
    let maxId = this.getMaxId(this.menuService.menuItems)
    const reportMenu = this.getMainReportMenu()

    if (!reportMenu) {
      return
    }

    reports.forEach(item => {
      ++maxId
      this.menuService.menuItems.push(MenuItemInterceptor.receive(new MenuItem().clone({
        id: maxId,
        parent: reportMenu.id,
        langKey: item.langKey,
        group: 'reports',
        isSvg: false,
        icon: 'mdi-file-chart-outline',
        path: 'home/reports/details/'+ item.url
      })))
    })
  }

  getMaxId(items: MenuItem[]): number {
    return Math.max.apply(this, items.map(item => item.id))
  }

  getMainReportMenu(): MenuItem | undefined {
    return this.menuService.menuItems.find(item => item.langKey === 'menu_reports')
  }
}
