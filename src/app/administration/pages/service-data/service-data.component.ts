import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {ServiceDataService} from '../../../services/service-data.service';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {ToastService} from '../../../services/toast.service';
import {switchMap, takeUntil, tap} from 'rxjs/operators';
import {ServiceData} from '../../../models/service-data';
import {SortEvent} from '../../../interfaces/sort-event';
import {isValidValue} from '../../../helpers/utils';
import {CommonUtils} from '../../../helpers/common-utils';
import {ITableOptions} from '../../../interfaces/i-table-options';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {TableComponent} from '../../../shared/components/table/table.component';
import {FilterEventTypes} from '@app/types/types';
import {CommonStatusEnum} from '@app/enums/common-status.enum';

@Component({
  selector: 'service-data',
  templateUrl: './service-data.component.html',
  styleUrls: ['./service-data.component.scss']
})
export class ServiceDataComponent implements OnInit, OnDestroy, AfterViewInit {
  reloadServiceData$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private destroy$: Subject<any> = new Subject<any>();
  data: ServiceData[] = [];
  add$ = new Subject<any>();
  addSubscription!: Subscription;
  commonStatus = CommonStatusEnum;
  @ViewChild('table') table!: TableComponent;

  constructor(public langService: LangService, private service: ServiceDataService, private toast: ToastService) {
  }

  tableOptions: ITableOptions = {
    ready: false,
    searchCallback: (record: any, searchText: string) => {
      if (!record) {
        return false;
      }
      return record.search(searchText);
    },
    filterCallback: (type: FilterEventTypes = 'OPEN') => {
    },
    columns: ['bawServiceCode', 'arName', 'enName', 'updatedOn', 'updatedBy', 'status', 'actions'],
    searchText: '',
    sortingCallbacks: {
      updatedBy: (a: ServiceData, b: ServiceData, dir: SortEvent): number => {
        let value1 = !isValidValue(a) ? '' : a.updatedByInfo.getName().toLowerCase(),
          value2 = !isValidValue(b) ? '' : b.updatedByInfo.getName().toLowerCase();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      },
      updatedOn: (a: ServiceData, b: ServiceData, dir: SortEvent): number => {
        // @ts-ignore
        let value1 = !isValidValue(a) ? '' : new Date(a.updatedOn).valueOf(),
          // @ts-ignore
          value2 = !isValidValue(b) ? '' : new Date(b.updatedOn).valueOf();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      },
      status: (a: ServiceData, b: ServiceData, dir: SortEvent): number => {
        let value1 = !isValidValue(a) ? '' : a.statusInfo.getName().toLowerCase(),
          value2 = !isValidValue(b) ? '' : b.statusInfo.getName().toLowerCase();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      }
    },
    isSelectedRecords: () => {
      if (!this.tableOptions || !this.tableOptions.ready || !this.table) {
        return false;
      }
      return this.table.selection.selected.length !== 0;
    }
  };

  ngOnInit(): void {
    this.listenToReload();
    this.listenToAdd();
  }

  ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this.tableOptions.ready = true;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  listenToReload(): void {
    this.reloadServiceData$
      .pipe(
        switchMap(_ => this.service.loadComposite()),
        takeUntil(this.destroy$)
      )
      .subscribe((data) => {
        this.data = data;
      });
  }

  add(): void {
    const sub = this.service.openCreateDialog()
      .onAfterClose$.subscribe(() => {
        this.reloadServiceData$.next(null);
        sub.unsubscribe();
      });
  }

  private listenToAdd() {
    this.addSubscription = this.add$.pipe(tap(() => {
      this.add();
    })).subscribe();
  }

  edit(serviceData: ServiceData, $event: MouseEvent): void {
    $event.preventDefault();
    const sub = this.service.openUpdateDialog(serviceData.id)
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe((_) => {
          this.reloadServiceData$.next(null);
          sub.unsubscribe();
        });
      });
  }

  toggleStatus(serviceData: ServiceData) {
    this.service.updateStatus(serviceData.id, serviceData.status)
      .subscribe(() => {
        this.toast.success(this.langService.map.msg_status_x_updated_success.change({x: serviceData.getName()}));
        this.reloadServiceData$.next(null);
      }, () => {
        this.toast.error(this.langService.map.msg_status_x_updated_fail.change({x: serviceData.getName()}));
        this.reloadServiceData$.next(null);
      });
  }
}
