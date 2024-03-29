import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {ImplementingAgency} from '@models/implementing-agency';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {AdminResult} from '@app/models/admin-result';
import {Lookup} from '@app/models/lookup';
import {CommonService} from '@app/services/common.service';
import {LookupService} from '@app/services/lookup.service';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-intervention-implementing-agency-list-popup',
  templateUrl: './intervention-implementing-agency-list-popup.component.html',
  styleUrls: ['./intervention-implementing-agency-list-popup.component.scss']
})
export class InterventionImplementingAgencyListPopupComponent extends UiCrudDialogGenericComponent<ImplementingAgency> {
  popupTitleKey: keyof ILanguageKeys;
  executionCountry: number;
  hideFullScreen = true;
  implementingAgencyTypeList: Lookup[] = this.lookupService.listByCategory.ImplementingAgencyType.slice()
    .sort((a, b) => a.lookupKey - b.lookupKey);
  implementingAgencyList: AdminResult[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<ImplementingAgency>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              private lookupService: LookupService,
              private commonService: CommonService) {
    super();
    this.setInitDialogData(data);
    this.executionCountry = (data.extras && data.extras.executionCountry) ?? undefined;
    this.popupTitleKey = 'entities';
  }

  _getNewInstance(override?: Partial<ImplementingAgency> | undefined): ImplementingAgency {
    return new ImplementingAgency().clone(override ?? {});
  }

  initPopup(): void {
    this.loadImplementingAgenciesByAgencyType(this.form.value.implementingAgencyType);
  }

  getPopupHeadingText(): string {
    return '';
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: ImplementingAgency, originalModel: ImplementingAgency): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  _isDuplicate(record1: Partial<ImplementingAgency>, record2: Partial<ImplementingAgency>): boolean {
    return (record1 as ImplementingAgency).isEqual(record2 as ImplementingAgency);
  }

  beforeSave(model: ImplementingAgency, form: UntypedFormGroup): Observable<boolean> | boolean {
    if (this.form.invalid) {
      this.displayRequiredFieldsMessage();
      return false;
    }
    if (this.isDuplicateInList(form.getRawValue())) {
      this.displayDuplicatedItemMessage();
      return false;
    }
    return true;
  }

  prepareModel(model: ImplementingAgency, form: UntypedFormGroup): ImplementingAgency | Observable<ImplementingAgency> {
    let formValue = form.getRawValue();
    let agencyTypeInfo: AdminResult = (this.implementingAgencyTypeList.find(x => x.lookupKey === formValue.implementingAgencyType) ?? new Lookup()).convertToAdminResult();
    let implementingAgencyInfo: AdminResult = (this.implementingAgencyList.find(x => x.fnId === formValue.implementingAgency)) ?? new AdminResult();
    return this._getNewInstance({
      ...this.model,
      ...formValue,
      agencyTypeInfo,
      implementingAgencyInfo,
    });
  }

  saveFail(error: Error): void {
    throw new Error(error.message);
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.getAgencyFields(true));
  }

  handleImplementingAgencyTypeChange(agencyType: number, userInteraction: boolean = false): void {
    if (userInteraction) {
      this.implementingAgencyField.setValue(null);
      this.loadImplementingAgenciesByAgencyType(agencyType);
    }
  }

  private loadImplementingAgenciesByAgencyType(agencyType: number) {
    if (!agencyType) {
      this.implementingAgencyList = [];
      return;
    }
    this.commonService.loadAgenciesByAgencyTypeAndCountry(agencyType, this.executionCountry)
      .subscribe((result) => {
        this.implementingAgencyList = result;
      });
  }

  get implementingAgencyTypeField(): UntypedFormControl {
    return this.form.get('implementingAgencyType') as UntypedFormControl;
  }

  get implementingAgencyField(): UntypedFormControl {
    return this.form.get('implementingAgency') as UntypedFormControl;
  }
}
