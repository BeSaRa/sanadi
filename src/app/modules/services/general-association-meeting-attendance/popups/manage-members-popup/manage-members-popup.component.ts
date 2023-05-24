import {Component, Inject} from '@angular/core';
import {UiCrudDialogGenericComponent} from "@app/generics/ui-crud-dialog-generic-component.directive";
import {GeneralAssociationExternalMember} from "@models/general-association-external-member";
import {JobTitle} from "@models/job-title";
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from "@angular/forms";
import {OperationTypes} from "@enums/operation-types.enum";
import {ILanguageKeys} from "@contracts/i-language-keys";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {UiCrudDialogComponentDataContract} from "@contracts/ui-crud-dialog-component-data-contract";
import {DialogRef} from '@app/shared/models/dialog-ref';
import {JobTitleService} from "@services/job-title.service";
import {GeneralAssociationMeetingAttendanceService} from "@services/general-association-meeting-attendance.service";
import {Observable, of} from "rxjs";
import {AdminResult} from "@models/admin-result";
import {NpoEmployee} from "@models/npo-employee";
import {exhaustMap, filter, map, tap} from "rxjs/operators";

@Component({
  selector: 'manage-members-popup',
  templateUrl: './manage-members-popup.component.html',
  styleUrls: ['./manage-members-popup.component.scss']
})
export class ManageMembersPopupComponent extends UiCrudDialogGenericComponent<GeneralAssociationExternalMember> {
  popupTitleKey: keyof ILanguageKeys;
  addLabel!: keyof ILanguageKeys;
  searchVisible!: boolean;
  selectedMemberFromPopup?: GeneralAssociationExternalMember;
  isGeneralAssociationMembers!: boolean;
  jobTitles: JobTitle[] = [];
  hideFullScreen = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<GeneralAssociationExternalMember>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              public jobTitleService: JobTitleService,
              private generalAssociationMeetingService: GeneralAssociationMeetingAttendanceService) {
    super();
    this.setInitDialogData(data);
    this.addLabel = (data.extras && data.extras.addLabel) ?? null;
    this.isGeneralAssociationMembers = (data.extras && data.extras.isGeneralAssociationMembers) ?? false;
    this.popupTitleKey = this.addLabel;
  }

  getPopupHeadingText(): string {
    return this.model.getName();
  }

  private loadJobTitles(): void {
    this.jobTitleService.loadAsLookups()
      .subscribe(list => {
        this.jobTitles = list;
      });
  }

  initPopup(): void {
    if (this.isGeneralAssociationMembers) {
      this.loadJobTitles();
    }
  }

  protected _afterViewInit() {
    this.saveVisible = !this.readonly && this.isGeneralAssociationMembers;
    this.searchVisible = !this.readonly;
  }

  _getNewInstance(override?: Partial<GeneralAssociationExternalMember> | undefined): GeneralAssociationExternalMember {
    return new GeneralAssociationExternalMember().clone(override ?? {});
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true, this.isGeneralAssociationMembers));
  }

  afterSave(savedModel: GeneralAssociationExternalMember, originalModel: GeneralAssociationExternalMember): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: GeneralAssociationExternalMember, form: UntypedFormGroup): Observable<boolean> | boolean {
    if (!!this.selectedMemberFromPopup) {
      return this._beforeSaveSearch()
    } else {
      return this._beforeSaveForm(form)
    }
  }

  private isDuplicate(formValue: any): boolean {
    if (this.operation === OperationTypes.CREATE) {
      return this.list.some((item) => item.identificationNumber === formValue.identificationNumber);
    }
    if (this.operation === OperationTypes.UPDATE) {
      return this.list.some((item: GeneralAssociationExternalMember, index: number) => {
        return index !== this.listIndex && item.identificationNumber === formValue.identificationNumber;
      });
    }
    return false;
  }

  private _beforeSaveSearch(): boolean {
    if (this.isDuplicate(this.selectedMemberFromPopup)) {
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
    if (this.isDuplicate(form.getRawValue())) {
      this.displayDuplicatedItemMessage();
      return false;
    }
    return true;
  }

  prepareModel(model: GeneralAssociationExternalMember, form: UntypedFormGroup): Observable<GeneralAssociationExternalMember> | GeneralAssociationExternalMember {
    if (this.selectedMemberFromPopup) {
      return this.selectedMemberFromPopup
    } else {
      let formValue = form.getRawValue();
      return this._getNewInstance({
        ...this.model,
        ...formValue,
        jobTitleInfo: this.jobTitles.find((x) => x.id === formValue.jobTitleId)?.createAdminResult() ?? new AdminResult(),
      });
    }
  }

  saveFail(error: Error): void {
  }

  destroyPopup(): void {
  }

  get arabicName(): UntypedFormControl {
    return this.form.get('arabicName')! as UntypedFormControl;
  }

  get englishName(): UntypedFormControl {
    return this.form.get('englishName')! as UntypedFormControl;
  }

  get identificationNumber(): UntypedFormControl {
    return this.form.get('identificationNumber')! as UntypedFormControl;
  }

  get jobTitle(): UntypedFormControl {
    return this.form.get('jobTitleId')! as UntypedFormControl;
  }


  searchMembers() {
    if (this.readonly) return;

    const criteria = {
      arabicName: this.arabicName.value,
      englishName: this.englishName.value,
      qId: this.identificationNumber.value,
      jobTitle: this.jobTitle?.value
    };

    this.generalAssociationMeetingService.searchNpoEmployees(criteria)
      .pipe(tap(members => !members.length && this.dialogService.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(members => !!members.length))
      .pipe(map(items => {
        return items.map(item => this.mapNpoEmployeeToGeneralAssociationExternalMember(item));
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

  mapNpoEmployeeToGeneralAssociationExternalMember(npoEmployee: NpoEmployee) {
    const member = new GeneralAssociationExternalMember();
    member.id = npoEmployee.id;
    member.identificationNumber = npoEmployee.qId || npoEmployee.identificationNumber;
    member.arabicName = npoEmployee.arabicName;
    member.englishName = npoEmployee.englishName;
    member.jobTitleId = npoEmployee.jobTitleId;
    member.jobTitleInfo = npoEmployee.jobTitleInfo ? AdminResult.createInstance(npoEmployee.jobTitleInfo) : AdminResult.createInstance({});

    return member;
  }

  private openSelectMember(members: GeneralAssociationExternalMember[]) {
    return this.generalAssociationMeetingService.openSelectMemberDialog(members, true, false).onAfterClose$ as Observable<GeneralAssociationExternalMember>;
  }
}
