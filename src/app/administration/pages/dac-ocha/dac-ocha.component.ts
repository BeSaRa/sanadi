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
import {DacOchaTypeEnum} from '@app/enums/dac-ocha-type-enum';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';

@Component({
  selector: 'dac-ocha',
  templateUrl: './dac-ocha.component.html',
  styleUrls: ['./dac-ocha.component.scss']
})
export class DacOchaComponent extends AdminGenericComponent<DacOcha, DacOchaService> implements OnInit {
  selectDacOchaType$: BehaviorSubject<number> = new BehaviorSubject<number>(DacOchaTypeEnum.ocha);
  selectedDacOchaTypeId: number = 1;
  searchText = '';
  classifications!: Lookup[];
  tabsData: IKeyValue = {
    ocha: {name: 'OCHA'},
    dac: {name: 'DAC'}
  };
  actions: IMenuItem<DacOcha>[] = [
    {
      type: 'action',
      label: 'btn_reload',
      icon: 'mdi-reload',
      onClick: _ => this.reload$.next(null),
    },
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-pen',
      onClick: (user) => this.edit$.next(user)
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
        return this.service.openUpdateDacOchaDialog(model.id, this.selectedDacOchaTypeId).pipe(catchError(_ => of(null)))
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }

  edit(dacOcha: DacOcha, event: MouseEvent) {
    event.preventDefault();
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
      this.selectDacOchaType$.next(DacOchaTypeEnum.ocha);
    }

    if (tab.name.toLowerCase() === 'dac') {
      this.selectDacOchaType$.next(DacOchaTypeEnum.dac);
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
    this.classifications = this.lookupService.listByCategory.ServiceWorkField;
  }

  get dacTabLabel(): string {
    return this.classifications.find(classification => classification.lookupKey === 2)!.getName();
  }

  get ochaTabLabel(): string {
    return this.classifications.find(classification => classification.lookupKey === 1)!.getName();
  }
}
