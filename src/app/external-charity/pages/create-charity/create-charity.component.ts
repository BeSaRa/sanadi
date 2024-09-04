import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UpdateCharityStatusPopupComponent } from '@app/external-charity/popups/update-charity-status-popup/update-charity-status-popup.component';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { AdminLookup } from '@app/models/admin-lookup';
import { ExternalCharity } from '@app/models/external-charity';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { AdminLookupService } from '@app/services/admin-lookup.service';
import { DialogService } from '@app/services/dialog.service';
import { EmployeeService } from '@app/services/employee.service';
import { ExternalCharityService } from '@app/services/external-charity.service';
import { LangService } from '@app/services/lang.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { CustomValidators } from '@app/validators/custom-validators';
import { BehaviorSubject, catchError, exhaustMap, filter, of, Subject, switchMap, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'create-charity',
  templateUrl: 'create-charity.component.html',
  styleUrls: ['create-charity.component.scss']
})
export class CreateCharityComponent extends AdminGenericComponent<ExternalCharity, ExternalCharityService> {
  usePagination = true;

  lang = inject(LangService);
  service = inject(ExternalCharityService);
  fb = inject(FormBuilder);
  employeeService= inject(EmployeeService);
  dialog = inject(DialogService);
  adminLookupService = inject(AdminLookupService);
  externalCharityStatus$: BehaviorSubject<AdminLookup[]> = new BehaviorSubject<AdminLookup[]>([])


  constructor() {
    super();
  }

  protected _init(): void {
    this._loadExternalCharityStatuses();
    this.listenToView();
    this.buildFilterForm()
  }

  @ViewChild('table') table!: TableComponent;
  displayedColumns: (keyof ExternalCharity | 'actions')[] = ['requestFullSerial', 'suggestedCharityName', 'requestorName','requestStatus', 'actions'];
  searchColumns: string[] = ['search_requestFullSerial', 'search_suggestedCharityName', 'search_requestorName','search_status', '_'];
  searchColumnsConfig: SearchColumnConfigMap = {
    search_requestFullSerial: {
      key: 'requestFullSerial',
      controlType: 'text',
      property: 'requestFullSerial',
      label: 'serial_number',
      maxLength: CustomValidators.defaultLengths.ENGLISH_NAME_MAX
    },
    search_suggestedCharityName: {
      key: 'suggestedCharityName',
      controlType: 'text',
      property: 'suggestedCharityName',
      label: 'suggested_charity_name',
      maxLength: CustomValidators.defaultLengths.ENGLISH_NAME_MAX
    },
    search_requestorName: {
      key: 'requestorName',
      controlType: 'text',
      property: 'requestorName',
      label: 'lbl_requestor_name',
      maxLength: CustomValidators.defaultLengths.ENGLISH_NAME_MAX
    },
    search_status: {
      key: 'requestStatus',
      controlType: 'select',
      property: 'requestStatus',
      label: 'lbl_status',
      selectOptions: {
        options$:this.externalCharityStatus$,
        labelProperty: 'getName',
        optionValueKey: 'id'
      }
    }
  }

  view$: Subject<ExternalCharity> = new Subject<ExternalCharity>();
  actions: IMenuItem<ExternalCharity>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-pen',
      show:(item)=>!item.requestStatus && this.employeeService.isExternalUser(),
      onClick: (item: ExternalCharity) => this.edit$.next(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: 'mdi-eye',
      onClick: (item: ExternalCharity) => this.view$.next(item)
    },
    // update status
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.LAUNCH,
      show:(item)=>!item.requestStatus && this.employeeService.isInternalUser(),
      onClick: (item: ExternalCharity) => this._updateStatus(item)
    }
  ];

  sortingCallbacks = {

  }

  private _loadExternalCharityStatuses() {
    this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.EXTERNAL_CHARITY_REQUEST,true)
      .subscribe(list => {
        this.externalCharityStatus$.next(list)
      })
  }
  afterReload(): void {
    this.table && this.table.clearSelection();
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openViewDialog(model.id).pipe(catchError(_ => of(null)))
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }
  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      requestFullSerial: [''], suggestedCharityName: [''], requestorName: [''],requestStatus:[null]
    })
  }
  private _updateStatus(item: ExternalCharity) {
    this.dialog.show<IDialogData<AdminLookup[]>>(UpdateCharityStatusPopupComponent,
      {
        model: this.externalCharityStatus$.value,
        operation: OperationTypes.UPDATE
      }
    ).onAfterClose$
      .pipe(
        filter((info) => !!info),
        takeUntil(this.destroy$),
        switchMap((info: { comments: string, statusId: number }) => {
          const model = {
            requestId: item.id,
            statusId: info.statusId,
            comments: info.comments
          }
          return this.service.updateStatus(model).pipe(catchError(_ => of(null)))
        }),
        tap(() => {this.reload$.next(null)})
      )
      .subscribe()

  }
  getStatus(statusId: number) {
    return this.externalCharityStatus$.value.find(status => status.id === statusId)?.getName()??''
  }
}
