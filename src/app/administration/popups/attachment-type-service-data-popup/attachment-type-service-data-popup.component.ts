import {Component, Inject, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {OperationTypes} from '../../../enums/operation-types.enum';
import {AttachmentTypeServiceData} from '../../../models/attachment-type-service-data';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {of, Subject} from 'rxjs';
import {catchError, exhaustMap, takeUntil} from 'rxjs/operators';
import {ExceptionHandlerService} from '../../../services/exception-handler.service';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {IDialogData} from '../../../interfaces/i-dialog-data';
import {ServiceDataService} from '../../../services/service-data.service';
import {ServiceData} from '../../../models/service-data';
import {CustomValidators} from '../../../validators/custom-validators';
import {LookupCategories} from '../../../enums/lookup-categories';
import {LookupService} from '../../../services/lookup.service';
import {Lookup} from '../../../models/lookup';
import {ToastService} from '../../../services/toast.service';
import {AttachmentTypeServiceDataService} from '../../../services/attachment-type-service-data.service';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {CustomProperty} from '../../../models/custom-property';

@Component({
  selector: 'attachment-type-service-data-popup',
  templateUrl: './attachment-type-service-data-popup.component.html',
  styleUrls: ['./attachment-type-service-data-popup.component.scss']
})
export class AttachmentTypeServiceDataPopupComponent implements OnInit {
  form!: FormGroup;
  fm!: FormManager;
  model!: AttachmentTypeServiceData;
  operation!: OperationTypes;
  validateFieldsVisible = true;
  saveVisible = true;
  services: ServiceData[] = [];
  attachmentTypeUsersList: Lookup[];
  private save$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  attachmentTypeId!: number;
  customProperties$: Subject<any> = new Subject<any>();
  customProperties: CustomProperty[] = [];
  selectedService!: ServiceData;
  customPropertiesKeyValue: {[key: string]: number} = {};

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<AttachmentTypeServiceData>,
              public lang: LangService,
              private fb: FormBuilder,
              private exceptionHandlerService: ExceptionHandlerService,
              private servicesService: ServiceDataService,
              private lookupService: LookupService,
              private toast: ToastService,
              private attachmentTypeServiceDataService: AttachmentTypeServiceDataService,
              private dialogRef: DialogRef) {
    this.operation = data.operation;
    this.model = data.model;
    this.attachmentTypeId = data.attachmentTypeId;
    this.attachmentTypeUsersList = lookupService.getByCategory(LookupCategories.ATTACHMENT_TYPE_USERS);
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
      customProperties: this.fb.array([])
    });
    this.fm = new FormManager(this.form, this.lang);

    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
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
    return this.operation === OperationTypes.CREATE ? this.lang.map.lbl_add_service : this.lang.map.lbl_edit_service;
  };

  saveModel(): void {
    this.selectedService = this.services.find(s => s.id === this.form.get('serviceId')?.value)!;
    this.save$.next();
  }

  _saveModel(): void {
    this.save$
      .pipe(takeUntil(this.destroy$),
        exhaustMap(() => {
          let attachmentTypeServiceData = (new AttachmentTypeServiceData()).clone({...this.model, ...this.fm.getForm()?.value});
          attachmentTypeServiceData = this.mapAttachmentTypeServiceDataToSend(attachmentTypeServiceData, this.attachmentTypeId, this.customPropertiesKeyValue);
          return attachmentTypeServiceData.save().pipe(
            catchError((err) => {
              this.exceptionHandlerService.handle(err);
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
    this.selectedService = this.services.find(s => s.id === this.form.get('serviceId')?.value)!;
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
      properties.forEach((property: any) => {
        let controlValue = this.customPropertiesKeyValue[property.name] ? this.customPropertiesKeyValue[property.name] : null;
        this.customPropertiesArrayForm.push(new FormControl(controlValue));
      });
    });
  }

  get customPropertiesArrayForm(): FormArray {
    return this.form.get('customProperties') as FormArray;
  }

  getOptionName(option: any): string {
    return option[(this.lang.map.lang + 'Name')];
  }

  getCustomPropertyName(name: string): string {
    return 'cp_' + name.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  onCustomPropertyChange(index: number) {
    const key = this.customProperties[index].name;
    const value = this.customPropertiesArrayForm.controls[index].value;

    if(value) {
      this.customPropertiesKeyValue[key] = value;
    } else {
      delete this.customPropertiesKeyValue[key];
    }
  }

  getCustomPropertiesAsString(customPropertiesJson: {[key: string]: number}): string {
    return JSON.stringify(customPropertiesJson);
  }

  getCustomPropertiesAsJson(customPropertiesString: string) {
    if(customPropertiesString) {
      return JSON.parse(customPropertiesString);
    }
    return {};
  }

  mapAttachmentTypeServiceDataToSend(attachmentTypeServiceData: AttachmentTypeServiceData, attachmentTypeId: number, customPropertiesJson: {[key: string]: number}): AttachmentTypeServiceData {
    attachmentTypeServiceData.attachmentTypeId = attachmentTypeId;
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
}
