import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {FormManager} from '@app/models/form-manager';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {catchError, exhaustMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {AttachmentType} from '@app/models/attachment-type';
import {ExceptionHandlerService} from '@app/services/exception-handler.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {ServiceDataService} from '@app/services/service-data.service';
import {ServiceData} from '@app/models/service-data';
import {AttachmentTypeService} from '@app/services/attachment-type.service';
import {AttachmentTypeServiceData} from '@app/models/attachment-type-service-data';
import {AttachmentTypeServiceDataService} from '@app/services/attachment-type-service-data.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogService} from '@app/services/dialog.service';
import {EmployeeService} from '@app/services/employee.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';

@Component({
  selector: 'attachment-types-popup',
  templateUrl: './attachment-types-popup.component.html',
  styleUrls: ['./attachment-types-popup.component.scss']
})
export class AttachmentTypesPopupComponent implements OnInit, OnDestroy {
  form!: UntypedFormGroup;
  fm!: FormManager;
  operation!: OperationTypes;
  model!: AttachmentType;
  validateFieldsVisible = true;
  saveVisible = true;
  filterControl: UntypedFormControl = new UntypedFormControl('');
  private save$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  private makeAttachmentTypeGlobal$: Subject<number> = new Subject<number>();
  tabsData: IKeyValue = {
    basic: {name: 'basic'},
    services: {name: 'services'}
  };
  services: ServiceData[] = [];

  serviceDataList: AttachmentTypeServiceData[] = [];

  serviceDataColumns: string[] = ['arName', 'enName', 'userType', 'isActive', 'requestType', 'actions'];

  validToAddServices = false;
  actionIconsEnum = ActionIconsEnum;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<AttachmentType>,
              public lang: LangService,
              public employeeService: EmployeeService,
              private fb: UntypedFormBuilder,
              private exceptionHandlerService: ExceptionHandlerService,
              private toast: ToastService,
              private dialogRef: DialogRef,
              private servicesService: ServiceDataService,
              private attachmentTypeService: AttachmentTypeService,
              private attachmentTypeServiceDataService: AttachmentTypeServiceDataService,
              private dialogService: DialogService) {
    this.operation = data.operation;
    this.model = data.model;
  }

  ngOnInit(): void {
    this.listenToIsGlobalChange();
    this.buildForm();
    this._saveModel();
    if (this.model.id) {
      this.loadServiceData();
      this.validToAddServices = !this.model.global;
    }
  }

  serviceDataActions: IMenuItem<AttachmentTypeServiceData>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      show: (item) => !this.readonly,
      onClick: (item) => this.editServiceData(item)
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      show: (item) => !this.readonly,
      onClick: (item) => this.deleteServiceData(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      show: (item) => this.readonly,
      onClick: (item) => this.viewServiceData(item)
    },
  ];

  sortingCallbacks = {
    userType: (a: AttachmentTypeServiceData, b: AttachmentTypeServiceData, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.userTypeInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.userTypeInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  }

  get readonly(): boolean {
    return this.operation === OperationTypes.VIEW;
  }

  private buildForm(): void {
    this.form = this.fb.group({
      arName: [this.model.arName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')
      ]],
      enName: [this.model.enName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')
      ]],
      arDesc: [this.model.arDesc, CustomValidators.required],
      global: [this.model.global]
    });
    this.fm = new FormManager(this.form, this.lang);

    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
    if (this.readonly) {
      this.form.disable();
    }
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.lbl_add_attachment_type;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_attachment_type;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  }

  saveModel(): void {
    this.save$.next();
  }

  _saveModel(): void {
    let attachmentTypeHasChangedToGlobal = false;
    this.save$
      .pipe(takeUntil(this.destroy$),
        exhaustMap(() => {
          attachmentTypeHasChangedToGlobal = !this.model.global && this.fm.getFormField('global')?.value;

          const attachmentType = (new AttachmentType()).clone({...this.model, ...this.fm.getForm()?.value});
          return attachmentType.save().pipe(
            catchError((err) => {
              this.exceptionHandlerService.handle(err);
              return of(null);
            }));
        }))
      .subscribe((attachmentType: AttachmentType | null) => {
        if (!attachmentType) {
          return;
        }
        this.validToAddServices = !attachmentType.global;
        const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
        // @ts-ignore
        this.toast.success(message.change({x: attachmentType.getName()}));
        this.model = attachmentType;
        const operationBeforeSave = this.operation;
        this.operation = OperationTypes.UPDATE;

        if (operationBeforeSave == OperationTypes.UPDATE) {
          this.dialogRef.close(this.model);
        }
        if (attachmentTypeHasChangedToGlobal && this.serviceDataList.length > 0) {
          this.makeAttachmentTypeGlobal$.next(attachmentType.id);
        }
      });
  }

  private loadServiceData(): void {
    this.attachmentTypeServiceDataService.loadServicesByAttachmentTypeId(this.model.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(services => {
        this.serviceDataList = services;
      });
  }

  reload() {
    this.loadServiceData();
  }

  addServiceData(): void {
    const sub = this.attachmentTypeServiceDataService.openCreateServiceDialog(this.model.id, this.serviceDataList).onAfterClose$.subscribe(() => {
      this.reload();
      sub.unsubscribe();
    });
  }

  editServiceData(attachmentTypeServiceData: AttachmentTypeServiceData, $event?: MouseEvent): void {
    $event?.preventDefault();
    const sub = this.attachmentTypeServiceDataService.openUpdateServiceDialog(attachmentTypeServiceData.id, this.serviceDataList).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        this.reload();
        sub.unsubscribe();
      });
    });
  }

  viewServiceData(attachmentTypeServiceData: AttachmentTypeServiceData, $event?: MouseEvent): void {
    $event?.preventDefault();
    const sub = this.attachmentTypeServiceDataService.openViewServiceDialog(attachmentTypeServiceData.id, this.serviceDataList).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        // this.reload();
        sub.unsubscribe();
      });
    });
  }

  deleteServiceData(model: AttachmentTypeServiceData, event?: MouseEvent): void {
    event?.preventDefault();
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.serviceInfo.getName()});
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
          // @ts-ignore
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.serviceInfo.getName()}));
          this.reload();
          sub.unsubscribe();
        });
      }
    });
  }

  listenToIsGlobalChange() {
    this.makeAttachmentTypeGlobal$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((attachmentTypeId) => {
      this.attachmentTypeServiceDataService.makeGlobal(attachmentTypeId)
        .pipe(catchError((err) => {
          this.exceptionHandlerService.handle(err);
          return of(false);
        }))
        .subscribe((success: boolean) => {
          if (success) {
            this.serviceDataList = [];
          }
        });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  setDialogButtonsVisibility(tab: any): void {
    this.saveVisible = (tab.name && tab.name === this.tabsData.basic.name);
    this.validateFieldsVisible = (tab.name && tab.name === this.tabsData.basic.name);
  }
}
