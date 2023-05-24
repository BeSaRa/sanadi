import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {AdminResult} from '@app/models/admin-result';
import {FounderMembers} from '@app/models/founder-members';
import {JobTitle} from '@app/models/job-title';
import {Lookup} from '@app/models/lookup';
import {JobTitleService} from '@app/services/job-title.service';
import {LookupService} from '@app/services/lookup.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable} from 'rxjs';

@Component({
  selector: 'founder-members-popup',
  templateUrl: './founder-members-popup.component.html',
  styleUrls: ['./founder-members-popup.component.scss']
})
export class FounderMembersPopupComponent extends UiCrudDialogGenericComponent<FounderMembers> {
  popupTitleKey: keyof ILanguageKeys;
  nationalityList: Lookup[] = this.lookupService.listByCategory.Nationality;
  jobTitleAdminLookup: JobTitle[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<FounderMembers>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              private lookupService: LookupService,
              private JobTitleService: JobTitleService) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'lbl_founder_members';
  }

  _getNewInstance(override?: Partial<FounderMembers> | undefined): FounderMembers {
    return new FounderMembers().clone(override ?? {});
  }

  initPopup(): void {
    this.loadJobTitles();
  }

  getPopupHeadingText(): string {
    return '';
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: FounderMembers, originalModel: FounderMembers): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: FounderMembers, form: UntypedFormGroup): boolean | Observable<boolean> {
    if (this.form.invalid) {
      this.displayRequiredFieldsMessage();
      return false;
    }
    const isDuplicate = this.list.some((x) => x === form.getRawValue());
    if (isDuplicate) {
      this.displayDuplicatedItemMessage();
      return false;
    }
    return true;
  }

  prepareModel(model: FounderMembers, form: UntypedFormGroup): FounderMembers | Observable<FounderMembers> {
    let formValue = form.getRawValue();
    return this._getNewInstance({
      ...this.model,
      ...formValue,
      jobTitleInfo: this.jobTitleAdminLookup.find((x) => x.id === formValue.JobTitle)?.createAdminResult() ?? new AdminResult(),
      nationalityInfo: this.nationalityList.find((x) => x.id === formValue.Nationality)?.createAdminResult() ?? new AdminResult(),
    });
  }

  saveFail(error: Error): void {
    throw new Error(error.message);
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.getFounderMembersFields(true));
  }

  searchNgSelect(term: string, item: any): boolean {
    return item.ngSelectSearch(term);
  }

  private loadJobTitles(): void {
    this.JobTitleService.loadActive()
      .subscribe((data) => {
        this.jobTitleAdminLookup = data;
      })
  }
}
