import { Component, Inject, Input } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { UiCrudDialogComponentDataContract } from '@app/contracts/ui-crud-dialog-component-data-contract';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UiCrudDialogGenericComponent } from '@app/generics/ui-crud-dialog-generic-component.directive';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { AdminResult } from '@app/models/admin-result';
import { GeneralAssociationExternalMember } from '@app/models/general-association-external-member';
import { JobTitle } from '@app/models/job-title';
import { NpoEmployee } from '@app/models/npo-employee';
import { DialogService } from '@app/services/dialog.service';
import { GeneralAssociationMeetingAttendanceService } from '@app/services/general-association-meeting-attendance.service';
import { JobTitleService } from '@app/services/job-title.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable, of } from 'rxjs';
import { exhaustMap, filter, map, tap } from 'rxjs/operators';

@Component({
  selector: 'manage-members-popup',
  templateUrl: './manage-members-popup.component.html',
  styleUrls: ['./manage-members-popup.component.scss']
})
export class ManageMembersPopupComponent extends UiCrudDialogGenericComponent<GeneralAssociationExternalMember>{
  selectedMemberFromPopup?:GeneralAssociationExternalMember;
  isGeneralAssociationMembers!: boolean;
  jobTitles!:JobTitle[];
  model: GeneralAssociationExternalMember;
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  addLabel!: keyof ILanguageKeys;
  searchVisible!:boolean;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<GeneralAssociationExternalMember>,
  public lang: LangService,
  public dialogRef: DialogRef,
  public dialogService: DialogService,
  public fb: UntypedFormBuilder,
  public toast: ToastService,
  public jobTitleService:JobTitleService,
  
  private generalAssociationMeetingService:GeneralAssociationMeetingAttendanceService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.list = data.list;
    this.addLabel = (data.extras && data.extras.addLabel) ?? null;
    this.isGeneralAssociationMembers = (data.extras && data.extras.isGeneralAssociationMembers) ?? false;
  }

  initPopup(): void {
    this.popupTitleKey = this.addLabel;
    this.jobTitleService.loadAsLookups()
    .subscribe(list => {
      this.jobTitles = list;
    });
  }

  protected _afterViewInit(){
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
    if(!!this.selectedMemberFromPopup){
      return this._beforeSaveSearch() 
    } else {
      return this._beforeSaveForm(form)
    }

  }
  private _beforeSaveSearch(): boolean{
    let isDuplicate :boolean = false;
    if(this.operation === this.operationTypes.UPDATE) {
      const selectedIndex = this.list.findIndex(x=> x.identificationNumber === this.model.identificationNumber)
      isDuplicate = this.list.some((x, index) => {
        return (index !== selectedIndex) && x.identificationNumber === this.selectedMemberFromPopup!.identificationNumber
      });
    } else {
      isDuplicate = this.list.some(x => x.identificationNumber === this.selectedMemberFromPopup!.identificationNumber);
    }
    if (isDuplicate) {
      this.displayDuplicatedItemMessage();
      return false;
    }
    return true;
  }

  private _beforeSaveForm(form: UntypedFormGroup):boolean{
    if (this.form.invalid) {
      this.displayRequiredFieldsMessage();
      return false;
    }
    let isDuplicate :boolean = false;
    if(this.operation === this.operationTypes.UPDATE) {
      const selectedIndex = this.list.findIndex(x=> x.identificationNumber === this.model.identificationNumber)
      isDuplicate = this.list.some((x, index) => {
        return (index !== selectedIndex) && x.identificationNumber === form.value.identificationNumber
      });
    } else {
      isDuplicate = this.list.some(x => x.identificationNumber === form.value.identificationNumber);
    }
    if (isDuplicate) {
      this.displayDuplicatedItemMessage();
      return false;
    }
    return true;
  }

  prepareModel(model: GeneralAssociationExternalMember, form: UntypedFormGroup): Observable<GeneralAssociationExternalMember> | GeneralAssociationExternalMember {
    if(this.selectedMemberFromPopup){
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

  get arabicName(): FormControl {
    return this.form.get('arabicName')! as FormControl;
  }

  get englishName(): FormControl {
    return this.form.get('englishName')! as FormControl;
  }

  get identificationNumber(): FormControl {
    return this.form.get('identificationNumber')! as FormControl;
  }

  get jobTitle(): FormControl {
    return this.form.get('jobTitleId')! as FormControl;
  }


  searchMembers() {
    if(this.readonly) return;

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
        // if(!item) {
        //   this.form.reset()
        // }        
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
