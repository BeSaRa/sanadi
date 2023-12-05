import { Component, Inject } from '@angular/core';
import { UiCrudDialogGenericComponent } from "@app/generics/ui-crud-dialog-generic-component.directive";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { OperationTypes } from "@enums/operation-types.enum";
import { ILanguageKeys } from "@contracts/i-language-keys";
import { DIALOG_DATA_TOKEN } from "@app/shared/tokens/tokens";
import { UiCrudDialogComponentDataContract } from "@contracts/ui-crud-dialog-component-data-contract";
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Observable, of } from "rxjs";
import { NpoEmployee } from "@models/npo-employee";
import { exhaustMap, filter, map, tap } from "rxjs/operators";
import { CharityOrganizationUpdateService } from '@app/services/charity-organization-update.service';
import { OrgExecutiveMember } from '@app/models/org-executive-member';

@Component({
  selector: 'manage-executive-management-members-popup',
  templateUrl: './manage-executive-management-members-popup.component.html',
  styleUrls: ['./manage-executive-management-members-popup.component.scss']
})
export class ManageExecutiveManagementMembersPopupComponent extends UiCrudDialogGenericComponent<OrgExecutiveMember> {
  popupTitleKey: keyof ILanguageKeys;
  addLabel!: keyof ILanguageKeys;
  searchVisible!: boolean;
  selectedMemberFromPopup?: OrgExecutiveMember;
  hideFullScreen = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<OrgExecutiveMember>,
    public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    private charityOrganizationUpdateService: CharityOrganizationUpdateService) {
    super();
    this.setInitDialogData(data);
    this.addLabel = (data.extras && data.extras.addLabel) ?? null;
    this.popupTitleKey = this.addLabel;
  }

  getPopupHeadingText(): string {
    return this.model.fullName;
  }

  initPopup(): void {
  }
  _isDuplicate(record1: Partial<OrgExecutiveMember>, record2: Partial<OrgExecutiveMember>): boolean {
    return record1.identificationNumber == record2.identificationNumber;
  }
  protected _afterViewInit() {
    this.searchVisible = !this.readonly;
  }

  _getNewInstance(override?: Partial<OrgExecutiveMember> | undefined): OrgExecutiveMember {
    return new OrgExecutiveMember().clone(override ?? {});
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  afterSave(savedModel: OrgExecutiveMember, originalModel: OrgExecutiveMember): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: OrgExecutiveMember, form: UntypedFormGroup): Observable<boolean> | boolean {
    if (!!this.selectedMemberFromPopup) {
      return this._beforeSaveSearch()
    } else {
      return this._beforeSaveForm(form)
    }
  }

  private _beforeSaveSearch(): boolean {
    if (this.isDuplicateInList(this.selectedMemberFromPopup)) {
      this.displayDuplicatedItemMessage();
      return false;
    }
    return true;
  }

  private _beforeSaveForm(form: UntypedFormGroup): boolean {
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

  prepareModel(model: OrgExecutiveMember, form: UntypedFormGroup): Observable<OrgExecutiveMember> | OrgExecutiveMember {
    if (this.selectedMemberFromPopup) {
      return this.selectedMemberFromPopup
    } else {
      let formValue = form.getRawValue();
      return this._getNewInstance({
        ...this.model,
        ...formValue,
      });
    }
  }

  saveFail(error: Error): void {
  }

  destroyPopup(): void {
  }

  get fullName(): UntypedFormControl {
    return this.form.get('fullName')! as UntypedFormControl;
  }

  get identificationNumber(): UntypedFormControl {
    return this.form.get('identificationNumber')! as UntypedFormControl;
  }

  get jobTitle(): UntypedFormControl {
    return this.form.get('jobTitle')! as UntypedFormControl;
  }



  searchMembers() {
    if (this.readonly) return;

    const criteria = {
      arabicName: this.fullName.value,
      qId: this.identificationNumber.value,
      jobTitleName: this.jobTitle?.value,
    };

    this.charityOrganizationUpdateService.searchNpoEmployees(criteria)
      .pipe(tap(members => !members.length && this.dialogService.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(members => !!members.length))
      .pipe(map(items => {
        return items.filter(item => item.qId || item.identificationNumber)
      }))
      .pipe(map(items => {
        return items.map(item => this.mapNpoEmployeeToOrgExecutiveMember(item));
      }))
      .pipe(exhaustMap((members) => {
        return members.length === 1 ? of(members[0]) : this.openSelectMember(members);
      }))
      .pipe(filter(item => {
        this.selectedMemberFromPopup = item;
        return !!item;
      }))
      .subscribe((item) => {
        this.save$.next();
      });
  }

  mapNpoEmployeeToOrgExecutiveMember(npoEmployee: NpoEmployee) {
    const member = new OrgExecutiveMember();
    member.id = npoEmployee.id;
    member.fullName = npoEmployee.arabicName;
    member.identificationNumber = npoEmployee.qId || npoEmployee.identificationNumber;
    member.email = npoEmployee.email;
    member.phone = npoEmployee.phone;
    member.jobTitle = npoEmployee.jobTitle;
    member.joinDate = npoEmployee.workStartDate;
    return member;
  }

  private openSelectMember(members: OrgExecutiveMember[]) {
    return this.charityOrganizationUpdateService.openSelectMemberDialog(members, true, false, [
      'fullName',
      'identificationNumber',
      'jobTitle'
    ]).onAfterClose$ as Observable<OrgExecutiveMember>;
  }
}
