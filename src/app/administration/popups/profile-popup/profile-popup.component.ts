import {Component, Inject} from '@angular/core';
import {AbstractControl, FormControl, UntypedFormBuilder, UntypedFormGroup,} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {ProfileTypes} from '@app/enums/profile-types.enum';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {Profile} from '@app/models/profile';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {ProfileServiceService} from '@app/services/profile-service.service';
import {ProfileService} from '@app/services/profile.service';
import {ProfileService as ProfileServiceModel} from '@app/models/profile-service';
import {ToastService} from '@app/services/toast.service';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable} from 'rxjs';
import {ServiceDataService} from '@app/services/service-data.service';
import {ServiceData} from '@app/models/service-data';
import {DialogService} from '@app/services/dialog.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {TabMap} from '@app/types/types';

@Component({
  selector: 'profile-popup',
  templateUrl: './profile-popup.component.html',
  styleUrls: ['./profile-popup.component.scss'],
})
export class ProfilePopupComponent extends AdminGenericDialog<Profile> {
  model!: Profile;
  form!: UntypedFormGroup;
  operation!: OperationTypes;
  actions: IMenuItem<ProfileServiceModel>[] = [
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      onClick: (item: ProfileServiceModel) => this.delete(item)
    },
  ];
  tabsData: TabMap = {
    basic: {
      name: 'basic',
      langKey: 'lbl_basic_info',
      index: 0,
      validStatus: () => {
        if (!this.basicInfoForm) {
          return false;
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
      isTouchedOrDirty: () => true
    },
  };
  showServicesTab = false;
  profileTypes = this.lookupService.listByCategory.ProfileType.sort((a, b) => a.lookupKey - b.lookupKey);
  status = this.lookupService.listByCategory.CommonStatus.filter((e) => !e.isRetiredCommonStatus());
  profileServicesColumns = ['service', 'actions'];
  profileServices: ProfileServiceModel[] = [];
  showRaca = false;
  services: ServiceData[] = [];
  registrationAuthorities: Profile[] = [];
  servicesControl = new FormControl<number[]>([]);

  private _loadServices() {
    return this.serviceData.loadAsLookups()
      .subscribe((result) => {
        this.services = result;
        this._filterExistingServices();
      });
  }

  private _filterExistingServices() {
    this.services = this.services.filter(service => !this.profileServices.find((profileService) => profileService.serviceId === service.id));
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
              private profileServiceService: ProfileServiceService,
              private service: ProfileService,
              private serviceData: ServiceDataService,
              private dialogService: DialogService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }

  onTabChange($event: TabComponent) {
  }

  initPopup(): void {
    this.service.getByProfileType(ProfileTypes.REGISTERED_ENTITIES)
      .subscribe((e) => {
        this.registrationAuthorities = e;
      });
    if (this.operation) {
      this.profileTypeField.disable();
      this.loadLinkedServices(this.model.id);
      this._loadServices();
      this.showServicesTab = true;
    }
  }

  handleProfileType(profileType: number) {
    if (profileType === ProfileTypes.CHARITY || profileType === ProfileTypes.INSTITUTION) {
      this.showRaca = true;
      this.registrationAuthorityField?.patchValue(-1);
      this.registrationAuthorityField?.disable();
    } else {
      this.showRaca = false;
      this.registrationAuthorityField?.reset();
      this.registrationAuthorityField?.enable();
    }
  }

  destroyPopup(): void {
  }

  afterSave(model: Profile, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    debugger
    this.operation === this.operationTypes.CREATE
      ? this.toast.success(message.change({x: this.basicInfoForm?.get(this.lang.map.lang + 'Name')?.value || ''}))
      : this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    this.showServicesTab = true;
    this.operation = OperationTypes.UPDATE;
    this.loadLinkedServices(model.id);
  }

  loadLinkedServices(id: number) {
    this.profileServiceService.getServicesByProfile(id)
      .subscribe((result) => {
        this.profileServices = result;
        this._filterExistingServices();
      });
  }

  beforeSave(model: Profile, form: UntypedFormGroup): boolean | Observable<boolean> {
    return this.form.valid;
  }

  prepareModel(model: Profile, form: UntypedFormGroup): Profile | Observable<Profile> {
    const basicInfo = form.get('basicInfo')?.value;
    return new Profile().clone({...model, ...basicInfo,});
  }

  saveFail(error: Error): void {
  }

  buildForm(): void {
    this.form = this.fb.group({
      basicInfo: this.fb.group(this.model.buildForm()),
    });
    if (this.operation === OperationTypes.VIEW) {
      this.form.disable();
      this.servicesControl.disable();
    }
    if (this.model?.profileType) {
      this.handleProfileType(this.model.profileType);
    }
  }

  addServices() {
    const _services = this.servicesControl.value!.map((e) =>
      new ProfileServiceModel().clone({
        profileId: this.model.id,
        serviceId: +e,
      })
    );
    this.profileServiceService.createBulk(_services).subscribe((e) => {
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
            this.lang.map.msg_delete_x_success.change({x: model.serviceDataInfo.getName()})
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
