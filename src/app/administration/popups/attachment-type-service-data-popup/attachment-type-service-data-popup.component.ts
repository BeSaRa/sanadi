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
              private servicesService: ServiceDataService,
              private lookupService: LookupService,
              private toast: ToastService,
              private attachmentTypeServiceDataService: AttachmentTypeServiceDataService,
              private dialogRef: DialogRef) {
    this.operation = data.operation;
    this.model = data.model;
    this.existingList = data.existingList;
    this.attachmentTypeUsersList = lookupService.listByCategory.UserType;
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
    }

    if (this.readonly) {
      this.form.disable();
    }
  }

  get serviceIdField(): UntypedFormControl {
    return this.form.get('serviceId') as UntypedFormControl;
  }

  private loadServices(): void {
    this.servicesService.load()
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
          return attachmentTypeServiceData.save().pipe(
            catchError((err) => {
              // this.exceptionHandlerService.handle(err);
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

  onServiceChange() {
    this.selectedService = this.services.find(s => s.id === this.serviceIdField?.value)!;
    if (this.selectedService?.caseType) {
      this.attachmentTypeServiceDataService.getCustomProperties(this.selectedService.caseType).pipe(
        takeUntil(this.destroy$)
      ).subscribe(customProperties => {
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
    });
  }

  get customPropertiesArrayForm(): UntypedFormArray {
    return this.form.get('customProperties') as UntypedFormArray;
  }

  get multi(): AbstractControl {
    return this.form.get('multi') as AbstractControl;
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
    this.onServiceChange();
    this.customPropertiesKeyValue = this.getCustomPropertiesAsJson(this.model.customProperties);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  onMultiChange(): void {
    this.model.multi = this.multi.value;
  }

  displayFormValidity(form?: UntypedFormGroup | null, element?: HTMLElement | string): void {
    CommonUtils.displayFormValidity((form || this.form), element);
  }
}
