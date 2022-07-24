import {Component, OnInit} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {DacOcha} from '@app/models/dac-ocha';
import {DacOchaService} from '@app/services/dac-ocha.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {SharedService} from '@app/services/shared.service';
import {ToastService} from '@app/services/toast.service';
import {cloneDeep as _deepClone} from 'lodash';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {catchError, exhaustMap, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {BehaviorSubject, of} from 'rxjs';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';

@Component({
  selector: 'dac-ocha',
  templateUrl: './dac-ocha.component.html',
  styleUrls: ['./dac-ocha.component.scss']
})
export class DacOchaComponent extends AdminGenericComponent<DacOcha, DacOchaService> implements OnInit {
  selectDacOchaType$: BehaviorSubject<number> = new BehaviorSubject<number>(AdminLookupTypeEnum.OCHA);
  selectedDacOchaTypeId: number = AdminLookupTypeEnum.OCHA;
  selectedPopupTabName: string = 'basic';
  searchText = '';
  classifications!: Lookup[];
  commonStatusEnum = CommonStatusEnum;
  actionIconsEnum = ActionIconsEnum;
  tabsData: IKeyValue = {
    ocha: {name: 'OCHA'},
    dac: {name: 'DAC'}
  };
  actions: IMenuItem<DacOcha>[] = [
    // reload
    {
      type: 'action',
      label: 'btn_reload',
      icon: ActionIconsEnum.RELOAD,
      onClick: _ => this.reload$.next(null),
    },
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (user) => this.edit$.next(user)
    },
    // sub dac ocha
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.CHILD_ITEMS,
      onClick: (user) => this.edit$.next(user)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      onClick: (item: DacOcha) => this.toggleStatus(item),
      show: (item) => {
        return item.status === CommonStatusEnum.DEACTIVATED;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_deactivate',
      onClick: (item: DacOcha) => this.toggleStatus(item),
      show: (item) => {
        return item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];
  displayedColumns: string[] = ['arName', 'enName', 'status', 'actions'];
  selectedRecords: DacOcha[] = [];
  actionsList: IGridAction[] = [
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
          show: (items: DacOcha[]) => {
            return true;
          }
        },
        {
          langKey: 'btn_deactivate',
          icon: '',
          callback: ($event: MouseEvent, data?: any) => this.changeStatusBulk($event, CommonStatusEnum.DEACTIVATED),
          show: (items: DacOcha[]) => {
            return true;
          }
        }
      ],
    }
  ];

  sortingCallbacks = {
    statusInfo: (a: DacOcha, b: DacOcha, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  constructor(public lang: LangService,
              public service: DacOchaService,
              private dialogService: DialogService,
              private sharedService: SharedService,
              private toast: ToastService,
              public lookupService: LookupService) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    this.listenToDacOchaTypeChange();
    this.getClassificationsLookup();
  }

  listenToAdd(): void {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => this.service.openCreateDacOchaDialog(this.selectedDacOchaTypeId).onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }

  listenToEdit(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openUpdateDacOchaDialog(model.id, this.selectedDacOchaTypeId, this.selectedPopupTabName).pipe(catchError(_ => of(null)))
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }

  edit(dacOcha: DacOcha, event: MouseEvent) {
    event.preventDefault();
    this.selectedPopupTabName = 'basic';
    this.edit$.next(dacOcha);
  }

  showChildren(dacOcha: DacOcha, $event: Event): void {
    $event?.preventDefault();
    this.selectedPopupTabName = 'subDacOchas';
    this.edit$.next(dacOcha);
  }


  delete(event: MouseEvent, model: DacOcha): void {
    event.preventDefault();
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
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
        const load = this.useCompositeToLoad ? this.service.loadComposite() : this.service.load();
        return load.pipe(
          map(list => {
            return list.filter(model => {
              return model.status !== CommonStatusEnum.RETIRED;
            });
          }),
          map(list => {
            return list.filter(model => {
              return model.type === this.selectedDacOchaTypeId;
            });
          }),
          catchError(_ => of([]))
        );
      }))
      .subscribe((list: DacOcha[]) => {
        this.models = list;
      })
  }

  listenToDacOchaTypeChange() {
    this.selectDacOchaType$
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        this.selectedDacOchaTypeId = type;
        this.reload$.next(null);
      })
  }

  tabChanged(tab: TabComponent) {
    if (tab.name.toLowerCase() === 'ocha') {
      this.selectDacOchaType$.next(AdminLookupTypeEnum.OCHA);
    }

    if (tab.name.toLowerCase() === 'dac') {
      this.selectDacOchaType$.next(AdminLookupTypeEnum.DAC);
    }
  }

  filterCallback = (record: any, searchText: string) => {
    return record.search(searchText);
  }

  private _addSelected(record: DacOcha): void {
    this.selectedRecords.push(_deepClone(record));
  }

  private _removeSelected(record: DacOcha): void {
    const index = this.selectedRecords.findIndex((item) => {
      return item.id === record.id;
    });
    this.selectedRecords.splice(index, 1);
  }

  get isIndeterminateSelection(): boolean {
    return this.selectedRecords.length > 0 && this.selectedRecords.length < this.models.length;
  }

  get isFullSelection(): boolean {
    return this.selectedRecords.length > 0 && this.selectedRecords.length === this.models.length;
  }

  isSelected(record: DacOcha): boolean {
    return !!this.selectedRecords.find((item) => {
      return item.id === record.id;
    });
  }

  onSelect($event: Event, record: DacOcha): void {
    const checkBox = $event.target as HTMLInputElement;
    if (checkBox.checked) {
      this._addSelected(record);
    } else {
      this._removeSelected(record);
    }
  }

  onSelectAll(): void {
    if (this.selectedRecords.length === this.models.length) {
      this.selectedRecords = [];
    } else {
      this.selectedRecords = _deepClone(this.models);
    }
  }

  getClassificationsLookup() {
    this.classifications = this.lookupService.listByCategory.AdminLookupType || [];
  }

  get dacTabLabel(): string {
    return this.classifications.find(classification => classification.lookupKey === 2)?.getName() || '';
  }

  get ochaTabLabel(): string {
    return this.classifications.find(classification => classification.lookupKey === 1)?.getName() || '';
  }

  get tabLabel(): string {
    return this.selectedDacOchaTypeId === AdminLookupTypeEnum.OCHA ? this.ochaTabLabel : this.dacTabLabel;
  }

  changeStatusBulk($event: MouseEvent, newStatus: CommonStatusEnum): void {
    const sub = this.service.updateStatusBulk(this.selectedRecords.map(item => item.id), newStatus)
      .subscribe((response) => {
        this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response, 'UPDATE')
          .subscribe(() => {
            this.reload$.next(null);
            sub.unsubscribe();
          });
      });
  }

  toggleStatus(model: DacOcha) {
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
}
