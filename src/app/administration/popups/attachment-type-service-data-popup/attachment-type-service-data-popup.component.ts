import {Component, Inject, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {AttachmentTypeServiceData} from '@app/models/attachment-type-service-data';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {of, Subject} from 'rxjs';
import {catchError, exhaustMap, takeUntil} from 'rxjs/operators';
import {ExceptionHandlerService} from '@app/services/exception-handler.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {ServiceDataService} from '@app/services/service-data.service';
import {ServiceData} from '@app/models/service-data';
import {CustomValidators} from '@app/validators/custom-validators';
import {LookupService} from '@app/services/lookup.service';
import {Lookup} from '@app/models/lookup';
import {ToastService} from '@app/services/toast.service';
import {AttachmentTypeServiceDataService} from '@app/services/attachment-type-service-data.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {CustomProperty} from '@app/models/custom-property';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {CustomPropertyTypes} from '@app/enums/custom-property-types';
import {CommonUtils} from '@helpers/common-utils';
import {UserTypes} from '@app/enums/user-types.enum';
import { CaseTypes } from '@app/enums/case-types.enum';

@Component({
  selector: 'attachment-type-service-data-popup',
  templateUrl: './attachment-type-service-data-popup.component.html',
  styleUrls: ['./attachment-type-service-data-popup.component.scss']
})
export class AttachmentTypeServiceDataPopupComponent implements OnInit {
  form!: UntypedFormGroup;
  model!: AttachmentTypeServiceData;
  operation!: OperationTypes;
  validateFieldsVisible = true;
  saveVisible = true;
  services: ServiceData[] = [];
  attachmentTypeUsersList: Lookup[];
  private save$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  existingList: AttachmentTypeServiceData[] = [];
  savedRequestTypesForService: number[] = [];
  customProperties$: Subject<CustomProperty[]> = new Subject<CustomProperty[]>();
  customProperties: CustomProperty[] = [];
  selectedService!: ServiceData;
  customPropertiesKeyValue: { [key: string]: number } = {};
  displayMulti: boolean = false;
  tablesIdentifiers: CustomProperty[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<AttachmentTypeServiceData>,
              public lang: LangService,
              private fb: UntypedFormBuilder,
              private exceptionHandlerService: ExceptionHandlerService,
              private serviceDataService: ServiceDataService,
              private lookupService: LookupService,
              private toast: ToastService,
              private attachmentTypeServiceDataService: AttachmentTypeServiceDataService,
              private dialogRef: DialogRef) {
    this.operation = data.operation;
    this.model = data.model;
    this.existingList = data.existingList;
    this.attachmentTypeUsersList = lookupService.listByCategory.UserType.filter(x => x.lookupKey !== UserTypes.INTEGRATION_USER && x.lookupKey !== UserTypes.ALL);
  }

  ngOnInit(): void {
    this.buildForm();
    this.listenToCustomPropertiesChange();
    this._saveModel();
    this.loadServices();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      serviceId: [this.model.serviceId, [CustomValidators.required]],
      userType: [this.model.userType, [CustomValidators.required]],
      isRequired: [this.model.isRequired],
      multi: [this.model.multi],
      identifier: [this.model.identifier],
      customProperties: this.fb.array([])
    });

    if (this.operation === OperationTypes.UPDATE) {
      this.displayFormValidity();
      this.serviceIdField.disable();
      this._setIdentifierValidations();
    }

    if (this.readonly) {
      this.form.disable();
    }
  }

  get serviceIdField(): UntypedFormControl {
    return this.form.get('serviceId') as UntypedFormControl;
  }

  get mandatoryField(): UntypedFormControl {
    return this.form.get('isRequired') as UntypedFormControl;
  }

  get identifierField(): UntypedFormControl {
    return this.form.get('identifier') as UntypedFormControl;
  }

  get customPropertiesArrayForm(): UntypedFormArray {
    return this.form.get('customProperties') as UntypedFormArray;
  }

  get multiField(): AbstractControl {
    return this.form.get('multi') as AbstractControl;
  }

  private loadServices(): void {
    this.serviceDataService.loadAsLookups()
      .pipe(takeUntil(this.destroy$))
      .subscribe((services) => {
        this.services = services;
        this.showCustomPropertyControls();
      });
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
  };

  get readonly(): boolean {
    return this.operation === OperationTypes.VIEW;
  }

  isExistingService(serviceId: number): boolean {
    return this.existingList.map(x => x.serviceId).includes(serviceId);
  }

  private _getSavedRequestTypesForService(): void {
    this.savedRequestTypesForService = [];
    const existingSameServiceRecords: AttachmentTypeServiceData[] = this.existingList.filter(x => x.serviceId === this.selectedService.id);
    existingSameServiceRecords.forEach((service) => {
      let requestType = service.parsedCustomProperties?.requestType ?? undefined;
      if (CommonUtils.isValidValue(requestType)) {
        this.savedRequestTypesForService.push(Number(requestType));
      }
    });
  }

  isRequestTypeUsed(customProperty: CustomProperty, requestType: number): boolean {
   
    if (customProperty.type === CustomPropertyTypes.TABLE || customProperty.name !== 'requestType') {
      return false;
    } else {
      // if operation is update/view, skip the currently selected request to check for disabled
      if (this.operation !== OperationTypes.CREATE) {
        const savedRequestType = this.model.parsedCustomProperties?.requestType;
        if (CommonUtils.isValidValue(savedRequestType)) {
          return this.savedRequestTypesForService.filter(x => x !== savedRequestType).includes(requestType);
        }
      }else if(this.selectedService.caseType === CaseTypes.PARTNER_APPROVAL){
        return false;
      }
      return this.savedRequestTypesForService.includes(requestType);
    }
  }

  handleServiceChange(userInteraction: boolean = false) {
    this.selectedService = this.services.find(s => s.id === this.serviceIdField?.value)!;
    if (this.selectedService?.caseType) {
      this.attachmentTypeServiceDataService.getCustomProperties(this.selectedService.caseType).pipe(
        takeUntil(this.destroy$)
      ).subscribe(customProperties => {
        if (userInteraction) {
          this.displayMulti = false;
          this.multiField.setValue(false);
          this.onMultiChange();
          this.customPropertiesKeyValue = {};
          this.savedRequestTypesForService = [];
        }
        this.customProperties$.next(customProperties);
      });
    }
  }

  listenToCustomPropertiesChange() {
    this.customProperties$.subscribe(properties => {
      this.customProperties = properties;
      this.customPropertiesArrayForm.clear();
      properties.forEach((property) => {
        if (property.type === CustomPropertyTypes.TABLE) {
          this.displayMulti = true;
          this.tablesIdentifiers = this.tablesIdentifiers.concat(property);
        } else {
          let controlValue = this.customPropertiesKeyValue[property.name] ? this.customPropertiesKeyValue[property.name] : null;
          this.customPropertiesArrayForm.push(new UntypedFormControl(controlValue));
        }
      });
      this._getSavedRequestTypesForService();
    });
  }

  getOptionName(option: any): string {
    return option[(this.lang.map.lang + 'Name')];
  }

  getCustomPropertyName(name: string): string {
    const local = 'cp_' + name.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    try {
      return this.lang.getLocalByKey(local as unknown as keyof ILanguageKeys).getName();
    } catch (e) {
      return local;
    }
  }

  onCustomPropertyChange(index: number) {
    const key = this.customProperties[index].name;
    const value = this.customPropertiesArrayForm.controls[index].value;

    if (value) {
      this.customPropertiesKeyValue[key] = value;
    } else {
      delete this.customPropertiesKeyValue[key];
    }
  }

  getCustomPropertiesAsString(customPropertiesJson: { [key: string]: number }): string {
    return JSON.stringify(customPropertiesJson);
  }

  getCustomPropertiesAsJson(customPropertiesString: string) {
    if (customPropertiesString) {
      return JSON.parse(customPropertiesString);
    }
    return {};
  }

  mapAttachmentTypeServiceDataToSend(attachmentTypeServiceData: AttachmentTypeServiceData, customPropertiesJson: { [key: string]: number }): AttachmentTypeServiceData {
    attachmentTypeServiceData.customProperties = this.getCustomPropertiesAsString(customPropertiesJson);
    return attachmentTypeServiceData;
  }

  showCustomPropertyControls() {
    this.handleServiceChange();
    this.customPropertiesKeyValue = this.getCustomPropertiesAsJson(this.model.customProperties);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  onMultiChange(): void {
    this.model.multi = this.multiField.value;
    this.identifierField.setValue(null);
    this._setIdentifierValidations();
  }

  displayFormValidity(form?: UntypedFormGroup | null, element?: HTMLElement | string): void {
    CommonUtils.displayFormValidity((form || this.form), element);
  }

  saveModel(): void {
    this.selectedService = this.services.find(s => s.id === this.serviceIdField?.value)!;
    this.save$.next();
  }

  _saveModel(): void {
    this.save$
      .pipe(takeUntil(this.destroy$),
        exhaustMap(() => {
          let attachmentTypeServiceData = (new AttachmentTypeServiceData()).clone({
            ...this.model, ...this.form.value,
            caseType: this.selectedService.caseType
          });
          attachmentTypeServiceData = this.mapAttachmentTypeServiceDataToSend(attachmentTypeServiceData, this.customPropertiesKeyValue);
          if(!attachmentTypeServiceData.id && this.existingList.some(item=>item.isEqual(attachmentTypeServiceData))){
            this.toast.alert(this.lang.map.msg_duplicated_item);
            return  of(null);
          }
          return attachmentTypeServiceData.save().pipe(
            catchError((err) => {
              return of(null);
            }));
        }))
      .subscribe((attachmentTypeServiceData: AttachmentTypeServiceData | null) => {
        if (!attachmentTypeServiceData) {
          return;
        }
        const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
        // @ts-ignore
        this.toast.success(message.change({x: this.selectedService.getName()}));
        this.model = attachmentTypeServiceData;
        this.operation = OperationTypes.UPDATE;
        this.dialogRef.close(this.model);
      });
  }

  private _setIdentifierValidations() {
    if (this.model.multi) {
      this.identifierField.addValidators(CustomValidators.required);
    } else {
      this.identifierField.removeValidators(CustomValidators.required);
    }
    this.identifierField.updateValueAndValidity();
  }

  getTranslatedMandatory(): string {
    return this.mandatoryField.value ? this.lang.map.lbl_yes : this.lang.map.lbl_no;
  }

  getTranslatedMulti(): string {
    return this.multiField.value ? this.lang.map.lbl_yes : this.lang.map.lbl_no;
  }
}
