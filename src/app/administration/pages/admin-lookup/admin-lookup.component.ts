import {Component} from '@angular/core';
import {LangService} from '@services/lang.service';
import {DacOchaNewService} from '@services/dac-ocha-new.service';
import {LookupService} from '@services/lookup.service';
import {TabMap} from '@app/types/types';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {ITabData} from '@contracts/i-tab-data';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {UntypedFormControl} from '@angular/forms';
import {Subject} from 'rxjs';

@Component({
  selector: 'admin-lookup',
  templateUrl: './admin-lookup.component.html',
  styleUrls: ['./admin-lookup.component.scss']
})
export class AdminLookupComponent {

  constructor(public lang: LangService,
              public service: DacOchaNewService,
              public lookupService: LookupService) {
  }

  filterControl: UntypedFormControl = new UntypedFormControl('');

  tabsData: TabMap = {
    workField: {
      name: 'workField',
      index: -1,
      langKey: 'work_field',
      lookupType: AdminLookupTypeEnum.WORK_FIELD,
      validStatus: () => true,
      isTouchedOrDirty: () => true,
    },
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
    },
    /*activityType: {
      name: 'activityType',
      index: 2,
      langKey: 'activity_type',
      lookupType: AdminLookupTypeEnum.ACTIVITY_TYPE,
      validStatus: () => true,
      isTouchedOrDirty: () => true,
    }*/
  };
  selectedWorkFieldTabIndex$: Subject<number> = new Subject<number>();

  adminLookupTypeEnum = AdminLookupTypeEnum;
  activeType: AdminLookupTypeEnum = AdminLookupTypeEnum.WORK_FIELD;
  listComponentMap: Map<AdminLookupTypeEnum, any> = new Map<AdminLookupTypeEnum, any>();

  getTabLabel(lookupType: AdminLookupTypeEnum): string {
    if (lookupType === AdminLookupTypeEnum.WORK_FIELD) {
      return this.lang.map.work_field;
    }
    return this.lookupService.listByCategory.AdminLookupType.find(lookup => lookup.lookupKey === lookupType)?.getName() || '';
  }

  tabChanged(tab: TabComponent) {
    const tabData = this._findTabByTabName(tab);
    this.activeType = tabData && tabData.lookupType;
    // if workField tab is selected, select ocha by default
    if (this.activeType === AdminLookupTypeEnum.WORK_FIELD) {
      this.activeType = AdminLookupTypeEnum.OCHA;
      this.selectedWorkFieldTabIndex$.next(0);
    } else {
      this.reloadCallback();
      this.filterRecords(this.filterControl.value);
    }
  }

  setListComponent(type: AdminLookupTypeEnum, componentRef: any) {
    if (!type) {
      return;
    }
    this.listComponentMap.set(type, componentRef);
    if (type === AdminLookupTypeEnum.WORK_FIELD) {
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

  private _findTabByTabName(tab: TabComponent): ITabData | undefined {
    return Object.values(this.tabsData).find(tabData => tabData.name === tab.name);
  }
}
