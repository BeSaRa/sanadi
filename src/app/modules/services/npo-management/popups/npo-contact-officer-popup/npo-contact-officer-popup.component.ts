import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {Component, Inject} from '@angular/core';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {NpoContactOfficer} from '@app/models/npo-contact-officer';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {JobTitle} from '@app/models/job-title';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {Observable} from 'rxjs';
import {AdminResult} from '@app/models/admin-result';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {JobTitleService} from '@app/services/job-title.service';

@Component({
  selector: 'app-npo-contact-officer-popup',
  templateUrl: './npo-contact-officer-popup.component.html',
  styleUrls: ['./npo-contact-officer-popup.component.scss']
})
export class NpoContactOfficerPopupComponent extends UiCrudDialogGenericComponent<NpoContactOfficer> {
  popupTitleKey: keyof ILanguageKeys;
  // jobTitleAdminLookup: JobTitle[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<NpoContactOfficer>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'contact_officers';
  }

  _getNewInstance(override?: Partial<NpoContactOfficer> | undefined): NpoContactOfficer {
    return new NpoContactOfficer().clone(override ?? {});
  }

  initPopup(): void {
  //  this.loadJobTitles();
  }

  getPopupHeadingText(): string {
    return '';
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: NpoContactOfficer, originalModel: NpoContactOfficer): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  _isDuplicate(record1: Partial<NpoContactOfficer>, record2: Partial<NpoContactOfficer>): boolean {
    return (record1 as NpoContactOfficer).isEqual(record2 as NpoContactOfficer);
  }

  beforeSave(model: NpoContactOfficer, form: UntypedFormGroup): boolean | Observable<boolean> {
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

  prepareModel(model: NpoContactOfficer, form: UntypedFormGroup): NpoContactOfficer | Observable<NpoContactOfficer> {
    let formValue = form.getRawValue();
    return this._getNewInstance({
      ...this.model,
      ...formValue,
      // jobInfo: this.jobTitleAdminLookup.find(x => x.id === formValue.JobTitle)?.createAdminResult() ?? new AdminResult()
    });
  }

  saveFail(error: Error): void {
    throw new Error(error.message);
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.getContactOfficerFields(true));
  }

  // private loadJobTitles(): void {
  //   this.JobTitleService.loadActive().subscribe((data) => {
  //     this.jobTitleAdminLookup = data;
  //   })
  // }
}
