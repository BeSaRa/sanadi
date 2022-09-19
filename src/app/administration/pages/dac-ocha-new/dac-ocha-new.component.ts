import {Component} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {AdminLookup} from '@app/models/admin-lookup';
import {DacOchaNewService} from '@services/dac-ocha-new.service';
import {LangService} from '@services/lang.service';
import {LookupService} from '@services/lookup.service';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {ITabData} from '@contracts/i-tab-data';
import {TabMap} from '@app/types/types';
import {DacOchaListComponent} from '@app/administration/pages/dac-ocha-list/dac-ocha-list.component';

@Component({
  selector: 'dac-ocha-new',
  templateUrl: './dac-ocha-new.component.html',
  styleUrls: ['./dac-ocha-new.component.scss']
})
export class DacOchaNewComponent extends AdminGenericComponent<AdminLookup, DacOchaNewService> {
  constructor(public lang: LangService,
              public service: DacOchaNewService,
              public lookupService: LookupService) {
    super();
  }

  actions = [];
  displayedColumns = [];
  adminLookupTypeEnum = AdminLookupTypeEnum;
  activeType: AdminLookupTypeEnum = AdminLookupTypeEnum.OCHA;
  listComponentMap: Map<AdminLookupTypeEnum, DacOchaListComponent> = new Map<AdminLookupTypeEnum, DacOchaListComponent>();

  tabsData: TabMap = {
    ocha: {
      name: 'OCHA',
      index: 0,
      langKey: 'ocha',
      lookupType: AdminLookupTypeEnum.OCHA,
      validStatus: () => true,
      isTouchedOrDirty: () => true,
    },
    dac: {
      name: 'DAC',
      index: 1,
      langKey: 'dac',
      lookupType: AdminLookupTypeEnum.DAC,
      validStatus: () => true,
      isTouchedOrDirty: () => true,
    }
  };

  getTabLabel(lookupType: AdminLookupTypeEnum): string {
    return this.lookupService.listByCategory.AdminLookupType.find(lookup => lookup.lookupKey === lookupType)?.getName() || '';
  }

  private _findTab(findBy: 'tabName', value: string): ITabData | undefined {
    return Object.values(this.tabsData).find(tab => {
      if (findBy === 'tabName') {
        return tab.name === value;
      }
      return undefined;
    });
  }

  tabChanged(tab: TabComponent) {
    const tabData = this._findTab('tabName', tab.name);
    this.activeType = tabData && tabData.lookupType;
    this.reloadCallback();
    this.filterRecords(this.filterControl.value);
  }

  setListComponent(type: AdminLookupTypeEnum, componentRef: DacOchaListComponent) {
    if (!type) {
      return;
    }
    this.listComponentMap.set(type, componentRef);
    if (type === AdminLookupTypeEnum.OCHA) {
      this.activeType = type;
    }
  }

  addCallback() {
    if (!this.activeType) {
      return;
    }
    this.listComponentMap.get(this.activeType) && this.listComponentMap.get(this.activeType)!.add$.next();
  }

  reloadCallback() {
    if (!this.activeType) {
      return;
    }
    this.listComponentMap.get(this.activeType) && this.listComponentMap.get(this.activeType)!.reload$.next(null);
  }

  filterRecords(searchText: string) {
    this.filterControl.setValue(searchText);
    this.listComponentMap.get(this.activeType) && this.listComponentMap.get(this.activeType)!.filterControl.setValue(searchText);
  }
}
