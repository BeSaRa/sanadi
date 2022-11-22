import {Component, ElementRef, Inject, ViewChild} from '@angular/core';
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
import {Observable, of, Subject} from 'rxjs';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {AdminLookup} from '@app/models/admin-lookup';
import {AdminLookupService} from '@services/admin-lookup.service';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {IKeyValue} from '@contracts/i-key-value';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {Officer} from '@app/models/officer';
import {SafeResourceUrl} from '@angular/platform-browser';
import {FileExtensionsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {catchError, switchMap, takeUntil} from 'rxjs/operators';
import {BlobModel} from '@app/models/blob-model';
import {Branch} from '@app/models/branch';
import {FinalExternalOfficeApprovalResult} from '@app/models/final-external-office-approval-result';
import {FinalExternalOfficeApprovalService} from '@services/final-external-office-approval.service';

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

  @ViewChild('logoUploader') logoUploader!: ElementRef;
  logoPath!: SafeResourceUrl;
  logoFile: any;
  logoExtensions: string[] = [FileExtensionsEnum.PNG, FileExtensionsEnum.JPG, FileExtensionsEnum.JPEG];
  saveLogo$: Subject<void> = new Subject<void>();
  blob!: BlobModel;
  externalOffices$?: Observable<FinalExternalOfficeApprovalResult[]>;
  externalOfficesColumns = [
    'externalOfficeName',
    'country',
    'region',
    'establishmentDate',
    'actions',
  ];

  tabsData: IKeyValue = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info' as keyof ILanguageKeys,
      index: 0,
      validStatus: () => this.basicInfo && this.basicInfo.valid
    },
    logo: {
      name: 'logoTab',
      langKey: 'logo' as keyof ILanguageKeys,
      index: 1
    },
    contactInfo: {
      name: 'contactInfoTab',
      langKey: 'contact_info' as keyof ILanguageKeys,
      index: 2,
      validStatus: () => this.contactInfo && this.contactInfo.valid
    },
    contactOfficers: {
      name: 'contactOfficersTab',
      langKey: 'contact_officers_details' as keyof ILanguageKeys,
      index: 3,
      validStatus: () => this.model.contactOfficerList && this.model.contactOfficerList.length > 0
    },
    complianceOfficers: {
      name: 'complianceOfficersTab',
      langKey: 'compliance_officers_details' as keyof ILanguageKeys,
      index: 4,
      validStatus: () => this.model.complianceOfficerList && this.model.complianceOfficerList.length > 0
    },
    internalBranches: {
      name: 'internalBranchesTab',
      langKey: 'internal_branches' as keyof ILanguageKeys,
      index: 5,
      validStatus: () => this.model.branchList && this.model.branchList.length > 0
    },
    externalOffices: {
      name: 'externalOfficesTab',
      langKey: 'external_offices' as keyof ILanguageKeys,
      index: 6
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
              private adminLookupService: AdminLookupService,
              private finalExternalOfficeApprovalService: FinalExternalOfficeApprovalService) {
    super();
    this.model = data.model;
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
    this.listenToSaveLogo();
    this.setCurrentLogo();
    this.externalOffices$ = this.finalExternalOfficeApprovalService.licenseSearch({
      organizationId: this.model.profileId,
    });
  }

  prepareModel(model: CharityOrganizationProfileExtraData, form: UntypedFormGroup): Observable<CharityOrganizationProfileExtraData> | CharityOrganizationProfileExtraData {
    let formObjectWithoutViewOnlyProperties = this.removeViewOnlyProperties({...this.basicInfo.getRawValue(), ...this.contactInfo.getRawValue()});
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
    return formObject;
  }

  onProfileContactOfficersChanged(officers: Officer[]) {
    this.model.contactOfficerList = officers;
  }

  onProfileComplianceOfficersChanged(officers: Officer[]) {
    this.model.complianceOfficerList = officers;
  }

  onProfileBranchesChanged(branches: Branch[]) {
    console.log('branches from main component', branches);
    this.model.branchList = branches;
  }

  // logo functionality
  openFileBrowser($event: MouseEvent): void {
    $event?.stopPropagation();
    $event?.preventDefault();
    this.logoUploader?.nativeElement.click();
  }

  onLogoSelected($event: Event): void {
    this.saveLogoAfterSelect($event);
  }

  private _clearLogoUploader(): void {
    this.logoFile = null;
    this.logoUploader.nativeElement.value = '';
  }

  removeLogo($event: MouseEvent): void {
    $event.preventDefault();
    this.logoPath = '';
    this._clearLogoUploader();
  }

  listenToSaveLogo() {
    this.saveLogo$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        return this.model.saveLogo(this.logoFile).pipe(
          catchError(_ => of(null))
        );
      })
    ).subscribe((success) => {
      if (success) {
        this.toast.success(this.lang.map.msg_save_stamp_for_x_success.change({x: this.model.getName()}));
      }
    });
  }

  saveLogoAfterSelect($event: Event) {
    let files = ($event.target as HTMLInputElement).files;
    if (files && files[0]) {
      const extension = files[0].name.getExtension().toLowerCase();
      if (this.logoExtensions.indexOf(extension) === -1) {
        this.dialogService.error(this.lang.map.msg_invalid_format_allowed_formats.change({formats: this.logoExtensions.join(', ')}));
        this.logoPath = '';
        this._clearLogoUploader();
        return;
      }

      let reader = new FileReader();
      reader.readAsDataURL(files[0]);

      reader.onload = (event) => {
        // @ts-ignore
        this.logoPath = event.target.result as string;
        // @ts-ignore
        this.logoFile = files[0];

        // save stamp file to department
        this.saveLogo$.next();
      };
    }
  }

  setCurrentLogo() {
    this.model.getLogo().subscribe((file) => {
      if (file.blob.type === 'error' || file.blob.size === 0) {
        return;
      }
      this.blob = file;
      this.logoPath = file.safeUrl;
    });
  }
}
