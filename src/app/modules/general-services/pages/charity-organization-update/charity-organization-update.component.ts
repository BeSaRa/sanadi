import {
  AfterViewInit,
  Component,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { FileExtensionsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { AdminLookup } from '@app/models/admin-lookup';
import { CharityOrganizationUpdate } from '@app/models/charity-organization-update';
import { AdminLookupService } from '@app/services/admin-lookup.service';
import { CharityOrganizationUpdateService } from '@app/services/charity-organization-update.service';
import { DialogService } from '@app/services/dialog.service';
import { EmployeeService } from '@app/services/employee.service';
import { LangService } from '@app/services/lang.service';
import { Observable } from 'rxjs';
import { OrganizationOfficersComponent } from '../../shared/organization-officers/organization-officers.component';

@Component({
  selector: 'charity-organization-update',
  templateUrl: './charity-organization-update.component.html',
  styleUrls: ['./charity-organization-update.component.scss'],
})
export class CharityOrganizationUpdateComponent
  extends EServicesGenericComponent<
  CharityOrganizationUpdate,
  CharityOrganizationUpdateService
  >
  implements AfterViewInit {
  form!: UntypedFormGroup;
  tabs: IKeyValue[] = [];
  logoFile?: File;
  fileExtensionsEnum = FileExtensionsEnum;
  activityTypes: AdminLookup[] = [];

  contactInformationInputs: IKeyValue[] = [
    { controlName: 'phone', label: this.lang.map.lbl_phone },
    { controlName: 'email', label: this.lang.map.lbl_email },
    { controlName: 'website', label: this.lang.map.website },
    { controlName: 'zoneNumber', label: this.lang.map.lbl_zone },
    { controlName: 'streetNumber', label: this.lang.map.lbl_street },
    { controlName: 'buildingNumber', label: this.lang.map.building_number },
    { controlName: 'address', label: this.lang.map.lbl_address },
    { controlName: 'facebook', label: this.lang.map.facebook },
    { controlName: 'twitter', label: this.lang.map.twitter },
    { controlName: 'instagram', label: this.lang.map.instagram },
    { controlName: 'youTube', label: this.lang.map.youtube },
    { controlName: 'snapChat', label: this.lang.map.snapchat }
  ];


  @ViewChild(OrganizationOfficersComponent, { static: true }) organizationRefs!: OrganizationOfficersComponent;

  @ViewChildren('tabContent', { read: TemplateRef })
  tabsTemplates!: QueryList<TemplateRef<any>>;

  get metaDataForm(): UntypedFormGroup {
    return this.form.get('metaData') as UntypedFormGroup;
  }
  get contactInformationForm(): UntypedFormGroup {
    return this.form.get('contactInformation') as UntypedFormGroup;
  }
  constructor(
    public lang: LangService,
    public fb: UntypedFormBuilder,
    public service: CharityOrganizationUpdateService,
    private employeeService: EmployeeService,
    private dialog: DialogService,
    private adminLookupService: AdminLookupService
  ) {
    super();
  }

  ngAfterViewInit(): void {
    const tabsTemplates = this.tabsTemplates.toArray();
    setTimeout(() => {
      console.log(this.organizationRefs)
      this.tabs = [
        {
          name: 'metaDataTab',
          template: tabsTemplates[0],
          title: this.lang.map.meta_data,
          validStatus: () => !!this.form && this.metaDataForm.valid,
        },
        {
          name: 'contactInformationTab',
          template: tabsTemplates[1],
          title: this.lang.map.contact_information,
          validStatus: () => !!this.form && this.contactInformationForm.valid,
        },
        {
          name: 'complainceOfficerTab',
          template: tabsTemplates[2],
          title: this.lang.map.complaince_office_data,
          validStatus: () => true,
        },
      ];
      if (!this.accordionView) {
        this.tabs.push({
          name: 'attachmentsTab',
          template: tabsTemplates[tabsTemplates.length - 1],
          title: this.lang.map.attachments,
          validStatus: () => true,
        });
      }
    }, 0);
  }
  getTabInvalidStatus(i: number): boolean {
    if (i >= 0 && i < this.tabs.length) {
      return !this.tabs[i].validStatus();
    }
    return true;
  }

  setLogoFile(file: File | File[] | undefined): void {
    if (!file || file instanceof File) {
      this.logoFile = file;
    } else {
      this.logoFile = file[0];
    }
  }
  _getNewInstance(): CharityOrganizationUpdate {
    return new CharityOrganizationUpdate();
  }
  _initComponent(): void {
    this.loadActivityTypes();
  }
  loadActivityTypes() {
    this.adminLookupService
      .load(AdminLookupTypeEnum.ACTIVITY_TYPE)
      .subscribe((list) => {
        this.activityTypes = list;
      });
  }
  _buildForm(): void {
    const model = this._getNewInstance();
    this.form = this.fb.group({
      metaData: this.fb.group(model.buildMetaDataForm()),
      contactInformation: this.fb.group(model.buildContactInformationForm()),
    });
  }

  _afterBuildForm(): void { }
  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    return true;
  }
  _beforeLaunch(): boolean | Observable<boolean> {
    throw new Error('Method not implemented.');
  }
  _afterLaunch(): void {
    throw new Error('Method not implemented.');
  }
  _prepareModel():
    | CharityOrganizationUpdate
    | Observable<CharityOrganizationUpdate> {
    console.log(this.form.value);
    return new CharityOrganizationUpdate().clone({
      ...this.contactInformationForm.value,
      ...this.metaDataForm.value,
    });
  }
  _afterSave(
    model: CharityOrganizationUpdate,
    saveType: SaveTypes,
    operation: OperationTypes
  ): void {
    throw new Error('Method not implemented.');
  }
  _saveFail(error: any): void {
    throw new Error('Method not implemented.');
  }
  _launchFail(error: any): void {
    throw new Error('Method not implemented.');
  }
  _destroyComponent(): void {
    throw new Error('Method not implemented.');
  }
  _updateForm(model: CharityOrganizationUpdate | undefined): void {
    throw new Error('Method not implemented.');
  }
  _resetForm(): void {
    throw new Error('Method not implemented.');
  }
}
