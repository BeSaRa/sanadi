import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {of, Subject} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import {OperationTypes} from '../../../enums/operation-types.enum';
import {FormManager} from '../../../models/form-manager';
import {ServiceData} from '../../../models/service-data';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {IDialogData} from '../../../interfaces/i-dialog-data';
import {LangService} from '../../../services/lang.service';
import {CustomValidators} from '../../../validators/custom-validators';
import {catchError, exhaustMap, takeUntil} from 'rxjs/operators';
import {extender} from '../../../helpers/extender';
import {ToastService} from '../../../services/toast.service';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {ExceptionHandlerService} from '../../../services/exception-handler.service';
import {Lookup} from '../../../models/lookup';
import {LookupCategories} from '../../../enums/lookup-categories';
import {LookupService} from '../../../services/lookup.service';

@Component({
  selector: 'service-data-popup',
  templateUrl: './service-data-popup.component.html',
  styleUrls: ['./service-data-popup.component.scss']
})
export class ServiceDataPopupComponent implements OnInit, OnDestroy {
  private save$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  form!: FormGroup;
  model: ServiceData;
  operation: OperationTypes;
  list: ServiceData[] = [];
  fm!: FormManager;
  statusList: Lookup[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<ServiceData>, private lookupService: LookupService,
              public langService: LangService, private fb: FormBuilder, private toast: ToastService,
              private dialogRef: DialogRef, private exceptionHandlerService: ExceptionHandlerService) {
    this.model = data.model;
    this.operation = data.operation;
    this.list = data.list;
    this.statusList = lookupService.getByCategory(LookupCategories.COMMON_STATUS);
  }

  ngOnInit(): void {
    this.buildForm();
    this._saveModel();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  buildForm(): void {
    this.form = this.fb.group({
      caseType: [this.model.caseType, [CustomValidators.required, CustomValidators.number]],
      bawServiceCode: [this.model.bawServiceCode, [
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
      requestSerialCode: [this.model.requestSerialCode, CustomValidators.required],
      licenseSerialCode: [this.model.licenseSerialCode, CustomValidators.required],
      status: [this.model.status, [CustomValidators.required]]
    });
    this.fm = new FormManager(this.form, this.langService);
  }

  saveModel(): void {
    this.save$.next();
  }

  _saveModel(): void {
    this.save$.pipe(
      takeUntil(this.destroy$),
      exhaustMap(() => {
        const serviceData = extender<ServiceData>(ServiceData, {...this.model, ...this.form.value});
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
      const message = this.operation === OperationTypes.CREATE ? this.langService.map.msg_create_x_success : this.langService.map.msg_update_x_success;
      this.toast.success(message.change({x: _serviceData.getName()}));
      this.model = _serviceData;
      this.operation = OperationTypes.UPDATE;
      this.dialogRef.close(this.model);
    });
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.langService.map.lbl_add_service : this.langService.map.lbl_edit_service;
  }
}
