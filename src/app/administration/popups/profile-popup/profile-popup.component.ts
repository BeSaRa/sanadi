import { ProfileCountryService } from './../../../services/profile-country.service';
import { ProfileCountry } from '@app/models/profile-country';
import { CountryService } from '@services/country.service';
import { takeUntil } from 'rxjs/operators';
import { Country } from '@app/models/country';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, UntypedFormBuilder, UntypedFormGroup, } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { ProfileTypes } from '@app/enums/profile-types.enum';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { Profile } from '@app/models/profile';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ProfileServiceRelationService } from '@services/profile-service-relation.service';
import { ProfileService } from '@app/services/profile.service';
import { ProfileServiceRelation as ProfileServiceModel } from '@app/models/profile-service-relation';
import { ToastService } from '@app/services/toast.service';
import { TabComponent } from '@app/shared/components/tab/tab.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable, Subject } from 'rxjs';
import { ServiceDataService } from '@app/services/service-data.service';
import { ServiceData } from '@app/models/service-data';
import { DialogService } from '@app/services/dialog.service';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { TabMap } from '@app/types/types';
import { EmployeeService } from '@services/employee.service';
import { PermissionsEnum } from '@app/enums/permissions-enum';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'profile-popup',
  templateUrl: './profile-popup.component.html',
  styleUrls: ['./profile-popup.component.scss'],
})
export class ProfilePopupComponent extends AdminGenericDialog<Profile> implements AfterViewInit {
  model!: Profile;
  form!: UntypedFormGroup;
  operation!: OperationTypes;
  saveVisible: boolean = true;
  countriesList: Country[] = [];
  actions: IMenuItem<ProfileServiceModel>[] = [
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      onClick: (item: ProfileServiceModel) => this.delete(item)
    },
  ];
  profileCountryActions: IMenuItem<ProfileCountry>[] = [
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      onClick: (item: ProfileCountry) => this.deleteCountry(item)
    },
  ];
  tabsData: TabMap = {
    basic: {
      name: 'basic',
      langKey: 'lbl_basic_info',
      index: 0,
      validStatus: () => {
        if (!this.basicInfoForm || this.basicInfoForm.disabled) {
          return true;
        }
        return this.basicInfoForm.valid;
      },
      isTouchedOrDirty: () => true
    },
    services: {
      name: 'linkServices',
      langKey: 'link_services',
      index: 1,
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      show: () => {
        return (this.operation !== OperationTypes.CREATE && this.employeeService.checkPermissions(PermissionsEnum.MANAGE_PROFILE_SERVICE_DATA));
      }
    },
    countries: {
      name: 'countries',
      langKey: 'country_countries',
      index: 1,
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      show: () => {
        return false;
        // return (this.operation !== OperationTypes.CREATE && this.employeeService.checkPermissions(PermissionsEnum.MANAGE_PROFILE_COUNTRIES_DATA));
      }
    },
    attachments: {
      name: 'attachments',
      langKey: 'attachments',
      index: 2,
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      show: () => {
        return this.operation !== OperationTypes.CREATE;
      }
    },
  };
  profileTypes = this.lookupService.listByCategory.ProfileType.sort((a, b) => a.lookupKey - b.lookupKey);
  status = this.lookupService.listByCategory.CommonStatus.filter((e) => !e.isRetiredCommonStatus());
  permitTypes = this.lookupService.listByCategory.ProjectPermitType.sort((a, b) => a.lookupKey - b.lookupKey)
  submissionMechanisms = this.lookupService.listByCategory.SubmissionMechanism.sort((a, b) => a.lookupKey - b.lookupKey)
  profileServicesColumns = ['service', 'actions'];
  profileServices: ProfileServiceModel[] = [];
  profileCountriesColumns = ['country', 'actions'];
  profileCountries: ProfileCountry[] = [];
  showRaca = false;
  services: ServiceData[] = [];
  registrationAuthorities: Profile[] = [];
  servicesControl = new FormControl<number[]>([]);
  countryControl = new FormControl<number[]>([]);
  @ViewChild('dialogContent') dialogContent!: ElementRef;

  private _loadServices() {
    return this.serviceDataService.loadAsLookups()
      .subscribe((result) => {
        this.services = result;
        this._filterExistingServices();
      });
  }

  private loadCountries(): void {
    this.countryService.loadAsLookups()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => {
        this.countriesList = countries;
        this._filterExistingCountries();
      });
  }
  private _filterExistingServices() {
    this.services = this.services.filter(service => !this.profileServices.find((profileService) => profileService.serviceId === service.id));
  }

  private _filterExistingCountries() {
    this.countriesList = this.countriesList.filter(country => !this.profileCountries.find((profileService) => profileService.countryId === country.id));
  }

  get readonly(): boolean {
    return this.operation === OperationTypes.VIEW;
  }

  get OperationTypes() {
    return OperationTypes;
  }

  get basicInfoForm(): AbstractControl | null {
    return this.form.get('basicInfo');
  }

  get registrationAuthorityField() {
    return this.basicInfoForm?.get('registrationAuthority') as FormControl;
  }

  get profileTypeField() {
    return this.basicInfoForm?.get('profileType') as FormControl;
  }

  constructor(private lookupService: LookupService,
    public fb: UntypedFormBuilder,
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<Profile>,
    private toast: ToastService,
    public lang: LangService,
    private cd: ChangeDetectorRef,
    private profileServiceRelationService: ProfileServiceRelationService,
    private profileCountryService: ProfileCountryService,
    private employeeService: EmployeeService,
    private countryService: CountryService,
    private service: ProfileService,
    private serviceDataService: ServiceDataService,
    private dialogService: DialogService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }

  ngAfterViewInit() {
    if (this.operation === OperationTypes.UPDATE) {
      this.displayFormValidity(null, this.dialogContent.nativeElement);
    }
    if (this.readonly) {
      this.validateFieldsVisible = false;
      this.saveVisible = false;
    }
    this.cd.detectChanges();
  }

  onTabChange(_$event: TabComponent) {
  }
  initPopup(): void {
    this.service.getByProfileType(ProfileTypes.REGISTERED_ENTITIES)
      .subscribe((e) => {
        this.registrationAuthorities = e;
      });

    if (this.operation !== OperationTypes.CREATE) {
      this.profileTypeField.disable();
      this.loadLinkedServices(this.model.id);
      // this.loadLinkedCountries(this.model.id);
      this._loadServices();
      // this.loadCountries();
    }
  }

  handleProfileType(profileType: number, skipReset = false) {
    if (profileType === ProfileTypes.CHARITY || profileType === ProfileTypes.INSTITUTION) {
      this.showRaca = true;
      this.registrationAuthorityField?.patchValue(-1);
      this.registrationAuthorityField?.disable();
    } else {
      this.showRaca = false;
      if (!skipReset) {
        this.registrationAuthorityField?.reset();
      }
      this.registrationAuthorityField?.enable();
    }
  }

  destroyPopup(): void {
  }

  afterSave(model: Profile, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.operation === this.operationTypes.CREATE
      ? this.toast.success(message.change({ x: this.basicInfoForm?.get(this.lang.map.lang + 'Name')?.value || '' }))
      : this.toast.success(message.change({ x: model.getName() }));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    this.loadLinkedServices(model.id);
    // this.loadLinkedCountries(model.id);
  }

  loadLinkedServices(id: number) {
    if (!this.employeeService.checkPermissions(PermissionsEnum.MANAGE_PROFILE_SERVICE_DATA)) {
      return;
    }
    this.profileServiceRelationService.getServicesByProfile(id)
      .subscribe((result) => {
        this.profileServices = result;
        this._filterExistingServices();
      });
  }

  loadLinkedCountries(id: number) {
    if (!this.employeeService.checkPermissions(PermissionsEnum.MANAGE_PROFILE_COUNTRIES_DATA)) {
      return;
    }
    this.profileCountryService.getCountriesByProfile(id)
      .subscribe((result) => {
        this.profileCountries = result;
        this._filterExistingCountries();
      });
  }

  beforeSave(model: Profile, form: UntypedFormGroup): boolean | Observable<boolean> {
    return this.form.valid;
  }

  prepareModel(model: Profile, form: UntypedFormGroup): Profile | Observable<Profile> {
    const basicInfo = form.get('basicInfo')?.value;
    return new Profile().clone({ ...model, ...basicInfo });
  }

  saveFail(error: Error): void {
  }

  buildForm(): void {
    this.form = this.fb.group({
      basicInfo: this.fb.group(this.model.buildForm()),
    });
    if (this.readonly) {
      this.form.disable();
      this.servicesControl.disable();
      // this.countryControl.disable();
    }
    if (this.model?.profileType) {
      this.handleProfileType(this.model.profileType, true);
    }
  }

  addServices() {
    const _services = this.servicesControl.value!.map((e) =>
      new ProfileServiceModel().clone({
        profileId: this.model.id,
        serviceId: +e,
      })
    );
    this.profileServiceRelationService.createBulk(_services).subscribe((_e) => {
      this.loadLinkedServices(this.model.id);
      this.toast.success(this.lang.map.services_add_successfully);
      this.servicesControl.reset();
    });
  }

  delete(model: ProfileServiceModel): void {
    const message = this.lang.map.remove_service_messages;
    this.dialogService.confirm(message).onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
          this.loadLinkedServices(this.model.id);
          // @ts-ignore
          this.toast.success(
            this.lang.map.msg_delete_x_success.change({ x: model.serviceDataInfo.getName() })
          );
          sub.unsubscribe();
        });
      }
    });
  }
  // createBulk
  addCountries() {
    const _countries = this.countryControl.value!.map((e) =>
      new ProfileCountry().clone({
        profileId: this.model.id,
        countryId: +e,
      })
    );
    this.profileCountryService.createBulk(_countries).subscribe((_e) => {
      this.loadLinkedCountries(this.model.id);
      this.toast.success(this.lang.map.countries_add_successfully);
      this.countryControl.reset();
    });
  }
  deleteCountry(model: ProfileCountry): void {
    const message = this.lang.map.remove_countries_messages;
    this.dialogService.confirm(message).onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
          this.loadLinkedCountries(this.model.id);
          // @ts-ignore
          this.toast.success(
            this.lang.map.msg_delete_x_success
            // .change({ x: model.serviceDataInfo.getName() })
          );
          sub.unsubscribe();
        });
      }
    });
  }
  searchNgSelect(searchText: string, item: any): boolean {
    return item.ngSelectSearch(searchText);
  }
}
