import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {iif, of, Subject} from 'rxjs';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {ServiceData} from '@app/models/service-data';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {LangService} from '@app/services/lang.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {catchError, exhaustMap, filter, mapTo, switchMap, takeUntil, tap} from 'rxjs/operators';
import {extender} from '@app/helpers/extender';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ExceptionHandlerService} from '@app/services/exception-handler.service';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {CommonUtils} from '@app/helpers/common-utils';
import {FormManager} from '@app/models/form-manager';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {ServiceDataStep} from '@app/models/service-data-step';
import {ServiceDataStepService} from '@app/services/service-data-step.service';
import {ChecklistService} from '@app/services/checklist.service';
import {ServiceDataService} from '@app/services/service-data.service';
import {DialogService} from '@app/services/dialog.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {AttachmentType} from '@app/models/attachment-type';
import {AttachmentTypeService} from '@services/attachment-type.service';

@Component({
  selector: 'service-data-popup',
  templateUrl: './service-data-popup.component.html',
  styleUrls: ['./service-data-popup.component.scss']
})
export class ServiceDataPopupComponent implements OnInit, OnDestroy {
  private save$: Subject<any> = new Subject<any>();
  edit$: Subject<ServiceDataStep> = new Subject<ServiceDataStep>();
  private destroy$: Subject<any> = new Subject<any>();
  form!: FormGroup;
  fm!: FormManager;
  model: ServiceData;
  operation: OperationTypes;
  tabsData: IKeyValue = {
    basic: {name: 'basic'},
    customSettings: {name: 'customSettings'},
    steps: {name: 'steps'},
    followup: {name: 'followup'}
  };
  list: ServiceData[] = [];
  stepsList: ServiceDataStep[] = [];
  stepsColumns = ['arName', 'enName', 'activityName', 'stepName'];
  statusList: Lookup[] = [];
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  showMaxTargetAmount = false;
  showMaxElementsCount = false;
  showActivateDevelopmentField = false;
  showAttachmentTypeField = false;
  attachmentTypesList: AttachmentType[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<ServiceData>,
              private lookupService: LookupService,
              public lang: LangService,
              private fb: FormBuilder,
              private toast: ToastService,
              private dialogRef: DialogRef,
              private attachmentTypeService: AttachmentTypeService,
              private exceptionHandlerService: ExceptionHandlerService,
              private serviceDataStepsService: ServiceDataStepService,
              private checklistService: ChecklistService,
              private serviceData: ServiceDataService,
              private dialog: DialogService) {
    this.model = data.model;
    this.operation = data.operation;
    this.list = data.list;
    this.statusList = lookupService.listByCategory.CommonStatus;
  }

  ngOnInit(): void {
    this.buildForm();
    this.validateCustomSettingsFields();
    this.listenToSave();
    this.listenToEdit();
    this.reloadSteps();
    this.listenToFollowUpStatus();
  }

  displayFormValidity(elmRefToScroll: HTMLElement) {
    CommonUtils.displayFormValidity(this.form, elmRefToScroll);
  }

  buildForm(): void {
    this.form = this.fb.group({
      basic: this.fb.group({
        caseType: [this.model.caseType, [CustomValidators.required, CustomValidators.number]],
        bawServiceCode: [{value: this.model.bawServiceCode, disabled: true}, [
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
    this.fm = new FormManager(this.form, this.lang);
  }

  saveModel(): void {
    this.save$.next();
  }

  listenToSave(): void {
    this.save$.pipe(
      takeUntil(this.destroy$),
      exhaustMap(() => {
        const serviceData = extender<ServiceData>(ServiceData, {...this.model, ...this.fm.getForm()?.value.basic, ...this.fm.getForm()?.value.customSettings});
        return serviceData.save().pipe(
          catchError((err) => {
            this.exceptionHandlerService.handle(err);
            return of(null);
          })
        );
      }),
    ).subscribe((_serviceData: ServiceData | null) => {
      if (!_serviceData) {
        return;
      }
      const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
      this.toast.success(message.change({x: _serviceData.getName()}));
      this.model = _serviceData;
      this.operation = OperationTypes.UPDATE;
      this.dialogRef.close(this.model);
    });
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.lang.map.lbl_add_service : this.lang.map.lbl_edit_service;
  }

  validateCustomSettingsFields() {
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

  get followUpStatus(): FormControl {
    return this.form.get('basic.followUp') as FormControl;
  }

  get maxTargetAmount() {
    return this.form.get('customSettings.maxTargetAmount');
  }

  get maxElementsCount() {
    return this.form.get('customSettings.maxElementsCount');
  }

  get attachmentTypeField() {
    return this.form.get('customSettings.attachmentID');
  }

  private loadSteps(): void {
    this.serviceDataStepsService.stepsByServiceId(this.model.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(steps => {
        this.stepsList = steps;
      });
  }

  reloadSteps() {
    this.loadSteps();
  }

  editStep(serviceDataStep: ServiceDataStep, event: MouseEvent): void {
    event.preventDefault();
    this.edit$.next(serviceDataStep);
  }

  listenToEdit(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.serviceDataStepsService.openEditStepDialog(model).onAfterClose$.pipe(catchError(_ => of(null)));
      }))
      .subscribe(() => this.reloadSteps());
  }

  checklist(serviceDataStep: ServiceDataStep, $event: MouseEvent): void {
    $event.preventDefault();
    this.checklistService.openListDialog(serviceDataStep)
      .pipe(takeUntil(this.destroy$))
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe((_) => {
          // sub.unsubscribe();
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private listenToFollowUpStatus() {
    this.followUpStatus
      .valueChanges
      .pipe(switchMap(value => iif(() => value, of(value), of(value)
        .pipe(switchMap(_ => this.dialog.confirm(this.lang.map.followup_change_status_confirm).onAfterClose$))
        .pipe(tap(val => val === UserClickOn.NO && this.followUpStatus.patchValue((this.model.followUp = true), {emitEvent: false})))
        .pipe(filter(val => val === UserClickOn.YES), mapTo(value))
      )))
      .pipe(switchMap((value) => {
        return this.serviceData.toggleFollowUpStatus(this.model.id, value).pipe(mapTo(value));
      }))
      .subscribe(res => {
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({x: this.lang.map.followup}));
        this.model = this.model.clone({followUp: res});
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
