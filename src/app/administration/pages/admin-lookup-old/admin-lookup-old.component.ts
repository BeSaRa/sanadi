import { Component } from '@angular/core';
import { LangService } from '@services/lang.service';
import { LookupService } from '@services/lookup.service';
import { TabMap } from '@app/types/types';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { ITabData } from '@contracts/i-tab-data';
import { TabComponent } from '@app/shared/components/tab/tab.component';
import { UntypedFormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import {CommonUtils} from '@helpers/common-utils';

@Component({
  selector: 'admin-lookup-old',
  templateUrl: './admin-lookup-old.component.html',
  styleUrls: ['./admin-lookup-old.component.scss']
})
export class AdminLookupOldComponent {

  constructor(public lang: LangService,
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
    activityType: {
      name: 'activityType',
      index: 2,
      langKey: 'activity_type',
      lookupType: AdminLookupTypeEnum.ACTIVITY_TYPE,
      validStatus: () => true,
      isTouchedOrDirty: () => true,
    }
  };
  selectedWorkFieldTabIndex$: Subject<number> = new Subject<number>();

  adminLookupTypeEnum = AdminLookupTypeEnum;
  activeLookupType: AdminLookupTypeEnum = AdminLookupTypeEnum.WORK_FIELD;
  lookupComponentsMap: Map<AdminLookupTypeEnum, any> = new Map<AdminLookupTypeEnum, any>();

  getTabLabel(lookupType: AdminLookupTypeEnum): string {
    if (lookupType === AdminLookupTypeEnum.WORK_FIELD) {
      return this.lang.map.work_field;
    }
    return this.lookupService.listByCategory.AdminLookupType.find(lookup => lookup.lookupKey === lookupType)?.getName() || '';
  }

  tabChanged(tab: TabComponent) {
    const tabData = this._findTabByTabName(tab);
    this.activeLookupType = tabData && tabData.lookupType;
    // if workField tab is selected, select ocha by default
    if (this.activeLookupType === AdminLookupTypeEnum.WORK_FIELD) {
      this.activeLookupType = AdminLookupTypeEnum.OCHA;
      this.selectedWorkFieldTabIndex$.next(0);
    }
    else {
      this.reloadCallback();
      this.filterRecords(this.filterControl.value);
    }
  }

  setLookupComponentMap(type: AdminLookupTypeEnum, componentRef: any) {
    if (!CommonUtils.isValidValue(type)) {
      return;
    }
    this.lookupComponentsMap.set(type, componentRef);
    if (type === AdminLookupTypeEnum.WORK_FIELD) {
      this.activeLookupType = type;
    }
  }

  addCallback() {
    if (!this.activeLookupType) {
      return;
    }

    this.lookupComponentsMap.get(this.activeLookupType) && this.lookupComponentsMap.get(this.activeLookupType)!.add$.next();
  }

  reloadCallback() {
    if (!this.activeLookupType) {
      return;
    }
    this.lookupComponentsMap.get(this.activeLookupType) && this.lookupComponentsMap.get(this.activeLookupType)!.reload$.next(null);
  }

  filterRecords(searchText: string) {
    this.filterControl.setValue(searchText);
    this.lookupComponentsMap.get(this.activeLookupType) && this.lookupComponentsMap.get(this.activeLookupType)!.filterControl.setValue(searchText);
  }

  private _findTabByTabName(tab: TabComponent): ITabData | undefined {
    return Object.values(this.tabsData).find(tabData => tabData.name === tab.name);
  }
}
