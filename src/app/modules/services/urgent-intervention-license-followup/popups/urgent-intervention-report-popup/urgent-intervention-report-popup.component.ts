import {ChangeDetectorRef, Component, Inject} from '@angular/core';
import {OperationTypes} from '@enums/operation-types.enum';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@contracts/i-dialog-data';
import {UrgentInterventionReport} from '@models/urgent-intervention-report';
import {LangService} from '@services/lang.service';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {ToastService} from '@services/toast.service';
import {DialogService} from '@services/dialog.service';
import {DatepickerOptionsMap} from '@app/types/types';
import {DateUtils} from '@helpers/date-utils';

@Component({
  selector: 'urgent-intervention-report-popup',
  templateUrl: './urgent-intervention-report-popup.component.html',
  styleUrls: ['./urgent-intervention-report-popup.component.scss']
})
export class UrgentInterventionReportPopupComponent extends AdminGenericDialog<UrgentInterventionReport> {

  constructor(public lang: LangService,
              private dialogService: DialogService,
              public dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<UrgentInterventionReport>,
              public fb: UntypedFormBuilder,
              private cd: ChangeDetectorRef,
              private toast: ToastService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.readonly = this.operation === OperationTypes.VIEW;
  }

  form!: UntypedFormGroup;
  model!: UrgentInterventionReport;
  operation: OperationTypes;
  saveVisible = true;
  readonly: boolean = false;

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.lbl_add_report;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_report;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };

  datepickerOptionsMap: DatepickerOptionsMap = {
    executionDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    dueDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
  };

  initPopup(): void {
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    if (this.readonly) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }

  prepareModel(model: UrgentInterventionReport, form: UntypedFormGroup): Observable<UrgentInterventionReport> | UrgentInterventionReport {
    return new UrgentInterventionReport().clone({...model, ...form.value});
  }

  beforeSave(model: UrgentInterventionReport, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  afterSave(model: UrgentInterventionReport, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }

  saveFail(error: Error): void {
  }

  destroyPopup(): void {
  }

}
