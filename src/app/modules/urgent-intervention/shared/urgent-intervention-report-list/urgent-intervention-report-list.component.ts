import {Component, Input} from '@angular/core';
import {LangService} from '@services/lang.service';
import {UrgentInterventionReport} from '@app/models/urgent-intervention-report';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import {DateUtils} from '@helpers/date-utils';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {of, Subject} from 'rxjs';
import {catchError, exhaustMap, filter, switchMap, takeUntil} from 'rxjs/operators';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {UrgentInterventionReportService} from '@services/urgent-intervention-report.service';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {ToastService} from '@services/toast.service';

@Component({
  selector: 'urgent-intervention-report-list',
  templateUrl: './urgent-intervention-report-list.component.html',
  styleUrls: ['./urgent-intervention-report-list.component.scss']
})
export class UrgentInterventionReportListComponent extends AdminGenericComponent<UrgentInterventionReport, UrgentInterventionReportService> {

  constructor(public lang: LangService,
              private toast: ToastService,
              public service: UrgentInterventionReportService) {
    super();
  }

  list: UrgentInterventionReport[] = [];

  @Input() readonly: boolean = false;

  private _documentId: string = '';
  @Input()
  set documentId(value: string) {
    this._documentId = value;
    this.reload$.next(value);
  }

  get documentId(): string {
    return this._documentId;
  }

  _init() {
    this.listenToView();
  }

  view$: Subject<UrgentInterventionReport> = new Subject<UrgentInterventionReport>();

  displayedColumns = ['name', 'executionDate', 'status', 'actions'];
  sortingCallbacks = {
    name: (a: UrgentInterventionReport, b: UrgentInterventionReport, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    executionDate: (a: UrgentInterventionReport, b: UrgentInterventionReport, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.executionDate),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.executionDate);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    status: (a: UrgentInterventionReport, b: UrgentInterventionReport, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  };

  actions: IMenuItem<UrgentInterventionReport>[] = [
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: UrgentInterventionReport) => this.view$.next(item)
    },
    // attachments
    {
      type: 'action',
      label: 'attachments',
      icon: ActionIconsEnum.ATTACHMENT,
      onClick: (item: UrgentInterventionReport) => this.showAttachments(item)
    },
    // launch
    {
      type: 'action',
      label: 'launch',
      icon: ActionIconsEnum.LAUNCH,
      show: (item) => !this.readonly && !item.isLaunched(),
      onClick: (item: UrgentInterventionReport) => this.launchReport(item)
    },
  ];

  listenToReload() {
    this.reload$.pipe(
      takeUntil(this.destroy$),
      switchMap((val) => this.service.loadByDocumentId(this.documentId))
    ).subscribe((result: UrgentInterventionReport[]) => {
      this.list = result;
    });
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openViewDialog(model).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  showAttachments(item: UrgentInterventionReport): void {
    item.showAttachments(this.readonly)
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }

  launchReport(item: UrgentInterventionReport): void {
    item.launch()
      .subscribe((result) => {
        this.reload$.next(null);
        this.toast.success(this.lang.map.request_has_been_sent_successfully);
      });
  }

}
