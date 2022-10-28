import {Component, Inject} from '@angular/core';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {CharityOrganizationProfileExtraData} from '@app/models/charity-organization-profile-extra-data';
import {LookupService} from '@services/lookup.service';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@contracts/i-dialog-data';
import {ToastService} from '@services/toast.service';
import {LangService} from '@services/lang.service';
import {DialogService} from '@services/dialog.service';
import {CharityOrganizationProfileExtraDataService} from '@services/charity-organization-profile-extra-data.service';
import {Observable} from 'rxjs';
import {OperationTypes} from '@app/enums/operation-types.enum';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'charity-organization-profile-extra-data-popup',
  templateUrl: './charity-organization-profile-extra-data-popup.component.html',
  styleUrls: ['./charity-organization-profile-extra-data-popup.component.scss']
})
export class CharityOrganizationProfileExtraDataPopupComponent extends AdminGenericDialog<CharityOrganizationProfileExtraData> {
  form!: UntypedFormGroup;
  model: CharityOrganizationProfileExtraData;
  operation: OperationTypes;
  accordionView: boolean = false;

  constructor(private lookupService: LookupService,
              public fb: UntypedFormBuilder,
              public dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<CharityOrganizationProfileExtraData>,
              private toast: ToastService,
              public lang: LangService,
              private service: CharityOrganizationProfileExtraDataService,
              private dialogService: DialogService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }

  afterSave(model: CharityOrganizationProfileExtraData, dialogRef: DialogRef): void {
  }

  beforeSave(model: CharityOrganizationProfileExtraData, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  buildForm(): void {
  }

  destroyPopup(): void {
  }


  initPopup(): void {
  }

  prepareModel(model: CharityOrganizationProfileExtraData, form: UntypedFormGroup): Observable<CharityOrganizationProfileExtraData> | CharityOrganizationProfileExtraData {
    return (new CharityOrganizationProfileExtraData()).clone({...model, ...form.value});
  }

  saveFail(error: Error): void {
  }

}
