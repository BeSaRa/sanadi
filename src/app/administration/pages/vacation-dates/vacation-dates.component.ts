import {Component} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {SearchColumnConfigMap} from '@app/interfaces/i-search-column-config';
import {VacationDates} from '@app/models/vacation-dates';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {DialogService} from '@app/services/dialog.service';
import {LangService} from '@app/services/lang.service';
import {ToastService} from '@app/services/toast.service';
import {VacationDatesService} from '@app/services/vacation-dates.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {CustomValidators} from '@app/validators/custom-validators';
import {of, Subject} from 'rxjs';
import {catchError, exhaustMap, filter, switchMap, takeUntil,} from 'rxjs/operators';

@Component({
  selector: 'vacation-dates',
  templateUrl: './vacation-dates.component.html',
  styleUrls: ['./vacation-dates.component.scss'],
})
export class VacationDatesComponent extends AdminGenericComponent<VacationDates, VacationDatesService> {
  usePagination = true;
  actions: IMenuItem<VacationDates>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: VacationDates) => this.edit$.next(item)
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      onClick: (item: VacationDates) => this.delete(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: VacationDates) => this.view$.next(item)
    },
     // logs
     {
      type: 'action',
      icon: ActionIconsEnum.HISTORY,
      label: 'show_logs',
      show: () => true,
      onClick: (item: VacationDates) => this.showAuditLogs(item)
    },
  ];
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'vacationDateFrom', 'vacationDateTo', 'actions'];
  searchColumns: string[] = ['_', 'search_arName', 'search_enName', 'search_vacationDateFrom', 'search_vacationDateTo', 'search_actions'];
  searchColumnsConfig: SearchColumnConfigMap = {
    search_arName: {
      key: 'arName',
      controlType: 'text',
      property: 'arName',
      label: 'arabic_name',
      maxLength: CustomValidators.defaultLengths.ARABIC_NAME_MAX
    },
    search_enName: {
      key: 'enName',
      controlType: 'text',
      property: 'enName',
      label: 'english_name',
      maxLength: CustomValidators.defaultLengths.ENGLISH_NAME_MAX
    }
  }
  view$ = new Subject<VacationDates>();

  constructor(public service: VacationDatesService,
              public lang: LangService,
              private dialogService: DialogService,
              private toast: ToastService,
              private fb: FormBuilder) {
    super();
  }

  protected _init(): void {
    this.listenToView();
    this.buildFilterForm();
  }

  listenToEdit(): void {
    this.edit$
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap((model) => this.service.openEditDialog(model))
      )
      .pipe(
        filter((dialog): dialog is DialogRef => !!dialog),
        switchMap((dialog) => dialog.onAfterClose$)
      )
      .subscribe(() => this.reload$.next(null));
  }

  listenToView(): void {
    this.view$
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap((model) => {
          return this.service
            .openViewDialog(model)
            .pipe(catchError((_) => of(null)));
        })
      )
      .pipe(
        filter((dialog): dialog is DialogRef => !!dialog),
        switchMap((dialog) => dialog.onAfterClose$)
      )
      .subscribe(() => this.reload$.next(null));
  }

  delete(model: VacationDates, event?: MouseEvent): void {
    event?.preventDefault();
    const message = this.lang.map.msg_confirm_delete_x.change({
      x: model.getName(),
    });
    this.dialogService
      .confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = this.service
          .deleteByPeriodId(model.periodId)
          .subscribe(() => {
            // @ts-ignore
            this.toast.success(
              this.lang.map.msg_delete_x_success.change({
                x: model.getName(),
              })
            );
            this.reload$.next(null);
            sub.unsubscribe();
          });
      }
    });
  }

  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      arName: [''], enName: [''],
    })
  }
}
