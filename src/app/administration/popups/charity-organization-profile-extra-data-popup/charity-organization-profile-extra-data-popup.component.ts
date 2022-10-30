import {Component, Inject} from '@angular/core';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {CharityOrganizationProfileExtraData} from '@app/models/charity-organization-profile-extra-data';
import {LookupService} from '@services/lookup.service';
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@contracts/i-dialog-data';
import {ToastService} from '@services/toast.service';
import {LangService} from '@services/lang.service';
import {DialogService} from '@services/dialog.service';
import {CharityOrganizationProfileExtraDataService} from '@services/charity-organization-profile-extra-data.service';
import {Observable} from 'rxjs';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {AdminLookup} from '@app/models/admin-lookup';
import {AdminLookupService} from '@services/admin-lookup.service';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {IKeyValue} from '@contracts/i-key-value';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {Officer} from '@app/models/officer';

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
  activityTypes: AdminLookup[] = [];
  addContactOfficersLabel: keyof ILanguageKeys = 'add_contact_officer';
  addComplianceOfficersLabel: keyof ILanguageKeys = 'add_compliance_officer';

  tabsData: IKeyValue = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info' as keyof ILanguageKeys,
      index: 0,
      validStatus: () => this.basicInfo && this.basicInfo.valid
    },
    contactInfo: {
      name: 'contactInfoTab',
      langKey: 'contact_info' as keyof ILanguageKeys,
      index: 1,
      validStatus: () => this.contactInfo && this.contactInfo.valid
    },
    contactOfficers: {
      name: 'contactOfficersTab',
      langKey: 'contact_officers_details' as keyof ILanguageKeys,
      index: 2,
      validStatus: () => this.model.contactOfficer && this.model.contactOfficer.length > 0
    },
    complianceOfficers: {
      name: 'complianceOfficersTab',
      langKey: 'compliance_officers_details' as keyof ILanguageKeys,
      index: 3,
      validStatus: () => this.model.complianceOfficer && this.model.complianceOfficer.length > 0
    }
  };

  constructor(private lookupService: LookupService,
              public fb: UntypedFormBuilder,
              public dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<CharityOrganizationProfileExtraData>,
              private toast: ToastService,
              public lang: LangService,
              private service: CharityOrganizationProfileExtraDataService,
              private dialogService: DialogService,
              private adminLookupService: AdminLookupService) {
    super();
    this.model = (data.model as unknown as CharityOrganizationProfileExtraData[])[0];
    this.operation = data.operation;
  }

  get basicInfo(): UntypedFormGroup {
    return this.form.get('basicInfo')! as UntypedFormGroup;
  }

  get contactInfo(): AbstractControl {
    return this.form.get('contactInfo')!;
  }

  get establishmentDate(): AbstractControl {
    return this.basicInfo?.get('establishmentDate')!;
  }

  afterSave(model: CharityOrganizationProfileExtraData, dialogRef: DialogRef): void {
  }

  beforeSave(model: CharityOrganizationProfileExtraData, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  buildForm(): void {
    this.form = this.fb.group({
      basicInfo: this.fb.group(this.model.buildBasicInfoTab(true)),
      contactInfo: this.fb.group(this.model.buildContactInfoTab(true)),

    });
  }

  destroyPopup(): void {
  }


  initPopup(): void {
    this.loadActivityTypes();
  }

  prepareModel(model: CharityOrganizationProfileExtraData, form: UntypedFormGroup): Observable<CharityOrganizationProfileExtraData> | CharityOrganizationProfileExtraData {
    let formObjectWithoutViewOnlyProperties = this.removeViewOnlyProperties(form.value);

    return (new CharityOrganizationProfileExtraData()).clone({...model, ...formObjectWithoutViewOnlyProperties});
  }

  saveFail(error: Error): void {
  }

  loadActivityTypes() {
    this.adminLookupService.load(AdminLookupTypeEnum.ACTIVITY_TYPE).subscribe(list => {
      this.activityTypes = list;
    });
  }

  isNotValidForm() {
    return this.form.invalid;
  }

  removeViewOnlyProperties(formObject: any): Partial<CharityOrganizationProfileExtraData> {
    delete formObject.arName;
    delete formObject.enName;
    delete formObject.establishmentDate;
    delete formObject.publishDate;
    delete formObject.registrationDate;
    return  formObject;
  }

  onProfileContactOfficersChanged(officers: Officer[]) {
    this.model.contactOfficer = officers;
  }

  onProfileComplianceOfficersChanged(officers: Officer[]) {
    this.model.complianceOfficer = officers;
  }
}
