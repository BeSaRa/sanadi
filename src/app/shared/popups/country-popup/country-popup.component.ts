import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {Observable} from 'rxjs';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {Country} from '@app/models/country';
import {Lookup} from '@app/models/lookup';
import {AdminGenericDialog} from "@app/generics/admin-generic-dialog";

@Component({
  selector: 'country-popup',
  templateUrl: './country-popup.component.html',
  styleUrls: ['./country-popup.component.scss']
})
export class CountryPopupComponent extends AdminGenericDialog<Country> implements AfterViewInit {
  form!: UntypedFormGroup;
  model: Country;
  operation: OperationTypes;
  saveVisible = true;
  riskLevelList: Lookup[] = this.lookupService.listByCategory.RiskLevel;
  dueDiligenceLevelList: Lookup[] = this.lookupService.listByCategory.LevelOfDueDiligence;
  @ViewChild('dialogContent') dialogContent!: ElementRef;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<Country>,
              private toast: ToastService,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              public langService: LangService,
              private lookupService: LookupService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }

  ngAfterViewInit() {
    Promise.resolve().then(() => {
      if (this.operation === OperationTypes.UPDATE) {
        this.displayFormValidity(this.form, this.dialogContent.nativeElement);
      }

      if (this.readonly) {
        this.form.disable();
        this.saveVisible = false;
        this.validateFieldsVisible = false;
      }
    })
  }

  initPopup(): void {

  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));

    // will check it later
    if (this.operation === OperationTypes.UPDATE) {
      this.displayFormValidity(this.form,);
    }
  }

  get readonly(): boolean {
    return this.operation === OperationTypes.VIEW;
  }

  beforeSave(model: Country, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: Country, form: UntypedFormGroup): Observable<Country> | Country {
    return (new Country()).clone({...model, ...form.value});
  }

  afterSave(model: Country, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.langService.map.msg_create_x_success : this.langService.map.msg_update_x_success;
    this.operation === this.operationTypes.CREATE
      ? this.toast.success(message.change({x: this.form.controls[this.langService.map.lang + 'Name'].value}))
      : this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.langService.map.lbl_add_country;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.langService.map.lbl_edit_country;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.langService.map.view;
    }
    return '';
  }

  destroyPopup(): void {
  }
}
