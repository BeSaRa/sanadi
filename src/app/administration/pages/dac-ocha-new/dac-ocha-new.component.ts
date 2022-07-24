import {Component, OnInit} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {DacOcha} from '@app/models/dac-ocha';
import {AdminLookup} from '@app/models/admin-lookup';
import {DacOchaNewService} from '@services/dac-ocha-new.service';
import {AdminLookupService} from '@services/admin-lookup.service';
import {LangService} from '@services/lang.service';
import {DialogService} from '@services/dialog.service';
import {SharedService} from '@services/shared.service';
import {ToastService} from '@services/toast.service';
import {LookupService} from '@services/lookup.service';
import {BehaviorSubject, of} from 'rxjs';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {Lookup} from '@app/models/lookup';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {IGridAction} from '@contracts/i-grid-action';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {catchError, exhaustMap, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {ITabData} from '@contracts/i-tab-data';
import {TabMap} from '@app/types/types';
import {DateUtils} from '@helpers/date-utils';

@Component({
  selector: 'dac-ocha-new',
  templateUrl: './dac-ocha-new.component.html',
  styleUrls: ['./dac-ocha-new.component.scss']
})
export class DacOchaNewComponent extends AdminGenericComponent<AdminLookup, DacOchaNewService> implements OnInit {

  constructor(public lang: LangService,
              public service: DacOchaNewService,
              public adminLookupService: AdminLookupService,
              private dialogService: DialogService,
              private sharedService: SharedService,
              private toast: ToastService,
              public lookupService: LookupService) {
    super();
  }


  ngOnInit() {
    super.ngOnInit();
    this.listenToDacOchaTypeChange();
    this.classifications = this.lookupService.listByCategory.AdminLookupType || [];
  }

  selectDacOchaType$: BehaviorSubject<number> = new BehaviorSubject<number>(AdminLookupTypeEnum.OCHA);

  selectedPopupTabName: string = 'basic';
  classifications!: Lookup[];
  adminLookupTypeEnum = AdminLookupTypeEnum;
  commonStatusEnum = CommonStatusEnum;
  actionIconsEnum = ActionIconsEnum;
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
  displayedColumns: string[] = ['arName', 'enName', 'status', 'actions'];
  selectedRecords: DacOcha[] = [];
  actions: IMenuItem<AdminLookup>[] = [
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      show: (item) => false,
      onClick: (item) => this.delete(item)
    },
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item) => this.edit(item)
    },
    // sub dac ocha
    {
      type: 'action',
      label: (item) => {
        return this.lang.map.sub_dac_ochas.change({x: this.getTabLabel(this.selectDacOchaType$.value)});
      },
      icon: ActionIconsEnum.CHILD_ITEMS,
      onClick: (item) => this.showChildren(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      displayInGrid: false,
      onClick: (item: AdminLookup) => this.toggleStatus(item),
      show: (item) => {
        return item.status === CommonStatusEnum.DEACTIVATED;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_deactivate',
      displayInGrid: false,
      onClick: (item: AdminLookup) => this.toggleStatus(item),
      show: (item) => {
        return item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];
  bulkActionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      }
    },
    {
      icon: 'mdi-list-status',
      langKey: 'lbl_status',
      children: [
        {
          langKey: 'btn_activate',
          icon: '',
          callback: ($event: MouseEvent, data?: any) => this.changeStatusBulk($event, CommonStatusEnum.ACTIVATED),
          show: (items: AdminLookup[]) => {
            return true;
          }
        },
        {
          langKey: 'btn_deactivate',
          icon: '',
          callback: ($event: MouseEvent, data?: any) => this.changeStatusBulk($event, CommonStatusEnum.DEACTIVATED),
          show: (items: AdminLookup[]) => {
            return true;
          }
        }
      ],
    }
  ];

  sortingCallbacks = {
    statusInfo: (a: AdminLookup, b: AdminLookup, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    statusDateModified: (a: AdminLookup, b: AdminLookup, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.statusDateModified),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.statusDateModified);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
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

  tabChanged(tab: TabComponent) {
    const tabData = this._findTab('tabName', tab.name);
    this.selectDacOchaType$.next(tabData!.lookupType);
  }

  listenToDacOchaTypeChange() {
    this.selectDacOchaType$
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        this.reload$.next(null);
      });
  }

  getTabLabel(lookupType: AdminLookupTypeEnum): string {
    return this.classifications.find(classification => classification.lookupKey === lookupType)?.getName() || '';
  }

  listenToAdd(): void {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => this.service.openCreateDialog(this.selectDacOchaType$.value).onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  listenToEdit(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openUpdateDialog(model.id, this.selectedPopupTabName).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  edit(item: AdminLookup, event?: MouseEvent) {
    event?.preventDefault();
    this.selectedPopupTabName = 'basic';
    this.edit$.next(item);
  }

  showChildren(item: AdminLookup, $event?: Event): void {
    $event?.preventDefault();
    this.selectedPopupTabName = 'children';
    this.edit$.next(item);
  }

  changeStatusBulk($event: MouseEvent, newStatus: CommonStatusEnum): void {
    if (!this.selectedRecords || this.selectedRecords.length === 0) {
      return;
    }
    const sub = this.adminLookupService.updateStatusBulk(this.selectedRecords.map(item => item.id), this.selectDacOchaType$.value, newStatus)
      .subscribe((response) => {
        this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response, 'UPDATE')
          .subscribe(() => {
            this.reload$.next(null);
            sub.unsubscribe();
          });
      });
  }

  toggleStatus(model: AdminLookup) {
    let updateObservable = model.status == CommonStatusEnum.ACTIVATED ? model.updateStatus(CommonStatusEnum.DEACTIVATED) : model.updateStatus(CommonStatusEnum.ACTIVATED);
    updateObservable.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({x: model.getName()}));
        this.reload$.next(null);
      }, () => {
        this.toast.error(this.lang.map.msg_status_x_updated_fail.change({x: model.getName()}));
        this.reload$.next(null);
      });
  }

  delete(model: AdminLookup, event?: MouseEvent): void {
    event?.preventDefault();
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete(this.selectDacOchaType$.value).subscribe(() => {
          // @ts-ignore
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.getName()}));
          this.reload$.next(null);
          sub.unsubscribe();
        });
      }
    });
  }

  deleteBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.selectedRecords.length > 0) {
      const message = this.lang.map.msg_confirm_delete_selected;
      this.dialogService.confirm(message)
        .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const ids = this.selectedRecords.map((item) => {
            return item.id;
          });
          const sub = this.service.deleteBulk(ids).subscribe((response) => {
            this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response)
              .subscribe(() => {
                this.selectedRecords = [];
                this.reload$.next(null);
                sub.unsubscribe();
              });
          });
        }
      });
    }
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap(() => {
        return this.service.loadByType(this.selectDacOchaType$.value).pipe(
          map(list => {
            return list.filter(model => {
              return !model.parentId && model.status !== CommonStatusEnum.RETIRED;
            });
          })
        );
      }))
      .subscribe((list: AdminLookup[]) => {
        this.models = list;
      });
  }
}
