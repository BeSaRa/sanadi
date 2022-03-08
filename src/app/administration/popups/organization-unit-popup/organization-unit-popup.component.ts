import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {OrgUnit} from '@app/models/org-unit';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {LangService} from '@app/services/lang.service';
import {Lookup} from '@app/models/lookup';
import {LookupCategories} from '@app/enums/lookup-categories';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {CustomValidators} from '@app/validators/custom-validators';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {FileStore} from '@app/models/file-store';
import {DialogService} from '@app/services/dialog.service';
import {ExceptionHandlerService} from '@app/services/exception-handler.service';
import {DateUtils} from '@app/helpers/date-utils';
import {FileExtensionsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {OrgUnitField} from '@app/models/org-unit-field';
import {OrgUnitFieldService} from '@app/services/org-unit-field.service';
import {OrganizationUnitService} from '@app/services/organization-unit.service';
import {IAngularMyDpOptions} from 'angular-mydatepicker';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {CommonUtils} from '@app/helpers/common-utils';

@Component({
  selector: 'app-organization-unit-popup',
  templateUrl: './organization-unit-popup.component.html',
  styleUrls: ['./organization-unit-popup.component.scss']
})
export class OrganizationUnitPopupComponent extends AdminGenericDialog<OrgUnit> implements AfterViewInit {
  constructor(public dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<OrgUnit>,
              private lookupService: LookupService,
              public fb: FormBuilder,
              private cd: ChangeDetectorRef,
              private toast: ToastService,
              public langService: LangService,
              private dialogService: DialogService,
              private orgUnitService: OrganizationUnitService,
              private exceptionHandlerService: ExceptionHandlerService,
              private orgUnitFieldService: OrgUnitFieldService) {
    super();
    this.operation = data.operation;
    this.model = data.model;
  }

  @ViewChild('dialogContent') dialogContent!: ElementRef;
  @ViewChild('logoUploader') logoUploader!: ElementRef;

  form!: FormGroup;
  model!: OrgUnit;
  operation: OperationTypes;
  saveVisible = true;

  orgUnitTypesList: Lookup[] = [];
  orgUnitStatusList: Lookup[] = [];
  orgUnitsList: OrgUnit[] = [];
  cityList: Lookup[] = [];
  licensingAuthorityList: Lookup[] = [];
  workFieldList: Lookup[] = [];
  orgUnitFieldList: OrgUnitField[] = [];

  tabsData: IKeyValue = {
    basic: {
      name: 'basic',
      langKey: 'lbl_basic_info',
      validStatus: () => this.form && this.basicInfoGroup && this.basicInfoGroup.valid
    },
    advanced: {
      name: 'advanced',
      langKey: 'advanced',
      validStatus: () => this.form && this.advancedGroup && this.advancedGroup.valid
    },
    services: {
      name: 'services',
      langKey: 'link_services',
      validStatus: () => true
    },
    branches: {
      name: 'branches',
      langKey: 'lbl_org_branches',
      validStatus: () => true
    }
  };

  datepickerControlsMap: { [key: string]: FormControl } = {};
  datepickerOptionsMap: { [key: string]: IAngularMyDpOptions } = {
    registryDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'}),
    establishmentDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    budgetClosureDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
  };

  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  logoPath: string = '';
  logoFile: any;
  logoExtensions: string[] = [FileExtensionsEnum.PNG, FileExtensionsEnum.JPG, FileExtensionsEnum.JPEG];

  private _afterViewInit(): void {
    if (this.operation === OperationTypes.UPDATE) {
      this.displayFormValidity(null, this.dialogContent.nativeElement);
    }
    if (this.operation !== OperationTypes.CREATE) {
      this.orgCodeField && this.orgCodeField.disable();
    }
    this._buildDatepickerControlsMap();
  }

  ngAfterViewInit(): void {
    // used the private function to reuse functionality of afterViewInit if needed
    this._afterViewInit();

    this.cd.detectChanges();
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.langService.map.lbl_add_org_unit;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.langService.map.lbl_edit_org_unit;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.langService.map.view;
    }
    return '';
  }

  initPopup(): void {
    this.loadOrgUnitFields();
    this.orgUnitsList = this.orgUnitService.list;
    this.orgUnitTypesList = this.lookupService.getByCategory(LookupCategories.ORG_UNIT_TYPE);
    this.orgUnitStatusList = this.lookupService.getByCategory(LookupCategories.ORG_STATUS);
    this.cityList = this.lookupService.listByCategory.Countries;
    this.licensingAuthorityList = this.lookupService.getByCategory(LookupCategories.LICENSING_AUTHORITY);
    this.workFieldList = this.lookupService.getByCategory(LookupCategories.WORK_FIELD);
  }

  loadOrgUnitFields() {
    this.orgUnitFieldService.loadComposite().subscribe(list => {
      this.orgUnitFieldList = list;
    });
  }

  setDialogButtonsVisibility(tab: any): void {
    this.saveVisible = !(tab.name && (tab.name === this.tabsData.branches.name || tab.name === this.tabsData.services.name));
    this.validateFieldsVisible = !(tab.name && (tab.name === this.tabsData.branches.name || tab.name === this.tabsData.services.name));
  }

  buildForm(): void {
    this.form = this.fb.group({
      basic: this.fb.group(this.model.buildFormBasic(true), {
        validators: this.model.setBasicFormCrossValidations()
      }),
      advanced: this.fb.group(this.model.buildFormAdvanced(true), {
        validators: this.model.setAdvancedFormCrossValidations
      })
    });

    if (this.operation === OperationTypes.UPDATE) {
      if (this.model.logo) {
        this.logoPath = OrganizationUnitPopupComponent._changeByteArrayToBase64(this.model.logo);
      }
    }
  }

  private _buildDatepickerControlsMap(): void {
    this.datepickerControlsMap = {
      registryDate: this.registryDateField,
      establishmentDate: this.establishmentDateField,
      budgetClosureDate: this.budgetClosureDateField
    };
  }

  get basicInfoGroup(): FormGroup {
    return this.form.get('basic') as FormGroup;
  }

  get advancedGroup(): FormGroup {
    return this.form.get('advanced') as FormGroup;
  }

  get orgCodeField(): FormControl {
    return this.basicInfoGroup.get('orgCode') as FormControl;
  }

  get registryDateField(): FormControl {
    return this.basicInfoGroup.get('registryDate') as FormControl;
  }

  get establishmentDateField(): FormControl {
    return this.advancedGroup.get('establishmentDate') as FormControl;
  }

  get budgetClosureDateField(): FormControl {
    return this.advancedGroup.get('budgetClosureDate') as FormControl;
  }

  get arabicBoardMembersField(): FormControl {
    return this.advancedGroup.get('arabicBoardMembers') as FormControl;
  }

  get englishBoardMembersField(): FormControl {
    return this.advancedGroup.get('enBoardMembers') as FormControl;
  }

  beforeSave(model: OrgUnit, form: FormGroup): boolean | Observable<boolean> {
    let updatedOrgUnit = this._getUpdatedValues(model, this.form);
    if (this.isDuplicatedOrganizationNames(updatedOrgUnit)) {
      return false;
    }

    const invalidTabs = this._getInvalidTabs();
    if (invalidTabs.length > 0) {
      const listHtml = CommonUtils.generateHtmlList(this.langService.map.msg_following_tabs_valid, invalidTabs);
      this.dialogService.error(listHtml.outerHTML);
      return false;
    } else {
      return true;
    }
  }

  private _getUpdatedValues(model: OrgUnit, form?: FormGroup): OrgUnit {
    if (!form) {
      form = this.form;
    }
    return (new OrgUnit()).clone({...model, ...form.value.basic, ...form.value.advanced});
  }

  prepareModel(model: OrgUnit, form: FormGroup): OrgUnit | Observable<OrgUnit> {
    return this._getUpdatedValues(model, form);
  }

  afterSave(model: OrgUnit, dialogRef: DialogRef): void {
    const message = (this.operation === OperationTypes.CREATE)
      ? this.langService.map.msg_create_x_success
      : this.langService.map.msg_update_x_success;
    this.model = model;
    this.operation = OperationTypes.UPDATE;

    if (!this.logoFile) {
      this.toast.success(message.change({x: model.getName()}));
      return;
    }

    model.saveLogo(this.logoFile)
      .pipe(
        catchError((err) => {
          this.exceptionHandlerService.handle(err);
          return of(null);
        })
      )
      .subscribe((result: boolean | null) => {
        if (!result) {
          return;
        }
        this._clearLogoUploader();
        this.toast.success(message.change({x: model.getName()}));
      });
  }

  saveFail(error: Error): void {
  }

  isDuplicatedOrganizationNames(orgUnit: OrgUnit) {
    let isDuplicatedArabicName = false, isDuplicatedEnglishName = false;

    if (this._isDuplicatedOrganizationArabicName(orgUnit)) {
      this.toast.error(this.langService.map.arabic_name_is_duplicated);
      isDuplicatedArabicName = true;
    }

    if (this._isDuplicatedOrganizationEnglishName(orgUnit)) {
      this.toast.error(this.langService.map.english_name_is_duplicated);
      isDuplicatedEnglishName = true;
    }

    return isDuplicatedArabicName || isDuplicatedEnglishName;
  }

  private _isDuplicatedOrganizationArabicName(orgUnit: OrgUnit) {
    return this.orgUnitsList
      .filter(org => org.id != orgUnit.id)
      .some(org => org.arName == orgUnit.arName);
  }

  private _isDuplicatedOrganizationEnglishName(orgUnit: OrgUnit) {
    return this.orgUnitsList
      .filter(org => org.id != orgUnit.id)
      .some(org => org.enName == orgUnit.enName);
  }

  openFileBrowser($event: MouseEvent): void {
    $event?.stopPropagation();
    $event?.preventDefault();
    this.logoUploader?.nativeElement.click();
  }

  onLogoSelected($event: Event): void {
    let files = ($event.target as HTMLInputElement).files;
    if (files && files[0]) {
      const extension = files[0].name.getExtension().toLowerCase();
      if (this.logoExtensions.indexOf(extension) === -1) {
        this.dialogService.error(this.langService.map.msg_invalid_format_allowed_formats.change({formats: this.logoExtensions.join(', ')}));
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
      };

    }
  }

  private _clearLogoUploader(): void {
    this.logoFile = null;
    this.logoUploader.nativeElement.value = "";
  }

  removeLogo($event: MouseEvent): void {
    $event.preventDefault();
    this.logoPath = '';
    this._clearLogoUploader();
  }

  addArabicBoardMembers(name: string) {
    if (!(CustomValidators.validationPatterns.AR_ONLY.test(name))) {
      return null;
    }
    return name;
  }

  addEnglishBoardMembers(name: string) {
    if (!(CustomValidators.validationPatterns.ENG_ONLY.test(name))) {
      return null;
    }
    return name;
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  private static _changeByteArrayToBase64(fileInfo: FileStore): string {
    return 'data:' + fileInfo.mimeType + ';base64,' + fileInfo.fileContents;
  }

  private _getInvalidTabs(): any {
    let failedList: string[] = [];
    for (const key in this.tabsData) {
      if (!(this.tabsData[key].validStatus())) {
        // @ts-ignore
        failedList.push(this.langService.map[this.tabsData[key].langKey]);
      }
    }
    return failedList;
  }

  destroyPopup(): void {
  }
}
