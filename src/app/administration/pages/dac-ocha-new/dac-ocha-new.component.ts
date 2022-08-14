import {Component, ViewChild} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {AdminLookup} from '@app/models/admin-lookup';
import {DacOchaNewService} from '@services/dac-ocha-new.service';
import {LangService} from '@services/lang.service';
import {LookupService} from '@services/lookup.service';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {Lookup} from '@app/models/lookup';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {ITabData} from '@contracts/i-tab-data';
import {TabMap} from '@app/types/types';
import {DacOchaListComponent} from '@app/administration/pages/dac-ocha-list/dac-ocha-list.component';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'dac-ocha-new',
  templateUrl: './dac-ocha-new.component.html',
  styleUrls: ['./dac-ocha-new.component.scss']
})
export class DacOchaNewComponent extends AdminGenericComponent<AdminLookup, DacOchaNewService> {
  actions = [];
  displayedColumns = [];
  contentLoaded$: Subject<AdminLookupTypeEnum> = new Subject<AdminLookupTypeEnum>();

  constructor(public lang: LangService,
              public service: DacOchaNewService,
              public lookupService: LookupService) {
    super();
  }

  _init() {
    this.classifications = this.lookupService.listByCategory.AdminLookupType || [];
    this.listenToContentLoaded();
  }

  @ViewChild('dacListComponent') dacListComponentRef!: DacOchaListComponent;
  @ViewChild('ochaListComponent') ochaListComponentRef!: DacOchaListComponent;

  classifications!: Lookup[];
  adminLookupTypeEnum = AdminLookupTypeEnum;

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

  private _findTab(findBy: 'tabName', value: string): ITabData | undefined {
    return Object.values(this.tabsData).find(tab => {
      if (findBy === 'tabName') {
        return tab.name === value;
      }
      return undefined;
    });
  }

  private listenToContentLoaded(): void {
    this.contentLoaded$.pipe(takeUntil(this.destroy$))
      .subscribe((dacOchaType) => {
        if (!dacOchaType){
          return;
        }
        if (dacOchaType === AdminLookupTypeEnum.DAC) {
          this.dacListComponentRef.reload$.next(null);
        } else {
          this.ochaListComponentRef.reload$.next(null);
        }
      });
  }

  tabChanged(tab: TabComponent) {
    const tabData = this._findTab('tabName', tab.name);
    const type = tabData!.lookupType;

    if (type === AdminLookupTypeEnum.DAC) {
      this.dacListComponentRef && this.dacListComponentRef.reload$.next(null);
    } else {
      this.ochaListComponentRef && this.ochaListComponentRef.reload$.next(null);
    }
  }

  getTabLabel(lookupType: AdminLookupTypeEnum): string {
    return this.classifications.find(classification => classification.lookupKey === lookupType)?.getName() || '';
  }
}
