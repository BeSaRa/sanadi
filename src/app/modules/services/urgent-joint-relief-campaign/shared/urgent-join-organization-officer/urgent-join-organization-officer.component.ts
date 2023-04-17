import { OnDestroy } from '@angular/core';
import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { OrganizationOfficer } from '@app/models/organization-officer';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { EmployeeService } from '@app/services/employee.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { ReadinessStatus } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, take, takeUntil, tap } from 'rxjs/operators';
import { UrgentJoinOrganizationOfficerPopupComponent } from '../../popups/urgent-join-organization-officer-popup/urgent-join-organization-officer-popup.component';

@Component({
  selector: 'urgent-join-organization-officer',
  templateUrl: './urgent-join-organization-officer.component.html',
  styleUrls: ['./urgent-join-organization-officer.component.scss']
})
export class UrgentJoinOrganizationOfficerComponent implements OnInit, OnDestroy {
  form!: UntypedFormGroup;
  actions: IMenuItem<OrganizationOfficer>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: OrganizationOfficer) => this.edit(item),
      show: (_item: OrganizationOfficer) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: OrganizationOfficer) => this.delete(item),
      show: (_item: OrganizationOfficer) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: OrganizationOfficer) => this.view(item)
    }
  ];

  private _list: OrganizationOfficer[] = [];
  @Input() set list(list: OrganizationOfficer[]) {
    this._list = list.filter((orgOfficer) => !this.isExternalUser || orgOfficer.organizationId == this.employeeService?.getProfile()?.id)
    this.dataSource.next(this._list);
  }

  get list(): OrganizationOfficer[] {
    return this._list;
  }

  @Input() readonly: boolean = false;
  @Input() isExternalUser: boolean = false;
  @Output() readyEvent = new EventEmitter<ReadinessStatus>();

  dataSource: BehaviorSubject<OrganizationOfficer[]> = new BehaviorSubject<OrganizationOfficer[]>([]);
  columns: string[] = ['fullName', 'identificationNumber', 'email', 'phoneNumber', 'extraPhoneNumber', 'actions'];

  editItem?: OrganizationOfficer;
  viewOnly: boolean = false;
  filterControl: UntypedFormControl = new UntypedFormControl('');

  add$: Subject<any> = new Subject<any>();
  private save$: Subject<any> = new Subject<any>();

  private changed$: Subject<OrganizationOfficer | null> =
    new Subject<OrganizationOfficer | null>();
  private current?: OrganizationOfficer;
  private destroy$: Subject<any> = new Subject<any>();

  constructor(public lang: LangService,
    private toastService: ToastService,
    private employeeService: EmployeeService,
    private dialogService: DialogService,
    private fb: UntypedFormBuilder) {
  }


  ngOnInit(): void {
    this.dataSource.next(this.list);
    this.buildForm();
    this.listenToAdd();
    this.listenToChange();
    this.listenToSave();
    this._setComponentReadiness('READY');
  }
  private buildForm() {
    this.form = this.fb.group({
      identificationNumber: [null, [CustomValidators.required].concat(CustomValidators.commonValidations.qId)],
      officerFullName: [null, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
      email: [null, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]],
      officerPhone: [null, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)],
      officerExtraPhone: [null, CustomValidators.commonValidations.phone]
    });
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.viewOnly = false;
      this.changed$.next(new OrganizationOfficer());
    });
  }

  private listenToChange() {
    this.changed$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      this.current = record || undefined;
      this.updateForm(this.current);
    });
  }
  _getPopupComponent() {
    return UrgentJoinOrganizationOfficerPopupComponent;
  }
  openFormDialog() {
    this.dialogService.show(this._getPopupComponent(), {
      viewOnly: this.viewOnly,
      readonly: this.readonly,
      form: this.form,
      editItem: this.editItem,
      model: this.current
    }).onAfterClose$.subscribe((data) => {
      if (data) {
        this.save(data)
      } else {
        this.cancel()
      }
    })
  }
  private updateForm(record: OrganizationOfficer | undefined) {
    if (record) {
      if (this.viewOnly) {
        this._setComponentReadiness('READY');
      } else {
        this._setComponentReadiness('NOT_READY');
      }
      this.openFormDialog();
      if (this.readonly || this.viewOnly) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    } else {
      this._setComponentReadiness('READY');
    }
  }

  save(model: OrganizationOfficer) {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next(model);
  }
  private displayRequiredFieldsMessage(): void {
    this.dialogService
      .error(this.lang.map.msg_all_required_fields_are_filled)
      .onAfterClose$.pipe(take(1))
      .subscribe(() => {
        this.form.markAllAsTouched();
      });
  }

  mapOrganizationOfficerToForm(officer: OrganizationOfficer): any {
    return {
      identificationNumber: officer.identificationNumber,
      officerFullName: officer.fullName,
      email: officer.email,
      officerPhone: officer.phone,
      officerExtraPhone: officer.extraPhone
    };
  }
  mapFormToOrganizationOfficer(form: any): OrganizationOfficer {
    const officer: OrganizationOfficer = new OrganizationOfficer();
    officer.identificationNumber = form.identificationNumber;
    officer.fullName = form.officerFullName;
    officer.email = form.email;
    officer.phone = form.officerPhone;
    officer.extraPhone = form.officerExtraPhone;

    return officer;
  }
  private listenToSave() {
    this.save$
      .pipe(
        takeUntil(this.destroy$),
        tap((_) =>
          this.form.invalid ? this.displayRequiredFieldsMessage() : true
        ),
        filter(() => this.form.valid),
        map(() => {
          const officer = this.mapFormToOrganizationOfficer(this.form.getRawValue());
          officer.organizationId = this.employeeService.getProfile()?.id!;
          return officer;
        }),
        filter((officer) => {
          let isDuplicate = this.list.some((x) => x === officer);
          if (this.list.filter((orgOfficer) => orgOfficer.identificationNumber == officer.identificationNumber && officer.identificationNumber != this.editItem?.identificationNumber).length) {
            isDuplicate = true;
          }
          if (isDuplicate) {
            this.toastService.alert(this.lang.map.msg_duplicated_item);
            this.openFormDialog();
          }
          return !isDuplicate;
        })
      )
      .subscribe((record: OrganizationOfficer) => {
        if (!record) {
          return;
        }
        this._updateList(record, !!this.editItem ? 'UPDATE' : 'ADD');
        this.toastService.success(this.lang.map.msg_save_success);
        this.changed$.next(null);
        this.cancel();
      });
  }

  private _updateList(
    record: OrganizationOfficer | null,
    operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE',
  ) {
    if (record) {
      if (operation === 'ADD') {
        this.list.push(record);
      } else {
        let index = !this.editItem ? -1 : this.list.findIndex(x => x === this.editItem);
        if (operation === 'UPDATE') {
          this.list.splice(index, 1, record);
        } else if (operation === 'DELETE') {
          this.list.splice(index, 1);
        }
      }
    }
    this.list = this.list.slice();
  }
  edit(record: OrganizationOfficer, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }

    this.editItem = this.mapOrganizationOfficerToForm(record);
    this.viewOnly = false;
    this.changed$.next(this.editItem);
  }

  view(record: OrganizationOfficer, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = this.mapOrganizationOfficerToForm(record);
    this.viewOnly = true;
    this.changed$.next(this.editItem);
  }

  delete(record: OrganizationOfficer, $event?: MouseEvent): any {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.dialogService.confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$
      .pipe(take(1))
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this.editItem = record;
          this._updateList(record, 'DELETE');
          this.toastService.success(this.lang.map.msg_delete_success);
          this.cancel();
        }
      });
  }
  private _setComponentReadiness(readyStatus: ReadinessStatus) {
    this.readyEvent.emit(readyStatus);
  }

  cancel() {
    this.resetForm();
    this.editItem = undefined;
    this.viewOnly = false;
    this._setComponentReadiness('READY');
  }
  private resetForm() {
    this.form.reset();
    this.form.markAsUntouched();
    this.form.markAsPristine();
  }
  forceClearComponent() {
    this.cancel();
    this.list = [];
    this._updateList(null, 'NONE');
    this._setComponentReadiness('READY');
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
