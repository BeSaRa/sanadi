import { CaseTypes } from '@app/enums/case-types.enum';
import { Component, ViewChild, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { CustomServiceTemplateComponent } from '@app/administration/shared/custom-service-template/custom-service-template.component';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { AttachmentType } from '@app/models/attachment-type';
import { InternalDepartment } from '@app/models/internal-department';
import { Lookup } from '@app/models/lookup';
import { ServiceData } from '@app/models/service-data';
import { ServiceDataStep } from '@app/models/service-data-step';
import { CustomServiceTemplate } from '@app/models/custom-service-template';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ChecklistService } from '@app/services/checklist.service';
import { DialogService } from '@app/services/dialog.service';
import { InternalDepartmentService } from '@app/services/internal-department.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ServiceDataStepService } from '@app/services/service-data-step.service';
import { ServiceDataService } from '@app/services/service-data.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { ReadinessStatus, TabMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { AttachmentTypeService } from '@services/attachment-type.service';
import { BehaviorSubject, iif, Observable, of, Subject } from 'rxjs';
import { catchError, exhaustMap, filter, mapTo, switchMap, takeUntil, tap } from 'rxjs/operators';
import { CustomServiceTemplateService } from '@app/services/custom-service-template.service';

@Component({
  selector: 'service-data-popup',
  templateUrl: './service-data-popup.component.html',
  styleUrls: ['./service-data-popup.component.scss']
})
export class ServiceDataPopupComponent extends AdminGenericDialog<ServiceData> {

  customServiceTemplateTabStatus: ReadinessStatus = 'READY';
  templatesList: CustomServiceTemplate[] = [];
  @ViewChild('customServiceTemplateTab') customServiceTemplateComponentRef!: CustomServiceTemplateComponent;
  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<ServiceData>,
    private lookupService: LookupService,
    public lang: LangService,
    public fb: UntypedFormBuilder,
    private toast: ToastService,
    public dialogRef: DialogRef,
    private attachmentTypeService: AttachmentTypeService,
    private serviceDataStepsService: ServiceDataStepService,
    private checklistService: ChecklistService,
    private serviceData: ServiceDataService,
    private customServiceTemplate: CustomServiceTemplateService,
    private dialog: DialogService,
    private internalDepartmentService: InternalDepartmentService,
  ) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.list = data.list;
  }

  form!: UntypedFormGroup;
  model!: ServiceData;
  operation: OperationTypes;
  reloadSteps$: BehaviorSubject<any> = new BehaviorSubject<any>('init');
  editStep$: Subject<ServiceDataStep> = new Subject<ServiceDataStep>();
  viewStep$: Subject<ServiceDataStep> = new Subject<ServiceDataStep>();
  list: ServiceData[] = [];
  stepsList: ServiceDataStep[] = [];
  stepsColumns = ['arName', 'enName', 'stepName', 'actions'];
  statusList: Lookup[] = [];
  showMaxTargetAmount = false;
  showMaxElementsCount = false;
  showActivateDevelopmentField = false;
  isTemplateTable = false;
  showAttachmentTypeField = false;
  attachmentTypesList: AttachmentType[] = [];
  departments: InternalDepartment[] = [];
  saveVisible = true;
  tabsData: TabMap = {
    basic: {
      name: 'basic',
      langKey: 'lbl_basic_info',
      index: 0,
      show: () => true,
      isTouchedOrDirty: () => true,
      validStatus: () => {
        if (!this.basicInfoGroup) {
          return false;
        }
        if (this.basicInfoGroup.disabled) {
          return true;
        }
        return this.basicInfoGroup.valid;
      }
    },
    steps: {
      name: 'steps',
      langKey: 'service_steps',
      index: 1,
      show: () => true,
      isTouchedOrDirty: () => true,
      validStatus: () => true
    },
    customSettings: {
      name: 'customSettings',
      langKey: 'custom_settings',
      index: 2,
      show: () => {
        return this.model.hasCustomSettings();
      },
      isTouchedOrDirty: () => true,
      validStatus: () => {
        if (!this.model.hasCustomSettings()) {
          return true;
        }
        if (!this.customSettingsGroup) {
          return false;
        }
        if (this.customSettingsGroup.disabled) {
          return true;
        }
        if (this.customServiceTemplateTabStatus === 'READY' &&
          this.customServiceTemplateComponentRef && this.customServiceTemplateComponentRef.list.length > 0) {
          return true;
        }
        return this.customSettingsGroup.valid;
      }
    },
    followup: {
      name: 'followup',
      langKey: 'followup_configuration',
      index: 3,
      show: () => true,
      isTouchedOrDirty: () => true,
      validStatus: () => true
    }
  };
  stepActions: IMenuItem<ServiceDataStep>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      show: () => this.operation !== OperationTypes.VIEW,
      onClick: (item: ServiceDataStep) => this.editStep$.next(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      show: () => this.operation === OperationTypes.VIEW,
      onClick: (item: ServiceDataStep) => this.viewStep$.next(item)
    },
    // check list
    {
      type: 'action',
      label: 'lbl_checklist',
      icon: ActionIconsEnum.CHECKLIST,
      onClick: (item: ServiceDataStep) => this.checklist(item)
    },
  ];

  setDialogButtonsVisibility(tab: any): void {
    this.saveVisible = this.operation !== OperationTypes.VIEW && (tab.name && (tab.name === this.tabsData.basic.name || tab.name === this.tabsData.customSettings.name));
    this.validateFieldsVisible = this.operation !== OperationTypes.VIEW && (tab.name && (tab.name === this.tabsData.basic.name || tab.name === this.tabsData.customSettings.name));
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.lbl_add_service;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_service;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  }

  get readonly(): boolean {
    return this.operation === OperationTypes.VIEW;
  }

  initPopup(): void {
    this.statusList = this.lookupService.listByCategory.CommonStatus;
    this.validateCustomSettingsFields();
    this.listenToReloadSteps();
    this.listenToEditStep();
    this.listenToViewStep();
    this.listenToFollowUpStatus();
    this.loadDepartments();
    if (this.model.caseType == CaseTypes.ORGANIZATION_ENTITIES_SUPPORT || this.model.caseType == CaseTypes.AWARENESS_ACTIVITY_SUGGESTION) {
      this.loadTemplates(this.model.caseType);
    }
  }

  loadDepartments() {
    this.internalDepartmentService.loadAsLookups()
      .pipe(takeUntil(this.destroy$))
      .subscribe(deps => this.departments = deps);

  }
  loadTemplates(caseType: number) {
    this.customServiceTemplate.loadTemplatesbyCaseType(caseType).subscribe((data: CustomServiceTemplate[]) => {
      this.templatesList = data;
    })
  }
  searchNgSelect(term: string, item: any): boolean {
    return item.ngSelectSearch(term);
  }

  buildForm(): void {
    this.form = this.fb.group({
      basic: this.fb.group({
        caseType: [this.model.caseType, [CustomValidators.required, CustomValidators.number]],
        bawServiceCode: [{ value: this.model.bawServiceCode, disabled: true }, [
          CustomValidators.required,
          CustomValidators.unique<ServiceData>(this.list, 'bawServiceCode', this.model)]],
        arName: [this.model.arName, [
          CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
          CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')
        ]],
        enName: [this.model.enName, [
          CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
          CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')
        ]],
        concernedDepartmentsIdsParsed: [{ value: this.model.concernedDepartmentsIdsParsed, disabled: true }, []],
        requestSerialCode: [this.model.requestSerialCode, [CustomValidators.required, CustomValidators.maxLength(20)]],
        licenseSerialCode: [this.model.licenseSerialCode, [CustomValidators.required, CustomValidators.maxLength(20)]],
        status: [this.model.status, [CustomValidators.required]],
        serviceTimeLimit: [this.model.serviceTimeLimit, [CustomValidators.number, CustomValidators.maxLength(10)]],
        sLA: [this.model.sLA, [CustomValidators.number, CustomValidators.maxLength(10)]],
        serviceReviewLimit: [this.model.serviceReviewLimit, [CustomValidators.number, CustomValidators.maxLength(10)]],
        licenseMinTime: [this.model.licenseMinTime, [CustomValidators.number, CustomValidators.maxLength(10)]],
        licenseMaxTime: [this.model.licenseMaxTime, [CustomValidators.number, CustomValidators.maxLength(10)]],
        serviceDescription: [this.model.serviceDescription, [CustomValidators.maxLength(1000)]],
        serviceRequirements: [this.model.serviceRequirements, [CustomValidators.maxLength(1000)]],
        serviceTerms: [this.model.serviceTerms, [CustomValidators.required, CustomValidators.maxLength(1000)]],
        fees: [this.model.fees, [CustomValidators.number, CustomValidators.maxLength(10)]],
        serviceStepsArabic: [this.model.serviceStepsArabic, [CustomValidators.maxLength(1000)]],
        serviceStepsEnglish: [this.model.serviceStepsEnglish, [CustomValidators.maxLength(1000)]],
        followUp: [this.model.followUp]
      }),
      customSettings: this.fb.group({
        maxTargetAmount: [this.model.maxTargetAmount, [CustomValidators.number]],
        maxElementsCount: [this.model.maxElementsCount, [CustomValidators.number]],
        activateDevelopmentField: [this.model.activateDevelopmentField],
        attachmentID: [this.model.attachmentID]
      })
    });

    if (this.readonly) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }

  beforeSave(model: ServiceData, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: ServiceData, form: UntypedFormGroup): Observable<ServiceData> | ServiceData {
    return new ServiceData().clone({
      ...this.model,
      ...this.form?.value.basic,
      concernedDepartmentsIdsParsed: model.concernedDepartmentsIdsParsed, // to stop override from UI, always save with original values
      ...this.form?.value.customSettings
    });
  }

  afterSave(model: ServiceData, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.toast.success(message.change({ x: model.getName() }));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }

  saveFail(error: Error): void {
  }

  destroyPopup(): void {
  }

  validateCustomSettingsFields() {
    if (this.model.isAwarenessActivitySuggesion() || this.model.isOrgEntitySupport()) {
      this.isTemplateTable = true;
    }

    if (this.model.isExternalProjectModels()) {
      this.showActivateDevelopmentField = true;
    }

    if (this.model.isUrgentInterventionLicensing()) {
      this.maxTargetAmount?.setValidators([CustomValidators.required, CustomValidators.number]);
      this.showMaxTargetAmount = true;
    }

    if (this.model.isCollectorLicensing()) {
      this.maxElementsCount?.setValidators([CustomValidators.required, CustomValidators.number]);
      this.showMaxElementsCount = true;
    }
    if (this.model.isCustomExemption()) {
      this.attachmentTypeField?.setValidators([CustomValidators.required]);
      this.showAttachmentTypeField = true;
      this.loadAttachmentTypes();
    }
  }

  get basicInfoGroup(): UntypedFormGroup {
    return this.form.get('basic') as UntypedFormGroup;
  }

  get customSettingsGroup(): UntypedFormGroup {
    return this.form.get('customSettings') as UntypedFormGroup;
  }

  get followUpStatus(): UntypedFormControl {
    return this.basicInfoGroup.get('followUp') as UntypedFormControl;
  }

  get concernedDepartmentsIds(): UntypedFormControl {
    return this.basicInfoGroup.get('concernedDepartmentsIds') as UntypedFormControl;
  }

  get maxTargetAmount() {
    return this.customSettingsGroup.get('maxTargetAmount');
  }

  get maxElementsCount() {
    return this.customSettingsGroup.get('maxElementsCount');
  }

  get attachmentTypeField() {
    return this.customSettingsGroup.get('attachmentID');
  }

  listenToReloadSteps(): void {
    this.reloadSteps$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        return this.serviceDataStepsService.stepsByServiceId(this.model.id);
      })
    ).subscribe((result: ServiceDataStep[]) => {
      this.stepsList = result;
    });
  }

  listenToEditStep(): void {
    this.editStep$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.serviceDataStepsService.openEditStepDialog(model).onAfterClose$.pipe(catchError(_ => of(null)));
      }))
      .subscribe(() => this.reloadSteps$.next(null));
  }

  listenToViewStep(): void {
    this.viewStep$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.serviceDataStepsService.openViewStepDialog(model).onAfterClose$.pipe(catchError(_ => of(null)));
      }))
      .subscribe(() => this.reloadSteps$.next(null));
  }

  checklist(serviceDataStep: ServiceDataStep): void {
    this.checklistService.openCheckListDialog(serviceDataStep, (this.operation === OperationTypes.VIEW))
      .pipe(takeUntil(this.destroy$))
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }

  private listenToFollowUpStatus() {
    this.followUpStatus
      .valueChanges
      .pipe(switchMap(value => iif(() => value, of(value), of(value)
        .pipe(switchMap(_ => this.dialog.confirm(this.lang.map.followup_change_status_confirm).onAfterClose$))
        .pipe(tap(val => val === UserClickOn.NO && this.followUpStatus.patchValue((this.model.followUp = true), { emitEvent: false })))
        .pipe(filter(val => val === UserClickOn.YES), mapTo(value))
      )))
      .pipe(switchMap((value) => {
        return this.serviceData.toggleFollowUpStatus(this.model.id, value).pipe(mapTo(value));
      }))
      .subscribe(res => {
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({ x: this.lang.map.followup }));
        this.model = this.model.clone({ followUp: res });
      });
  }

  private loadAttachmentTypes() {
    this.attachmentTypeService.loadByServiceId(this.model.caseType)
      .pipe(catchError(() => of([] as AttachmentType[])))
      .subscribe(result => {
        this.attachmentTypesList = result;
      });
  }

}
