import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { Profile } from '@app/models/profile';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ToastService } from '@app/services/toast.service';
import { TabComponent } from '@app/shared/components/tab/tab.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable } from 'rxjs';

@Component({
  selector: 'profile-popup',
  templateUrl: './profile-popup.component.html',
  styleUrls: ['./profile-popup.component.scss'],
})
export class ProfilePopupComponent extends AdminGenericDialog<Profile> {
  model!: Profile;
  form!: UntypedFormGroup;
  operation!: OperationTypes;
  tabsData: IKeyValue = {
    basic: {
      name: 'basic', validate:
        () => (this.basicInfoForm?.invalid && (this.basicInfoForm?.touched || this.basicInfoForm?.dirty))
    },
  };
  profileTypes = this.lookupService.listByCategory.InternalProjectClassification;
  status = this.lookupService.listByCategory.CommonStatus;

  get basicInfoForm(): AbstractControl | null {
    return this.form.get('basicInfo');
  }
  constructor(
    private lookupService: LookupService,
    public fb: UntypedFormBuilder,
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<Profile>,
    private toast: ToastService,
    public lang: LangService
  ) {
    super();
    this.model = new Profile().clone({ ...data.model });
    this.operation = data.operation;
  }

  onTabChange($event: TabComponent) {
  }
  initPopup(): void {
  }
  destroyPopup(): void {
    throw new Error('Method not implemented.');
  }
  afterSave(model: Profile, dialogRef: DialogRef): void {
    throw new Error('Method not implemented.');
  }
  beforeSave(
    model: Profile,
    form: UntypedFormGroup
  ): boolean | Observable<boolean> {
    throw new Error('Method not implemented.');
  }
  prepareModel(
    model: Profile,
    form: UntypedFormGroup
  ): Profile | Observable<Profile> {
    throw new Error('Method not implemented.');
  }
  saveFail(error: Error): void {
    throw new Error('Method not implemented.');
  }
  buildForm(): void {
    this.form = this.fb.group({
      basicInfo: this.fb.group(this.model.buildForm())
    });
  }
}
