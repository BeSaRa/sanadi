import {Component, Inject} from '@angular/core';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {TrainingProgram} from '@app/models/training-program';
import {FormManager} from '@app/models/form-manager';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {LangService} from '@app/services/lang.service';
import {ExceptionHandlerService} from '@app/services/exception-handler.service';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {DialogService} from '@app/services/dialog.service';
import {Lookup} from '@app/models/lookup';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {DateUtils} from '@app/helpers/date-utils';
import {IMyInputFieldChanged} from 'angular-mydatepicker';
import {CustomValidators} from '@app/validators/custom-validators';

@Component({
  selector: 'training-program-popup',
  templateUrl: './training-program-popup.component.html',
  styleUrls: ['./training-program-popup.component.scss']
})
export class TrainingProgramPopupComponent extends AdminGenericDialog<TrainingProgram> {
  form!: FormGroup;
  fm!: FormManager;
  operation!: OperationTypes;
  model!: TrainingProgram;
  validateFieldsVisible = true;
  saveVisible = true;
  tabsData: IKeyValue = {
    basic: {name: 'basic'},
    organizations: {name: 'organizations'},
    trainers: {name: 'trainers'}
  };
  datepickerControlsMap: { [key: string]: FormControl } = {};
  datepickerOptionsMap: IKeyValue = {
    trainingStartDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    trainingEndDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    registerationStartDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    registerationClosureDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
  };
  trainingTypes: Lookup[] = this.lookupService.listByCategory.TRAINING_TYPE;
  organizationTypes: Lookup[] = this.lookupService.listByCategory.ORG_UNIT_TYPE;
  targetAudienceList: Lookup[] = this.lookupService.listByCategory.TRAINING_AUDIENCE;
  attendanceMethods: Lookup[] = this.lookupService.listByCategory.TRAINING_ATTENDENCE_METHOD;
  trainingLanguages: Lookup[] = this.lookupService.listByCategory.TRAINING_LANG;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<TrainingProgram>,
              public lang: LangService,
              public fb: FormBuilder,
              public exceptionHandlerService: ExceptionHandlerService,
              public lookupService: LookupService,
              public toast: ToastService,
              public dialogRef: DialogRef,
              public dialogService: DialogService) {
    super();
    this.operation = data.operation;
    this.model = data.model;
    console.log('model training', this.model);
  }

  initPopup(): void {

  }

  setMinDate(): void {
    let controlsMap = {},
      optionsMap = {},

      trainingStartDate = '',
      trainingEndDate = '',
      regisStartDate = '',
      regisEndDate = '';

    // DateUtils.setRelatedMaxDate({fromFieldName: 'trainignStartDate', toFieldName: 'endDate'})
  }

  trainingStartDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {


    this.setRelatedDates(event, fromFieldName, toFieldName);

  }

  trainingEndDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {

    this.setRelatedDates(event, fromFieldName, toFieldName);
  }

  registrationStartDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    let trainingStartDate = this.trainingStartDateControl.value;
    let validators = trainingStartDate ? [CustomValidators.minDate(DateUtils.changeDateFromDatepicker(trainingStartDate)!)] : [];

    this.registrationStartDateControl.setValidators([CustomValidators.required].concat(validators));
    this.registrationClosureDateControl.setValidators([CustomValidators.required].concat(validators));

    this.registrationStartDateControl.updateValueAndValidity();
    this.registrationClosureDateControl.updateValueAndValidity();

    this.setRelatedDates(event, fromFieldName, toFieldName);
  }

  registrationEndDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    let trainingStartDate = this.trainingStartDateControl.value;
    let validators = trainingStartDate ? [CustomValidators.minDate(DateUtils.changeDateFromDatepicker(trainingStartDate)!)] : [];

    this.registrationStartDateControl.setValidators([CustomValidators.required].concat(validators));
    this.registrationClosureDateControl.setValidators([CustomValidators.required].concat(validators));

    this.registrationStartDateControl.updateValueAndValidity();
    this.registrationClosureDateControl.updateValueAndValidity();

    this.setRelatedDates(event, fromFieldName, toFieldName);
  }

  setRelatedDates(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {



    DateUtils.setRelatedMinDate({
      fromFieldName,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: this.datepickerControlsMap
    });
    DateUtils.setRelatedMaxDate({
      fromFieldName,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: this.datepickerControlsMap
    });
  }

  private _buildDatepickerControlsMap() {
    this.datepickerControlsMap = {
      startDate: this.trainingStartDateControl,
      endDate: this.trainingEndDateControl,
      registerationStartDate: this.registrationStartDateControl,
      registerationClosureDate: this.registrationClosureDateControl
    };
  }

  get trainingStartDateControl(): FormControl {
    return this.form.get('startDate') as FormControl;
  }

  get trainingEndDateControl(): FormControl {
    return this.form.get('endDate') as FormControl;
  }

  get registrationStartDateControl(): FormControl {
    return this.form.get('registerationStartDate') as FormControl;
  }

  get registrationClosureDateControl(): FormControl {
    return this.form.get('registerationClosureDate') as FormControl;
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    this.fm = new FormManager(this.form, this.lang);
    this._buildDatepickerControlsMap();
  }

  beforeSave(model: TrainingProgram, form: FormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: TrainingProgram, form: FormGroup): Observable<TrainingProgram> | TrainingProgram {
    return (new TrainingProgram()).clone({...model, ...form.value});
  }

  afterSave(model: TrainingProgram, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    // @ts-ignore
    this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    const operationBeforeSave = this.operation;
    this.operation = OperationTypes.UPDATE;

    if (operationBeforeSave == OperationTypes.UPDATE) {
      this.dialogRef.close(this.model);
    }
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ?
      this.lang.map.add_training_program :
      this.lang.map.edit_training_program;
  };

  destroyPopup(): void {
  }

  hoursList: { val: number, key: string }[] = [
    {
      val: 0,
      key: '12:00 AM'
    },
    {
      val: 1,
      key: '01:00 AM'
    },
    {
      val: 2,
      key: '02:00 AM'
    },
    {
      val: 3,
      key: '03:00 AM'
    },
    {
      val: 4,
      key: '04:00 AM'
    },
    {
      val: 5,
      key: '05:00 AM'
    },
    {
      val: 6,
      key: '06:00 AM'
    },
    {
      val: 7,
      key: '07:00 AM'
    },
    {
      val: 8,
      key: '08:00 AM'
    },
    {
      val: 9,
      key: '09:00 AM'
    },
    {
      val: 10,
      key: '10:00 AM'
    },
    {
      val: 11,
      key: '11:00 AM'
    },
    {
      val: 12,
      key: '12:00 PM'
    },
    {
      val: 13,
      key: '01:00 PM'
    },
    {
      val: 14,
      key: '02:00 PM'
    },
    {
      val: 15,
      key: '03:00 PM'
    },
    {
      val: 16,
      key: '04:00 PM'
    },
    {
      val: 17,
      key: '05:00 PM'
    },
    {
      val: 18,
      key: '06:00 PM'
    },
    {
      val: 19,
      key: '07:00 PM'
    },
    {
      val: 20,
      key: '08:00 PM'
    },
    {
      val: 21,
      key: '09:00 PM'
    },
    {
      val: 22,
      key: '10:00 PM'
    },
    {
      val: 23,
      key: '11:00 PM'
    }
  ];
}
